import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import * as React from "react"
import { AppSidebar } from "@/components/ui/shared/app-sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden">

        {/* Sidebar */}
        <AppSidebar />

        {/* Main content */}
        <main className="flex flex-1 flex-col overflow-auto">

          {/* Top bar */}
          <div className="p-2 border-b">
            <SidebarTrigger />
          </div>

          {/* Page content */}
          <div className="flex-1 p-6">
            {children}
          </div>

        </main>
      </div>
    </SidebarProvider>
  )
}