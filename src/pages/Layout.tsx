import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/shared/app-sidebar.tsx"
import * as React from "react"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
    <main>
      <SidebarTrigger />
    {children}
    </main>
    </SidebarProvider>
  )
}
