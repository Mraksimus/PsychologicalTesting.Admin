import { useCallback, useEffect, useMemo, useState } from "react"
import { ArrowUpRight, MoreHorizontal, Search, Users } from "lucide-react"

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
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
  roles as rolesApi,
  users as usersApi,
} from "@/api/endpoints"
import type {
  AdminUserItem,
  ExistingRole,
  PageResponse,
  UUID,
} from "@/api/types"
import { ApiError } from "@/api/client"

const PAGE_SIZE = 8

type KpiProps = {
  icon: React.ElementType
  label: string
  value: string
  delta: string
  className?: string
}

function KpiCard({ icon: Icon, label, value, delta, className }: KpiProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
        <div className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
          <ArrowUpRight className="h-4 w-4" />
          <span>{delta}</span>
        </div>
      </CardContent>
    </Card>
  )
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—"
  try {
    return new Date(iso).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch {
    return iso
  }
}

function fullName(u: AdminUserItem): string {
  return [u.surname, u.name, u.patronymic ?? ""]
    .filter((part) => part && part.trim().length > 0)
    .join(" ")
}

export default function UsersPage() {
  const [items, setItems] = useState<AdminUserItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [roleId, setRoleId] = useState<string>("all")

  const [allRoles, setAllRoles] = useState<ExistingRole[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Debounce поиска
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 300)
    return () => clearTimeout(t)
  }, [searchInput])

  // Загрузка списка ролей
  useEffect(() => {
    rolesApi
      .list()
      .then(setAllRoles)
      .catch(() => {
        // некритично, фильтр просто не отрисуется
      })
  }, [])

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result: PageResponse<AdminUserItem> = await usersApi.list({
        offset: (page - 1) * PAGE_SIZE,
        limit: PAGE_SIZE,
        search: search.trim() || undefined,
        roleId: roleId === "all" ? undefined : (roleId as UUID),
      })
      setItems(result.items)
      setTotal(result.total)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Не удалось загрузить пользователей",
      )
    } finally {
      setLoading(false)
    }
  }, [page, search, roleId])

  useEffect(() => {
    void load()
  }, [load])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  async function handleAssignRole(userId: UUID, newRoleId: UUID | null) {
    try {
      await rolesApi.assignToUser(userId, newRoleId)
      await load()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Не удалось обновить роль пользователя",
      )
    }
  }

  const renderPaginationItems = useMemo(
    () => () => {
      const arr: (number | "ellipsis")[] = []
      if (totalPages <= 5) {
        for (let i = 1; i <= totalPages; i++) arr.push(i)
      } else {
        arr.push(1)
        if (page > 3) arr.push("ellipsis")
        const start = Math.max(2, page - 1)
        const end = Math.min(totalPages - 1, page + 1)
        for (let i = start; i <= end; i++) arr.push(i)
        if (page < totalPages - 2) arr.push("ellipsis")
        arr.push(totalPages)
      }
      return arr.map((item, index) => {
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
    },
    [page, totalPages],
  )

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Управление пользователями
            </h1>
            <p className="text-sm text-muted-foreground">
              Список пользователей системы и их роли
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <ThemeToggle />
          </div>
        </div>

        <div className="grid grid-cols-1">
          <KpiCard
            icon={Users}
            label="Всего пользователей"
            value={loading ? "…" : String(total)}
            delta="по текущему фильтру"
            className="w-full"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Фильтры</CardTitle>
            <CardDescription>
              Поиск и фильтрация по роли
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Поиск по имени или email"
                  className="pl-9"
                />
              </div>

              <Select
                value={roleId}
                onValueChange={(value) => {
                  setRoleId(value)
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-full md:w-[260px]">
                  <SelectValue placeholder="Роль" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все роли</SelectItem>
                  {allRoles.map((r) => (
                    <SelectItem key={r.id} value={r.id}>
                      {r.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {error ? (
          <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-600">
            {error}
          </div>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Список пользователей</CardTitle>
            <CardDescription>
              {loading ? "Загрузка..." : `Найдено: ${total}`}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Пользователь</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead>Регистрация</TableHead>
                  <TableHead>Последний вход</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {items.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{fullName(user)}</span>
                        <span className="text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      {user.role ? (
                        <Badge
                          variant="secondary"
                          style={
                            user.role.color
                              ? {
                                  backgroundColor: `${user.role.color}22`,
                                  color: user.role.color,
                                  borderColor: `${user.role.color}55`,
                                }
                              : undefined
                          }
                        >
                          {user.role.name}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Без роли
                        </span>
                      )}
                    </TableCell>

                    <TableCell>{formatDate(user.registeredAt)}</TableCell>
                    <TableCell>{formatDate(user.lastLoginAt)}</TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-56">
                          <DropdownMenuItem disabled className="text-xs">
                            Назначить роль
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {allRoles.map((r) => (
                            <DropdownMenuItem
                              key={r.id}
                              onClick={() => handleAssignRole(user.id, r.id)}
                            >
                              {r.name}
                              {user.role?.id === r.id ? " ✓" : ""}
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-red-500 focus:text-red-500"
                            onClick={() => handleAssignRole(user.id, null)}
                          >
                            Снять роль
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}

                {!loading && items.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="py-10 text-center text-muted-foreground"
                    >
                      Пользователи не найдены
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            <div className="flex flex-col gap-4 border-t pt-4 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-muted-foreground">
                Страница{" "}
                <span className="font-medium text-foreground">{page}</span> из{" "}
                <span className="font-medium text-foreground">{totalPages}</span>
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
