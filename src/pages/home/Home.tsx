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
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  CheckSquare,
  ChevronRight,
  ClipboardList,
  FileText,
  FolderTree,
  Plus,
  Users,
} from "lucide-react"
import { QuickActions } from "./_components/QuickActions.tsx"
import { ThemeToggle } from "@/components/ui/shared/theme-toggle.tsx"
import { statistics, type AdminStatistics } from "@/api/endpoints.ts"
import { Skeleton } from "@/components/ui/skeleton.tsx"

interface KpiProps {
  icon: React.ElementType
  label: string
  value: string | number
  hint?: string
  className?: string
}

function KpiCard({ icon: Icon, label, value, hint, className }: KpiProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex justify-between pb-2">
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold">{value}</div>
        {hint ? (
          <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
        ) : null}
      </CardContent>
    </Card>
  )
}

const DAY_LABELS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"]

function toChartData(activity: AdminStatistics["activityByDay"]) {
  return activity.map((point) => {
    const date = new Date(`${point.date}T00:00:00`)
    return {
      label: DAY_LABELS[date.getDay()],
      Тесты: point.testingCount,
      Опросы: point.surveyCount,
    }
  })
}

function formatEventTime(iso: string): string {
  const at = new Date(iso)
  const diffMs = Date.now() - at.getTime()
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return "только что"
  if (minutes < 60) return `${minutes} мин назад`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} ч назад`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} дн назад`
  return at.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })
}

const quickActions = [
  { icon: Plus, label: "Создать тест", desc: "Добавить новый тест", href: "/tests" },
  { icon: ClipboardList, label: "Создать опрос", desc: "Добавить новый опрос", href: "/surveys" },
  { icon: FolderTree, label: "Категории", desc: "Управление категориями", href: "/categories" },
  { icon: Users, label: "Пользователи", desc: "Управление доступом", href: "/users" },
]

function Dashboard() {
  const today = new Date().toLocaleDateString("ru-RU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  })

  const [data, setData] = React.useState<AdminStatistics | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    statistics
      .get()
      .then((result) => {
        if (cancelled) return
        setData(result)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : "Не удалось загрузить статистику")
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold">Обзор</h1>
          <p className="text-sm text-muted-foreground">{today}</p>
        </div>
        <div className="flex gap-2">
          <ThemeToggle />
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          <p className="font-medium">Ошибка загрузки статистики</p>
          <p className="mt-1 text-destructive/80">{error}</p>
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {loading || !data ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))
        ) : (
          <>
            <KpiCard icon={Users} label="Пользователи" value={data.usersCount} />
            <KpiCard icon={FileText} label="Тесты" value={data.testsCount} hint={`Категорий: ${data.categoriesCount}`} />
            <KpiCard icon={ClipboardList} label="Опросы" value={data.surveysCount} />
            <KpiCard
              icon={CheckSquare}
              label="Прохождения"
              value={data.completedTestingSessions + data.completedSurveySessions}
              hint={`Тестов: ${data.completedTestingSessions} · Опросов: ${data.completedSurveySessions}`}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-[1fr_340px] items-stretch gap-4">
        <Card className="flex h-full flex-col">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Активность за 7 дней</CardTitle>
            <CardDescription>Завершённые тесты и опросы</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            {loading || !data ? (
              <Skeleton className="h-full min-h-[220px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%" minHeight={220}>
                <BarChart data={toChartData(data.activityByDay)} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
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
                    cursor={{ fill: "var(--accent)" }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Тесты" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Опросы" fill="#43cea2" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>События</CardTitle>
            <CardDescription>Последние прохождения</CardDescription>
          </CardHeader>
          <CardContent>
            {loading || !data ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : data.recentEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">Пока нет событий.</p>
            ) : (
              <ul className="space-y-3">
                {data.recentEvents.map((event, i) => (
                  <li key={i} className="flex gap-2">
                    <span
                      className={`mt-2 h-2 w-2 rounded-full ${
                        event.kind === "TESTING" ? "bg-blue-500" : "bg-emerald-500"
                      }`}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm">
                        <span className="font-medium">{event.userDisplayName}</span>
                        {" · "}
                        {event.kind === "TESTING" ? "тест" : "опрос"} «{event.itemName}»
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatEventTime(event.at)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <TopList title="Топ тестов" items={data?.topTests ?? []} loading={loading} />
        <TopList title="Топ опросов" items={data?.topSurveys ?? []} loading={loading} />
        <QuickActions actions={quickActions} />
      </div>
    </div>
  )
}

interface TopListProps {
  title: string
  items: AdminStatistics["topTests"]
  loading: boolean
}

function TopList({ title, items, loading }: TopListProps) {
  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Нет данных.</p>
        ) : (
          <ul className="space-y-2">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between rounded-md border p-2 text-sm hover:bg-accent/40"
              >
                <span className="truncate">{item.name}</span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  {item.completions}
                  <ChevronRight className="h-3 w-3" />
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

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
