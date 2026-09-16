import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"
import type { ReactNode } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { ApiError, getToken, setToken } from "./client"
import { adminMe, auth, profile } from "./endpoints"
import type { Permission } from "./types"

type Profile = Awaited<ReturnType<typeof profile.me>>

type AuthState = {
  token: string | null
  profile: Profile | null
  permissions: Permission[]
  hasPermission: (perm: Permission) => boolean
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setLocalToken] = useState<string | null>(getToken())
  const [profileData, setProfile] = useState<Profile | null>(null)
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState<boolean>(!!getToken())
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setProfile(null)
      setPermissions([])
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const [me, meAdmin] = await Promise.all([
        profile.me(),
        adminMe.get().catch((err) => {
          // If forbidden, drop admin access
          if (err instanceof ApiError && err.status === 403) {
            return { role: null, permissions: [] as Permission[] }
          }
          throw err
        }),
      ])
      setProfile(me)
      setPermissions(meAdmin.permissions)
      setError(null)
      if (meAdmin.permissions.length === 0) {
        // Not an admin — invalidate token
        setToken(null)
        setLocalToken(null)
        setProfile(null)
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setToken(null)
        setLocalToken(null)
        setProfile(null)
        setPermissions([])
      }
      setError(err instanceof Error ? err.message : "Unknown error")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const login = useCallback(
    async (email: string, password: string) => {
      const result = await auth.login(email, password)
      setToken(result.token)
      setLocalToken(result.token)
      const [me, meAdmin] = await Promise.all([
        profile.me(),
        adminMe.get(),
      ])
      setProfile(me)
      setPermissions(meAdmin.permissions)
    },
    [],
  )

  const logout = useCallback(() => {
    setToken(null)
    setLocalToken(null)
    setProfile(null)
    setPermissions([])
  }, [])

  const hasPermission = useCallback(
    (perm: Permission) =>
      permissions.includes("ADMIN") || permissions.includes(perm),
    [permissions],
  )

  const value = useMemo<AuthState>(
    () => ({
      token,
      profile: profileData,
      permissions,
      hasPermission,
      loading,
      error,
      login,
      logout,
      refresh,
    }),
    [token, profileData, permissions, hasPermission, loading, error, login, logout, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return ctx
}

export function RequireAuth({
  children,
  permission,
}: {
  children: ReactNode
  permission?: Permission
}) {
  const { token, loading, hasPermission, permissions } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Загрузка...
      </div>
    )
  }

  if (!token) {
    return <Navigate to="/" state={{ from: location }} replace />
  }

  if (permissions.length === 0) {
    return <Navigate to="/" replace />
  }

  if (permission && !hasPermission(permission)) {
    return <Navigate to="/home" replace />
  }

  return <>{children}</>
}
