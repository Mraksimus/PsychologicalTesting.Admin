import * as React from "react"
import { useCallback, useEffect, useState } from "react"
import { ArrowDown, ArrowUp, GripVertical, MoreHorizontal, Plus, Search } from "lucide-react"
import { useNavigate } from "react-router-dom"
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

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
import { tests as testsApi } from "@/api/endpoints"
import type { ExistingTest } from "@/api/types"
import { ApiError } from "@/api/client"
import { useAuth } from "@/api/auth-context"

const PAGE_SIZE = 8

export default function TestsPage() {
  const navigate = useNavigate()
  const { hasPermission } = useAuth()
  const canEdit = hasPermission("TESTS_EDIT")
  const [items, setItems] = useState<ExistingTest[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<ExistingTest | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [reordering, setReordering] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await testsApi.list({
        offset: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
      })
      setItems(result.items)
      setTotal(result.total)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить тесты")
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => {
    void load()
  }, [load])

  const filtered = items.filter((t) => {
    const q = search.toLowerCase().trim()
    if (!q) return true
    return (
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q)
    )
  })

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const canReorder = search.trim().length === 0

  async function reorder(sourceIndex: number, destinationIndex: number) {
    if (sourceIndex === destinationIndex) return
    const moved = items[sourceIndex]
    const targetPosition = items[destinationIndex].position
    const next = arrayMove(items, sourceIndex, destinationIndex)
    setItems(next)
    setReordering(true)
    setError(null)
    try {
      await testsApi.reorder(moved.id, targetPosition)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось изменить порядок")
      await load()
    } finally {
      setReordering(false)
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const from = items.findIndex((t) => t.id === active.id)
    const to = items.findIndex((t) => t.id === over.id)
    if (from === -1 || to === -1) return
    void reorder(from, to)
  }

  async function performDelete() {
    if (!confirmDelete) return
    setIsDeleting(true)
    setError(null)
    try {
      await testsApi.remove(confirmDelete.id)
      setConfirmDelete(null)
      await load()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : "Не удалось удалить тест",
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
              Управление тестами
            </h1>
            <p className="text-sm text-muted-foreground">
              Каталог тестов по психологическому тестированию
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <ThemeToggle />
            {canEdit ? (
              <Button size="sm" onClick={() => navigate("/tests/create")}>
                <Plus className="mr-2 h-4 w-4" />
                Создать тест
              </Button>
            ) : null}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Каталог тестов</CardTitle>
            <CardDescription>
              {loading ? "Загрузка..." : `Всего тестов: ${total}`}
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

            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Порядок</TableHead>
                    <TableHead>Тест</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Вопросы</TableHead>
                    <TableHead>Длительность</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="w-[60px]" />
                  </TableRow>
                </TableHeader>

                <TableBody>
                  <SortableContext
                    items={filtered.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {filtered.map((test, idx) => (
                      <SortableTestRow
                        key={test.id}
                        test={test}
                        index={idx}
                        canReorder={canReorder && canEdit}
                        reordering={reordering}
                        canEdit={canEdit}
                        total={filtered.length}
                        onOpen={() => navigate(`/tests/${test.id}`)}
                        onDelete={() => setConfirmDelete(test)}
                        onMoveUp={() => reorder(idx, idx - 1)}
                        onMoveDown={() => reorder(idx, idx + 1)}
                      />
                    ))}
                  </SortableContext>

                  {!loading && filtered.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="py-10 text-center text-muted-foreground"
                      >
                        Тесты не найдены
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </DndContext>

            {!canReorder ? (
              <p className="text-xs text-muted-foreground">
                Изменение порядка недоступно при активном поиске.
              </p>
            ) : null}

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
            <AlertDialogTitle>Удалить тест?</AlertDialogTitle>
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

interface SortableTestRowProps {
  test: ExistingTest
  index: number
  total: number
  canReorder: boolean
  reordering: boolean
  canEdit: boolean
  onOpen: () => void
  onDelete: () => void
  onMoveUp: () => void
  onMoveDown: () => void
}

function SortableTestRow({
  test,
  index,
  total,
  canReorder,
  reordering,
  canEdit,
  onOpen,
  onDelete,
  onMoveUp,
  onMoveDown,
}: SortableTestRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: test.id, disabled: !canReorder })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  }

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className="cursor-pointer"
      onClick={onOpen}
    >
      <TableCell onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-1">
          <button
            type="button"
            {...attributes}
            {...listeners}
            disabled={!canReorder}
            className="cursor-grab rounded p-1 text-muted-foreground hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            title={canReorder ? "Перетащить" : "Отключите поиск, чтобы менять порядок"}
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div className="flex flex-col">
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              disabled={!canReorder || reordering || index === 0}
              onClick={onMoveUp}
              title="Вверх"
            >
              <ArrowUp className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5"
              disabled={!canReorder || reordering || index === total - 1}
              onClick={onMoveDown}
              title="Вниз"
            >
              <ArrowDown className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </TableCell>
      <TableCell className="max-w-[420px]">
        <div className="flex min-w-0 flex-col">
          <span className="truncate font-medium">{test.name}</span>
          <span className="line-clamp-1 text-xs text-muted-foreground">
            {test.description}
          </span>
        </div>
      </TableCell>
      <TableCell>
        {test.category ? (
          <span className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: test.category.color }}
            />
            {test.category.icon} {test.category.name}
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        )}
      </TableCell>
      <TableCell>{test.questionsCount ?? 0}</TableCell>
      <TableCell>{test.durationMins} мин</TableCell>
      <TableCell>
        <Badge variant={test.isActive ? "default" : "secondary"}>
          {test.isActive ? "Опубликован" : "Черновик"}
        </Badge>
      </TableCell>
      <TableCell onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onOpen}>Открыть</DropdownMenuItem>
            {canEdit ? (
              <DropdownMenuItem
                className="text-red-500 focus:text-red-500"
                onClick={onDelete}
              >
                Удалить
              </DropdownMenuItem>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}
