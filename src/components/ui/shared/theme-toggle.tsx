// components/ThemeToggle.tsx
import { Moon, Sun } from "lucide-react"
import { useTheme } from "@/components/theme-provider"  // ← свой хук, не next-themes!
import { Button } from "@/components/ui/button"
import type { ComponentProps } from "react"

type ThemeToggleProps = Pick<ComponentProps<typeof Button>, "size" | "variant" | "className">

export function ThemeToggle({ size = "icon", variant = "outline", className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Сменить тему</span>
    </Button>
  )
}
