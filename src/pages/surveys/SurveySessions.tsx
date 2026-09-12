import { useCallback, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react"

import Layout from "@/pages/Layout.tsx"
import { ThemeToggle } from "@/components/ui/shared/theme-toggle.tsx"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

import {
  surveyQuestions as surveyQuestionsApi,
  surveySessions as surveySessionsApi,
  surveys as surveysApi,
} from "@/api/endpoints"
import type {
  AdminSurveySessionItem,
  ExistingQuestion,
  ExistingSurvey,
} from "@/api/types"

const PAGE_SIZE = 20

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  } catch {
    return iso
  }
}

function statusLabel(status: string): { label: string; variant: "default" | "secondary" | "outline" } {
  switch (status) {
    case "COMPLETED":
      return { label: "Завершён", variant: "default" }
    case "IN_PROGRESS":
      return { label: "В процессе", variant: "secondary" }
    case "CLOSED":
      return { label: "Закрыт", variant: "outline" }
    default:
      return { label: status, variant: "outline" }
  }
}

export default function SurveySessionsPage() {
  const navigate = useNavigate()
  const { surveyId } = useParams<{ surveyId: string }>()

  const [survey, setSurvey] = useState<ExistingSurvey | null>(null)
  const [questions, setQuestions] = useState<ExistingQuestion[]>([])
  const [items, setItems] = useState<AdminSurveySessionItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const load = useCallback(async () => {
    if (!surveyId) return
    setLoading(true)
    setError(null)
    try {
      const [details, sessions] = await Promise.all([
        surveysApi.byId(surveyId),
        surveySessionsApi.bySurvey(surveyId, {
          offset: (page - 1) * PAGE_SIZE,
          limit: PAGE_SIZE,
        }),
      ])
      setSurvey(details.survey)
      setQuestions(
        [...details.questions].sort((a, b) => a.position - b.position),
      )
      setItems(sessions.items)
      setTotal(sessions.total)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось загрузить результаты",
      )
    } finally {
      setLoading(false)
    }
  }, [surveyId, page])

  useEffect(() => {
    void load()
  }, [load])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const completedSessions = useMemo(
    () => items.filter((s) => s.status === "COMPLETED"),
    [items],
  )

  const answersStats = useMemo(() => {
    // For each question, count how many times each option was picked
    // across COMPLETED sessions on the current page.
    const stats: Record<
      string,
      { total: number; byOption: Record<number, number> }
    > = {}
    for (const q of questions) {
      stats[q.id] = { total: 0, byOption: {} }
    }
    for (const s of completedSessions) {
      for (const a of s.answers) {
        const entry = stats[a.questionId]
        if (!entry) continue
        const indices: number[] = []
        if (a.selectedIndex !== null && a.selectedIndex !== undefined) {
          indices.push(a.selectedIndex)
        }
        if (a.selectedIndices && a.selectedIndices.length > 0) {
          for (const i of a.selectedIndices) {
            if (!indices.includes(i)) indices.push(i)
          }
        }
        if (indices.length === 0) continue
        entry.total += 1
        for (const idx of indices) {
          entry.byOption[idx] = (entry.byOption[idx] ?? 0) + 1
        }
      }
    }
    return stats
  }, [completedSessions, questions])

  const questionById = useMemo(() => {
    const map: Record<string, ExistingQuestion> = {}
    for (const q of questions) map[q.id] = q
    return map
  }, [questions])

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const renderPaginationItems = () => {
    const cells: (number | "ellipsis")[] = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) cells.push(i)
    } else {
      cells.push(1)
      if (page > 3) cells.push("ellipsis")
      const start = Math.max(2, page - 1)
      const end = Math.min(totalPages - 1, page + 1)
      for (let i = start; i <= end; i++) cells.push(i)
      if (page < totalPages - 2) cells.push("ellipsis")
      cells.push(totalPages)
    }
    return cells.map((item, index) => {
      if (item === "ellipsis") {
        return (
          <PaginationItem key={`ellipsis-${index}`}>
            <PaginationEllipsis />
          </PaginationItem>
        )
      }
      return (
        <PaginationItem key={item}>
          <PaginationLink
            href="#"
            isActive={page === item}
            onClick={(e) => {
              e.preventDefault()
              setPage(item)
            }}
          >
            {item}
          </PaginationLink>
        </PaginationItem>
      )
    })
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/surveys")}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-semibold tracking-tight">
                Результаты опроса
              </h1>
            </div>
            <p className="text-sm text-muted-foreground pl-11">
              {survey ? survey.name : "Загрузка..."}
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <ThemeToggle />
            {survey ? (
              <Button
                variant="outline"
                onClick={() => navigate(`/surveys/${survey.id}`)}
              >
                К настройкам опроса
              </Button>
            ) : null}
          </div>
        </div>

        {error ? (
          <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        {/* Aggregated stats */}
        <Card>
          <CardHeader>
            <CardTitle>Сводная статистика</CardTitle>
            <CardDescription>
              Распределение ответов по завершённым сессиям (на текущей странице)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {loading && questions.length === 0 ? (
              <div className="text-sm text-muted-foreground">Загрузка...</div>
            ) : questions.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                В опросе ещё нет вопросов.
              </div>
            ) : (
              questions.map((q, qi) => {
                if (q.content.type === "Input") {
                  const textAnswers = completedSessions
                    .map((s) => {
                      const a = s.answers.find(
                        (x) => x.questionId === q.id,
                      )
                      const text = a?.textAnswer?.trim() ?? ""
                      return text ? { user: s.userFullName, text } : null
                    })
                    .filter(
                      (
                        v,
                      ): v is { user: string; text: string } => v !== null,
                    )
                  return (
                    <div key={q.id} className="space-y-2">
                      <div className="flex items-baseline justify-between gap-4">
                        <div className="text-sm font-medium">
                          {qi + 1}. {q.content.text}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          Свободных ответов: {textAnswers.length}
                        </span>
                      </div>
                      <div className="space-y-1 pl-4">
                        {textAnswers.length === 0 ? (
                          <div className="text-xs text-muted-foreground italic">
                            Пока никто не ответил.
                          </div>
                        ) : (
                          textAnswers.slice(0, 5).map((a, idx) => (
                            <div
                              key={idx}
                              className="rounded-md border bg-background p-2 text-xs"
                            >
                              <span className="text-muted-foreground">
                                {a.user || "—"}:
                              </span>{" "}
                              <span className="text-foreground">{a.text}</span>
                            </div>
                          ))
                        )}
                        {textAnswers.length > 5 ? (
                          <div className="text-xs text-muted-foreground">
                            и ещё {textAnswers.length - 5}...
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )
                }

                const stats = answersStats[q.id]
                const totalAnswered = stats?.total ?? 0
                const options =
                  q.content.type === "Choice" ? q.content.options : []
                return (
                  <div key={q.id} className="space-y-2">
                    <div className="flex items-baseline justify-between gap-4">
                      <div className="text-sm font-medium">
                        {qi + 1}. {q.content.text}
                        {q.content.type === "Choice" &&
                        q.content.mod === "SCALE" ? (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            (шкала)
                          </span>
                        ) : q.content.type === "Choice" &&
                          q.content.mod === "MULTIPLE" ? (
                          <span className="ml-2 text-xs font-normal text-muted-foreground">
                            (несколько вариантов)
                          </span>
                        ) : null}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Ответов: {totalAnswered}
                      </span>
                    </div>
                    <div className="space-y-1.5 pl-4">
                      {options.map((opt) => {
                        const count = stats?.byOption[opt.index] ?? 0
                        const percent = totalAnswered
                          ? Math.round((count / totalAnswered) * 100)
                          : 0
                        return (
                          <div key={opt.index} className="space-y-1">
                            <div className="flex items-center justify-between gap-3 text-xs">
                              <span className="text-foreground">
                                {opt.text || `Вариант ${opt.index + 1}`}
                              </span>
                              <span className="tabular-nums text-muted-foreground">
                                {count} · {percent}%
                              </span>
                            </div>
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full bg-primary transition-all"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>

        {/* Sessions table */}
        <Card>
          <CardHeader>
            <CardTitle>Прохождения</CardTitle>
            <CardDescription>
              {loading ? "Загрузка..." : `Всего сессий: ${total}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[36px]" />
                  <TableHead>Пользователь</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Создана</TableHead>
                  <TableHead>Завершена</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.map((s) => {
                  const isOpen = expanded.has(s.id)
                  const status = statusLabel(s.status)
                  return (
                    <>
                      <TableRow
                        key={s.id}
                        className="cursor-pointer"
                        onClick={() => toggle(s.id)}
                      >
                        <TableCell>
                          {isOpen ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {s.userFullName || "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {s.userEmail}
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(s.createdAt)}</TableCell>
                        <TableCell>
                          {s.closedAt ? formatDate(s.closedAt) : "—"}
                        </TableCell>
                      </TableRow>

                      {isOpen ? (
                        <TableRow key={`${s.id}-details`} className="bg-muted/30">
                          <TableCell />
                          <TableCell colSpan={5} className="py-4">
                            {questions.length === 0 ? (
                              <div className="text-sm text-muted-foreground">
                                Вопросы недоступны.
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {questions.map((q, qi) => {
                                  const q0 = questionById[q.id]
                                  const answer = s.answers.find(
                                    (a) => a.questionId === q.id,
                                  )
                                  const isInput =
                                    q0?.content.type === "Input"
                                  const isMulti =
                                    q0?.content.type === "Choice" &&
                                    q0.content.mod === "MULTIPLE"
                                  const options =
                                    q0?.content.type === "Choice"
                                      ? q0.content.options
                                      : []
                                  const selected =
                                    answer?.selectedIndex ?? null
                                  const selectedMany =
                                    answer?.selectedIndices ?? []
                                  const textValue =
                                    answer?.textAnswer?.trim() ?? ""
                                  const choiceText =
                                    selected !== null
                                      ? options.find(
                                          (o) => o.index === selected,
                                        )?.text ?? `Вариант ${selected + 1}`
                                      : null
                                  const multiTexts = selectedMany
                                    .map(
                                      (i) =>
                                        options.find((o) => o.index === i)
                                          ?.text ?? `Вариант ${i + 1}`,
                                    )

                                  let body: ReactNode
                                  if (isInput) {
                                    body = textValue ? (
                                      <span className="whitespace-pre-wrap text-foreground">
                                        {textValue}
                                      </span>
                                    ) : (
                                      <span className="italic text-muted-foreground">
                                        Ответ не введён
                                      </span>
                                    )
                                  } else if (isMulti) {
                                    body = multiTexts.length > 0 ? (
                                      <ul className="ml-4 list-disc space-y-0.5 text-foreground">
                                        {multiTexts.map((t, i) => (
                                          <li key={i}>{t}</li>
                                        ))}
                                      </ul>
                                    ) : (
                                      <span className="italic text-muted-foreground">
                                        Ничего не выбрано
                                      </span>
                                    )
                                  } else if (choiceText) {
                                    body = (
                                      <span className="text-foreground">
                                        → {choiceText}
                                      </span>
                                    )
                                  } else {
                                    body = (
                                      <span className="italic text-muted-foreground">
                                        Ответ не выбран
                                      </span>
                                    )
                                  }

                                  return (
                                    <div
                                      key={q.id}
                                      className="rounded-md border bg-background p-3"
                                    >
                                      <div className="text-xs text-muted-foreground">
                                        Вопрос {qi + 1}
                                      </div>
                                      <div className="mt-0.5 text-sm font-medium">
                                        {q.content.text}
                                      </div>
                                      <div className="mt-2 text-sm">
                                        {body}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ) : null}
                    </>
                  )
                })}

                {!loading && items.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-10 text-center text-muted-foreground"
                    >
                      Ещё никто не прошёл этот опрос
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="flex flex-col gap-4 border-t pt-4 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-muted-foreground">
                Страница{" "}
                <span className="font-medium text-foreground">{page}</span> из{" "}
                <span className="font-medium text-foreground">
                  {totalPages}
                </span>
              </div>

              <Pagination className="mx-0 w-full justify-end md:w-auto">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (page > 1) setPage(page - 1)
                      }}
                      className={
                        page === 1 ? "pointer-events-none opacity-50" : ""
                      }
                    />
                  </PaginationItem>

                  {renderPaginationItems()}

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (page < totalPages) setPage(page + 1)
                      }}
                      className={
                        page === totalPages
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
