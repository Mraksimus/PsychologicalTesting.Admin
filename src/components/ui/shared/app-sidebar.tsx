import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarFooter,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"

import { BarChart, FileText, Shield, User, Users, ChevronUp } from "lucide-react"

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Основное</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Users className="h-5 w-5" />
                  <span className="ml-2">Пользователи</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Shield className="h-5 w-5" />
                  <span className="ml-2">Роли</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton>
                  <FileText className="h-5 w-5" />
                  <span className="ml-2">Тесты</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton>
                  <BarChart className="h-5 w-5" />
                  <span className="ml-2">Статистика</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* FOOTER USER MENU */}
        <SidebarFooter className="mt-auto p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>

                {/* Кнопка */}
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <User className="w-6 h-6" />
                      <span>Maria</span>
                    </div>

                    {/* стрелка справа */}
                    <ChevronUp className="h-4 w-4 opacity-60" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>

                {/* Выпадающее меню */}
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={() => console.log("logout")}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>

              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  )
}