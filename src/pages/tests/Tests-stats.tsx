import { BarChart3, ClipboardList, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Trend = "up" | "neutral"

type StatsCardProps = {
  icon: React.ElementType
  label: string
  value: string
  delta?: string
  trend?: Trend
}

type TestsStatsProps = {
  totalTests: number
  publishedTests: number
  totalCompletions: number
  className?: string
}

function StatsCard({
                     icon: Icon,
                     label,
                     value,
                     delta,
                     trend = "neutral",
                   }: StatsCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>

      <CardContent>
        <div className="text-3xl font-semibold tracking-tight">{value}</div>

        {delta ? (
          <div
            className={`mt-2 text-sm ${
              trend === "up" ? "text-green-600" : "text-muted-foreground"
            }`}
          >
            {delta}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

export function TestsStats({
                             totalTests,
                             publishedTests,
                             totalCompletions,
                             className,
                           }: TestsStatsProps) {
  return (
    <div
      className={`grid w-full grid-cols-1 gap-4 md:grid-cols-3 ${className ?? ""}`}
    >
      <StatsCard
        icon={ClipboardList}
        label="Всего тестов"
        value={String(totalTests)}
        delta="12 в черновике"
      />

      <StatsCard
        icon={FileText}
        label="Опубликованы"
        value={String(publishedTests)}
      />

      <StatsCard
        icon={BarChart3}
        label="Прохождений"
        value={totalCompletions.toLocaleString("ru-RU")}
      />
    </div>
  )
}