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
  BarChart,
  FileText,
  Shield,
  Users,
  User,
  LucideHome,
  ChevronUp,
  LogOut,
} from "lucide-react"

import { useLocation, useNavigate } from "react-router-dom"

export function AppSidebar() {
  const location = useLocation()
  const navigate = useNavigate()

  const items = [
    { label: "Главная", icon: LucideHome, path: "/home" },
    { label: "Пользователи", icon: Users, path: "/users" },
    { label: "Роли", icon: Shield, path: "/roles" },
    { label: "Тесты", icon: FileText, path: "/tests" },
    { label: "Статистика", icon: BarChart, path: "/stats" },
  ]

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
                <span>Maria</span>
              </div>

              <ChevronUp className="h-4 w-4 opacity-60" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => console.log("profile")}>
              Profile
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => console.log("logout")}
              className="text-red-500"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
