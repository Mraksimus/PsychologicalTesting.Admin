import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import * as React from "react"
import { AppSidebar } from "@/components/ui/shared/app-sidebar.tsx"

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
