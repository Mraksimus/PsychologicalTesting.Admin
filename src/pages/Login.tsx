import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function Login() {
  return (
    <div className="min-h-screen bg-background flex flex-col">

      {/* Верхняя панель */}
      <div className="p-6">
        <div className="font-mono text-xs text-muted-foreground">
          (Press <kbd>d</kbd> to toggle dark mode)
        </div>
      </div>

      {/* Центр */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-md space-y-6 px-6">

          {/* Заголовок */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-semibold text-foreground">
              Вход в аккаунт
            </h1>
            <p className="text-muted-foreground">
              Введи логин и пароль от аккаунта
            </p>
          </div>

          {/* Форма */}
          <div className="space-y-4">
            <Input
              type="email"
              placeholder="Введи email"
              className="h-12"
            />

            <Input
              type="password"
              placeholder="Введи пароль"
              className="h-12"
            />
          </div>

          {/* Кнопки */}
          <div className="space-y-3">
            <Button className="w-full h-12">
              Войти в аккаунт
            </Button>

            <Button variant="secondary" className="w-full h-12">
              Не помню пароль
            </Button>
          </div>

        </div>
      </div>
    </div>
  )
}