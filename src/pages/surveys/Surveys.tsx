import { useCallback, useEffect, useState } from "react"
import { BarChart3, MoreHorizontal, Plus, Search } from "lucide-react"
import { useNavigate } from "react-router-dom"

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
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { surveys as surveysApi } from "@/api/endpoints"
import type { ExistingSurvey } from "@/api/types"
import { ApiError } from "@/api/client"

const PAGE_SIZE = 8

export default function SurveysPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<ExistingSurvey[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<ExistingSurvey | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await surveysApi.list({
        offset: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
      })
      setItems(result.items)
      setTotal(result.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить опросы")
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = items.filter((s) => {
    const q = search.toLowerCase().trim()
    if (!q) return true
    return (
      s.name.toLowerCase().includes(q) ||
      s.description.toLowerCase().includes(q)
    )
  })

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  async function performDelete() {
    if (!confirmDelete) return
    setIsDeleting(true)
    setError(null)
    try {
      await surveysApi.remove(confirmDelete.id)
      setConfirmDelete(null)
      await load()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : "Не удалось удалить опрос",
      )
    } finally {
      setIsDeleting(false)
    }
  }

  const renderPaginationItems = () => {
    const items: (number | "ellipsis")[] = []
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) items.push(i)
    } else {
      items.push(1)
      if (page > 3) items.push("ellipsis")
      const start = Math.max(2, page - 1)
      const end = Math.min(totalPages - 1, page + 1)
      for (let i = start; i <= end; i++) items.push(i)
      if (page < totalPages - 2) items.push("ellipsis")
      items.push(totalPages)
    }
    return items.map((item, index) => {
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
            <h1 className="text-3xl font-semibold tracking-tight">
              Управление опросами
            </h1>
            <p className="text-sm text-muted-foreground">
              Опросы для сбора обратной связи и мнений пользователей
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <ThemeToggle />
            <Button size="sm" onClick={() => navigate("/surveys/create")}>
              <Plus className="mr-2 h-4 w-4" />
              Создать опрос
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Каталог опросов</CardTitle>
            <CardDescription>
              {loading ? "Загрузка..." : `Всего опросов: ${total}`}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Поиск по названию или описанию"
                  className="pl-9"
                />
              </div>
            </div>

            {error ? (
              <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-600">
                {error}
              </div>
            ) : null}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Опрос</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead>Вопросы</TableHead>
                  <TableHead>Длительность</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Позиция</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {filtered.map((survey) => (
                  <TableRow
                    key={survey.id}
                    className="cursor-pointer"
                    onClick={() => navigate(`/surveys/${survey.id}`)}
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{survey.name}</span>
                        <span className="line-clamp-1 text-xs text-muted-foreground">
                          {survey.description}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {survey.category ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: survey.category.color }}
                          />
                          {survey.category.icon} {survey.category.name}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>{survey.questionsCount ?? 0}</TableCell>
                    <TableCell>{survey.durationMins} мин</TableCell>
                    <TableCell>
                      <Badge variant={survey.isActive ? "default" : "secondary"}>
                        {survey.isActive ? "Опубликован" : "Черновик"}
                      </Badge>
                    </TableCell>
                    <TableCell>{survey.position}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => navigate(`/surveys/${survey.id}`)}
                          >
                            Открыть
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(`/surveys/${survey.id}/sessions`)
                            }
                          >
                            <BarChart3 className="mr-2 h-4 w-4" />
                            Результаты
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-500 focus:text-red-500"
                            onClick={() => setConfirmDelete(survey)}
                          >
                            Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}

                {!loading && filtered.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="py-10 text-center text-muted-foreground"
                    >
                      Опросы не найдены
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

      <AlertDialog
        open={confirmDelete !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setConfirmDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить опрос?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDelete
                ? `«${confirmDelete.name}» будет удалён вместе со всеми вопросами и сессиями. Это действие нельзя отменить.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Отмена</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={(e) => {
                e.preventDefault()
                void performDelete()
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Удаляем..." : "Удалить"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  )
}
