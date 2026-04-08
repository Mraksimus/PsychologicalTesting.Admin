"use client"

import { useState } from "react"
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
import { Users, Shield, FileText, BarChart, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

function AppSidebar() {
  const [collapsed, setCollapsed] = useState(true)

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <Sidebar
          className={`transition-all duration-300 ${
            collapsed ? "w-16" : "w-64"
          }`}
        >
          <SidebarContent>
            {/* Кнопка для сворачивания */}
            <div className="flex justify-end p-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCollapsed(!collapsed)}
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>

            <SidebarGroup>
              <SidebarGroupLabel>
                {collapsed ? "" : "Основное"}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Users className="w-5 h-5" />
                      {!collapsed && <span className="ml-2">Пользователи</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Shield className="w-5 h-5" />
                      {!collapsed && <span className="ml-2">Роли</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <FileText className="w-5 h-5" />
                      {!collapsed && <span className="ml-2">Тесты</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <BarChart className="w-5 h-5" />
                      {!collapsed && <span className="ml-2">Статистика</span>}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Контент */}
        <main className="flex-1 p-6 bg-background">
          <h1 className="text-3xl font-semibold mb-6">Главный экран</h1>
          <div className="h-[600px] rounded-xl border border-border bg-card" />
        </main>
      </div>
    </SidebarProvider>
  )
}

export default AppSidebar