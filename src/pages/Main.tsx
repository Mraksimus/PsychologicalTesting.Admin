import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
} from "@/components/ui/sidebar"

import { Users, Shield, FileText, BarChart } from "lucide-react"

function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>

        <SidebarGroup>
          <SidebarGroupLabel>Основное</SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>

              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Users className="w-4 h-4" />
                  <span>Пользователи</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Shield className="w-4 h-4" />
                  <span>Роли</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton>
                  <FileText className="w-4 h-4" />
                  <span>Тесты</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton>
                  <BarChart className="w-4 h-4" />
                  <span>Статистика</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
    </Sidebar>
  )
}

export default function Main() {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">

        {/* Sidebar */}
        <AppSidebar />

        {/* Контент */}
        <main className="flex-1 p-6 bg-background">
          <h1 className="text-3xl font-semibold mb-6">
            Главный экран
          </h1>

          {/* Заглушка */}
          <div className="h-[600px] rounded-xl border border-border bg-card" />
        </main>

      </div>
    </SidebarProvider>
  )
}