"use client"

import * as React from "react"
import Layout from "@/pages/Layout.tsx"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx"
import { Button } from "@/components/ui/button.tsx"
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  ArrowUpRight,
  CheckSquare,
  ChevronRight,
  Download,
  FileText,
  Minus,
  Plus,
  Users,
} from "lucide-react"
import { QuickActions } from "./_components/QuickActions.tsx"
import { ThemeToggle } from "@/components/ui/shared/theme-toggle.tsx"

// --- Типы ---
type Trend = "up" | "down" | "neutral"

interface Test {
  name: string
  completions: number
  status: "active" | "draft"
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
  {
    color: "bg-green-500",
    text: "Анна завершила тест Бека",
    time: "2 мин назад",
  },
  { color: "bg-blue-500", text: "Создан новый тест", time: "18 мин назад" },
  {
    color: "bg-purple-500",
    text: "Добавлен пользователь",
    time: "1 час назад",
  },
  { color: "bg-yellow-500", text: "Обновлён PHQ-9", time: "3 часа назад" },
]

const activeTests: Test[] = [
  { name: "Тест Бека", completions: 124, status: "active" },
  { name: "PHQ-9", completions: 98, status: "active" },
  { name: "Выгорание", completions: 41, status: "draft" },
]

const quickActions = [
  {
    icon: Plus,
    label: "Создать тест",
    desc: "Добавить новый опросник",
    href: "#",
  },
  {
    icon: FileText,
    label: "Шаблоны",
    desc: "Управление шаблонами",
    href: "#",
  },
  {
    icon: Users,
    label: "Пользователи",
    desc: "Управление доступом",
    href: "#",
  },
]

// --- KPI ---
function KpiCard({
  icon: Icon,
  label,
  value,
  delta,
  trend,
  className,
}: KpiProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex justify-between pb-2">
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        <div className="mt-1 flex items-center gap-1 text-xs">
          {trend === "up" && (
            <ArrowUpRight className="h-3 w-3 text-green-500" />
          )}
          {trend === "neutral" && <Minus className="h-3 w-3" />}
          <span className={trend === "up" ? "text-green-500" : ""}>
            {delta}
          </span>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Обзор</h1>
          <p className="text-sm text-muted-foreground">{today}</p>
        </div>

        <div className="flex gap-2">
          <ThemeToggle size="sm" className="px-2" />
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
        <KpiCard
          className="flex-1"
          icon={Users}
          label="Пользователи"
          value="1248"
          delta="+12%"
          trend="up"
        />
        <KpiCard
          className="flex-1"
          icon={FileText}
          label="Тесты"
          value="47"
          delta="+3"
          trend="up"
        />
        <KpiCard
          className="flex-1"
          icon={CheckSquare}
          label="Прохождения"
          value="384"
          delta="+8%"
          trend="up"
        />
      </div>

      {/* CHART + EVENTS*/}
      <div className="grid grid-cols-[1fr_340px] gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold">
                  Активность прохождений
                </CardTitle>
                <CardDescription>
                  Количество завершённых тестов по дням
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={activityData} barCategoryGap="35%">
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "6px",
                    fontSize: "13px",
                  }}
                  formatter={(value) => `${value} прохождений`}
                  cursor={{ fill: "var(--accent)" }}
                />
                <Bar
                  dataKey="count"
                  fill="var(--primary)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>События</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {recentEvents.map((e, i) => (
                <li key={i} className="flex gap-2">
                  <span className={`mt-2 h-2 w-2 rounded-full ${e.color}`} />
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

      {/* Tests Table + Quick Actions */}
      <div className="grid grid-cols-2 gap-4">
        {/* TABLE */}
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>Тесты</CardTitle>
            <Button variant="ghost" size="sm">
              Все <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent>
            <table className="w-full table-fixed text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="py-3 text-left">Название</th>
                  <th className="py-3 text-left">Прохождения</th>
                  <th className="py-3 text-right">Статус</th>
                </tr>
              </thead>

              <tbody>
                {activeTests.map((t) => (
                  <tr key={t.name} className="border-b hover:bg-accent/40">
                    <td className="truncate py-3 pr-4">{t.name}</td>
                    <td className="py-3">{t.completions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <QuickActions actions={quickActions}></QuickActions>
      </div>
    </div>
  )
}

// --- PAGE ---
export default function Home() {
  return (
    <Layout>
      <div className="flex min-h-screen">
        <main className="flex-1 bg-background p-6">
          <Dashboard />
        </main>
      </div>
    </Layout>
  )
}
