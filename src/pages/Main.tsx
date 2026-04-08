"use client"

import Layout from "@/pages/Layout.tsx"

export default function Main() {
  return <Layout>
    <div className="flex min-h-screen">
      <main className="flex-1 p-6 bg-background">
        <h1 className="text-3xl font-semibold mb-6">Главный экран</h1>
        <div className="h-[600px] rounded-xl border border-border bg-card" />
      </main>
    </div>
  </Layout>
}