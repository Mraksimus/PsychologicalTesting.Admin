import * as React from "react"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/ui/shared/app-sidebar"

function readSidebarOpen(): boolean {
  if (typeof document === "undefined") return true
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("sidebar_state="))
  if (!match) return true
  return match.split("=")[1] !== "false"
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={readSidebarOpen()}>
      <div className="flex h-screen w-screen overflow-hidden">
        {/* Sidebar */}
        <AppSidebar />

        {/* Home */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Topbar */}
          <header className="flex h-12 items-center border-b px-4">
            <SidebarTrigger />
          </header>

          {/* Page content */}
          <div className="flex-1 overflow-auto p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  )
}
