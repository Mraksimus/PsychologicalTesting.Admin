import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

import {
  ClipboardList,
  FileText,
  Shield,
  Tags,
  Users,
  User,
  LucideHome,
  ChevronUp,
  LogOut,
} from "lucide-react"

import { useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/api/auth-context"
import type { Permission } from "@/api/types"

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { profile, logout, hasPermission } = useAuth()

  const allItems: Array<{
    label: string
    icon: typeof LucideHome
    path: string
    permission?: Permission
  }> = [
    { label: "Главная", icon: LucideHome, path: "/home" },
    { label: "Пользователи", icon: Users, path: "/users", permission: "USERS_VIEW" },
    { label: "Роли", icon: Shield, path: "/roles", permission: "ROLES_VIEW" },
    { label: "Тесты", icon: FileText, path: "/tests", permission: "TESTS_VIEW" },
    { label: "Опросы", icon: ClipboardList, path: "/surveys", permission: "SURVEYS_VIEW" },
    { label: "Категории", icon: Tags, path: "/categories", permission: "CATEGORIES_VIEW" },
  ]

  const items = allItems.filter(
    (item) => !item.permission || hasPermission(item.permission),
  )

  const fullName = profile
    ? [profile.surname, profile.name, profile.patronymic ?? ""]
        .filter((part) => part && part.trim().length > 0)
        .join(" ")
    : "—"

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Основное</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = location.pathname === item.path

                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      onClick={() => navigate(item.path)}
                      className={active ? "bg-accent" : ""}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* USER MENU */}
      <SidebarFooter className="p-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span className="truncate">{fullName}</span>
              </div>

              <ChevronUp className="h-4 w-4 opacity-60" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-44">
            {profile ? (
              <DropdownMenuItem disabled className="text-xs">
                {profile.email}
              </DropdownMenuItem>
            ) : null}

            <DropdownMenuItem
              onClick={() => {
                logout()
                navigate("/", { replace: true })
              }}
              className="text-red-500"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Выйти
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
