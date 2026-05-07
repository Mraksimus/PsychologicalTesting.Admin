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
import { auth, profile } from "./endpoints"

type Profile = Awaited<ReturnType<typeof profile.me>>

type AuthState = {
  token: string | null
  profile: Profile | null
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
  const [loading, setLoading] = useState<boolean>(!!getToken())
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setProfile(null)
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const me = await profile.me()
      setProfile(me)
      setError(null)
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setToken(null)
        setLocalToken(null)
        setProfile(null)
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
      setToken(result.value)
      setLocalToken(result.value)
      const me = await profile.me()
      setProfile(me)
    },
    [],
  )

  const logout = useCallback(() => {
    setToken(null)
    setLocalToken(null)
    setProfile(null)
  }, [])

  const value = useMemo<AuthState>(
    () => ({
      token,
      profile: profileData,
      loading,
      error,
      login,
      logout,
      refresh,
    }),
    [token, profileData, loading, error, login, logout, refresh],
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

export function RequireAuth({ children }: { children: ReactNode }) {
  const { token, loading } = useAuth()
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

  return <>{children}</>
}
