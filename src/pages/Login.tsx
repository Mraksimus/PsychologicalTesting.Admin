import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/api/auth-context"
import { ApiError } from "@/api/client"

export default function Login() {
  const navigate = useNavigate()
  const { login, token, loading } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && token) {
      navigate("/home", { replace: true })
    }
  }, [loading, token, navigate])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email.trim(), password)
      navigate("/home", { replace: true })
    } catch (err) {
      if (err instanceof ApiError) {
        setError(
          err.status === 401
            ? "Неверный email или пароль"
            : err.message,
        )
      } else {
        setError("Не удалось войти. Попробуйте позже.")
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="p-6">
        <div className="font-mono text-xs text-muted-foreground">
          (Press <kbd>d</kbd> to toggle dark mode)
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center">
        <form
          onSubmit={handleLogin}
          className="w-full max-w-md space-y-6 px-6"
        >
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-semibold text-foreground">
              Вход в аккаунт
            </h1>
            <p className="text-muted-foreground">
              Введи логин и пароль от аккаунта
            </p>
          </div>

          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Введи email"
              className="h-12"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Введи пароль"
              className="h-12"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error ? (
            <p className="text-center text-sm text-red-500">{error}</p>
          ) : null}

          <div className="space-y-3">
            <Button
              type="submit"
              className="w-full h-12"
              disabled={submitting}
            >
              {submitting ? "Входим..." : "Войти в аккаунт"}
            </Button>

            <Button
              type="button"
              variant="secondary"
              className="w-full h-12"
              disabled
            >
              Не помню пароль
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
