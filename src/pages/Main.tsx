"use client"

import * as React from "react"
import Layout from "@/pages/Layout.tsx"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import {
  Users,
  FileText,
  CheckSquare,
  Plus,
  Download,
  ChevronRight,
  ArrowUpRight,
  Minus,
} from "lucide-react"

// --- Типы ---
type Status = "active" | "draft"
type Trend = "up" | "down" | "neutral"

interface Test {
  name: string
  completions: number
  status: Status
}

interface Event {
  color: string
  text: string
  time: string
}

interface KpiProps {
  icon: React.ElementType
  label: string
  value: string
  delta: string
  trend: Trend
  className?: string
}

// --- Данные ---
const activityData = [
  { day: "Пн", count: 42 },
  { day: "Вт", count: 58 },
  { day: "Ср", count: 51 },
  { day: "Чт", count: 67 },
  { day: "Пт", count: 73 },
  { day: "Сб", count: 38 },
  { day: "Вс", count: 55 },
]

const recentEvents: Event[] = [
  { color: "bg-green-500", text: "Анна завершила тест Бека", time: "2 мин назад" },
  { color: "bg-blue-500", text: "Создан новый тест", time: "18 мин назад" },
  { color: "bg-purple-500", text: "Добавлен пользователь", time: "1 час назад" },
  { color: "bg-yellow-500", text: "Обновлён PHQ-9", time: "3 часа назад" },
]

const activeTests: Test[] = [
  { name: "Тест Бека", completions: 124, status: "active" },
  { name: "PHQ-9", completions: 98, status: "active" },
  { name: "Выгорание", completions: 41, status: "draft" },
]

const statusConfig: Record<Status, { label: string; variant: "default" | "secondary" }> = {
  active: { label: "Активен", variant: "default" },
  draft: { label: "Черновик", variant: "secondary" },
}

// --- Компоненты ---
function KpiCard({ icon: Icon, label, value, delta, trend, className }: KpiProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex justify-between pb-2">
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        <div className="flex items-center gap-1 mt-1 text-xs">
          {trend === "up" && <ArrowUpRight className="h-3 w-3 text-green-500" />}
          {trend === "neutral" && <Minus className="h-3 w-3" />}
          <span className={trend === "up" ? "text-green-500" : ""}>{delta}</span>
        </div>
      </CardContent>
    </Card>
  )
}

// --- Dashboard ---
function Dashboard() {
  const today = new Date().toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  return (
    <div className="flex flex-col gap-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold">Обзор</h1>
          <p className="text-sm text-muted-foreground">{today}</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Экспорт
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Создать
          </Button>
        </div>
      </div>

      {/* KPI */}
      <div className="flex gap-4">
        <KpiCard className="flex-1 min-w-[200px]" icon={Users} label="Пользователи" value="1248" delta="+12%" trend="up" />
        <KpiCard className="flex-1 min-w-[200px]" icon={FileText} label="Тесты" value="47" delta="+3" trend="up" />
        <KpiCard className="flex-1 min-w-[200px]" icon={CheckSquare} label="Прохождения" value="384" delta="+8%" trend="up" />
      </div>

      {/* CHART + EVENTS */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4">
        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Активность</CardTitle>
            <CardDescription>Прохождения по дням</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Events */}
        <Card>
          <CardHeader>
            <CardTitle>События</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {recentEvents.map((e, i) => (
                <li key={i} className="flex gap-2">
                  <span className={`h-2 w-2 rounded-full mt-2 ${e.color}`} />
                  <div>
                    <p className="text-sm">{e.text}</p>
                    <p className="text-xs text-muted-foreground">{e.time}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Тесты</CardTitle>
          <Button variant="ghost" size="sm">
            Все <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead>
            <tr className="text-muted-foreground border-b">
              <th className="text-left py-2">Название</th>
              <th className="text-left py-2">Прохождения</th>
              <th className="text-left py-2">Статус</th>
            </tr>
            </thead>
            <tbody>
            {activeTests.map((t) => (
              <tr key={t.name} className="border-b hover:bg-accent/50">
                <td className="py-2">{t.name}</td>
                <td>{t.completions}</td>
                <td>
                  <Badge variant={statusConfig[t.status].variant}>
                    {statusConfig[t.status].label}
                  </Badge>
                </td>
              </tr>
            ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  )
}

// --- Main Page ---
export default function Main() {
  return (
    <Layout>
      <div className="flex min-h-screen">
        <main className="flex-1 p-6 bg-background">
          <h1 className="text-3xl font-semibold mb-6">Главный экран</h1>
          {/* Вставляем Dashboard */}
          <Dashboard />
        </main>
      </div>
    </Layout>
  )
}