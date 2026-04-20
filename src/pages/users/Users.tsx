import { useMemo, useState } from "react"
import {
  ArrowUpRight,
  MoreHorizontal,
  Plus,
  Search,
  Users,
} from "lucide-react"
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
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

type UserRole = "Администратор" | "Студент"
type UserStatus = "Активен" | "Ожидает" | "Заблокирован"
type Trend = "up" | "neutral"

type UserItem = {
  id: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  registeredAt: string
  lastSeen: string
  testsCompleted: number
}

type KpiProps = {
  icon: React.ElementType
  label: string
  value: string
  delta: string
  trend: Trend
  className?: string
}

const PAGE_SIZE = 8

const initialUsers: UserItem[] = [
  {
    id: "1",
    name: "Мария Тихонова",
    email: "maria@company.ru",
    role: "Администратор",
    status: "Активен",
    lastSeen: "5 мин назад",
    testsCompleted: 42,
    registeredAt: "10.01.2025",
  },
  {
    id: "2",
    name: "Алексей Орлов",
    email: "orlov@company.ru",
    role: "Студент",
    status: "Активен",
    lastSeen: "22 мин назад",
    testsCompleted: 18,
    registeredAt: "15.02.2025",
  },
  {
    id: "3",
    name: "Елена Смирнова",
    email: "smirnova@company.ru",
    role: "Администратор",
    status: "Ожидает",
    lastSeen: "Сегодня, 09:12",
    testsCompleted: 7,
    registeredAt: "02.03.2025",
  },
  {
    id: "4",
    name: "Дмитрий Павлов",
    email: "dpavlov@company.ru",
    role: "Студент",
    status: "Заблокирован",
    lastSeen: "Вчера, 18:40",
    testsCompleted: 31,
    registeredAt: "20.11.2024",
  },
  {
    id: "5",
    name: "Ирина Новикова",
    email: "novikova@company.ru",
    role: "Студент",
    status: "Активен",
    lastSeen: "2 часа назад",
    testsCompleted: 26,
    registeredAt: "05.04.2025",
  },
  {
    id: "6",
    name: "Сергей Кузнецов",
    email: "kuznets@company.ru",
    role: "Студент",
    status: "Активен",
    lastSeen: "1 день назад",
    testsCompleted: 14,
    registeredAt: "18.03.2025",
  },
  {
    id: "7",
    name: "Анна Белова",
    email: "belova@company.ru",
    role: "Администратор",
    status: "Ожидает",
    lastSeen: "3 дня назад",
    testsCompleted: 2,
    registeredAt: "09.04.2025",
  },
  {
    id: "8",
    name: "Павел Фёдоров",
    email: "fedorov@company.ru",
    role: "Администратор",
    status: "Активен",
    lastSeen: "45 мин назад",
    testsCompleted: 22,
    registeredAt: "07.01.2025",
  },
  {
    id: "9",
    name: "Ольга Захарова",
    email: "zaharova@company.ru",
    role: "Студент",
    status: "Заблокирован",
    lastSeen: "7 дней назад",
    testsCompleted: 9,
    registeredAt: "14.02.2025",
  },
  {
    id: "10",
    name: "Николай Попов",
    email: "popov@company.ru",
    role: "Студент",
    status: "Активен",
    lastSeen: "30 мин назад",
    testsCompleted: 37,
    registeredAt: "22.12.2024",
  },
  {
    id: "11",
    name: "Татьяна Ларина",
    email: "larina@company.ru",
    role: "Студент",
    status: "Активен",
    lastSeen: "Сегодня, 11:30",
    testsCompleted: 15,
    registeredAt: "03.02.2025",
  },
  {
    id: "12",
    name: "Виктор Соколов",
    email: "sokolov@company.ru",
    role: "Студент",
    status: "Ожидает",
    lastSeen: "2 дня назад",
    testsCompleted: 0,
    registeredAt: "17.04.2025",
  },
]

function getStatusVariant(status: UserStatus) {
  switch (status) {
    case "Активен":
      return "default"
    case "Ожидает":
      return "secondary"
    case "Заблокирован":
      return "destructive"
    default:
      return "outline"
  }
}

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
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {label}
          </CardTitle>
        </div>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>

      <CardContent>
        <div className="text-3xl font-semibold tracking-tight">{value}</div>

        <div className="mt-2 flex items-center gap-1 text-sm">
          {trend === "up" ? (
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          ) : null}

          <span
            className={
              trend === "up" ? "text-green-600" : "text-muted-foreground"
            }
          >
            {delta}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserItem[]>(initialUsers)
  const [search, setSearch] = useState("")
  const [role, setRole] = useState("all")
  const [status, setStatus] = useState("all")

  const [sheetOpen, setSheetOpen] = useState(false)
  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newRole, setNewRole] = useState<UserRole>("Студент")
  const [newStatus, setNewStatus] = useState<UserStatus>("Ожидает")

  const [page, setPage] = useState(1)

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const query = search.toLowerCase().trim()

      const matchesSearch =
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)

      const matchesRole = role === "all" || user.role === role
      const matchesStatus = status === "all" || user.status === status

      return matchesSearch && matchesRole && matchesStatus
    })
  }, [users, search, role, status])

  const totalUsers = users.length
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE))

  const paginatedUsers = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredUsers.slice(start, start + PAGE_SIZE)
  }, [filteredUsers, page])

  function resetForm() {
    setNewName("")
    setNewEmail("")
    setNewRole("Студент")
    setNewStatus("Ожидает")
  }

  function handleAddUser() {
    if (!newName.trim() || !newEmail.trim()) return

    const today = new Date().toLocaleDateString("ru-RU")

    const user: UserItem = {
      id: String(Date.now()),
      name: newName.trim(),
      email: newEmail.trim(),
      role: newRole,
      status: newStatus,
      registeredAt: today,
      lastSeen: "—",
      testsCompleted: 0,
    }

    setUsers((prev) => [user, ...prev])
    resetForm()
    setSheetOpen(false)
    setPage(1)
  }

  const handleOpenSheet = (open: boolean) => {
    setSheetOpen(open)
    if (!open) resetForm()
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

      for (let i = start; i <= end; i++) {
        items.push(i)
      }

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
              Управление пользователями
            </h1>
            <p className="text-sm text-muted-foreground">
              Список пользователей системы, роли и статусы доступа
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <Sheet open={sheetOpen} onOpenChange={handleOpenSheet}>
              <SheetTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Добавить пользователя
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-full sm:max-w-[560px] p-0">
                <div className="flex h-full flex-col">
                  <SheetHeader className="border-b px-6 py-5 text-left">
                    <SheetTitle>Новый пользователь</SheetTitle>
                    <SheetDescription>
                      Быстрое добавление пользователя в систему
                    </SheetDescription>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto px-6 py-6">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Имя и фамилия</label>
                        <Input
                          placeholder="Иван Петров"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                        />
                      </div>

                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input
                          type="email"
                          placeholder="ivan@company.ru"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                        />
                      </div>

                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Роль</label>
                        <Select
                          value={newRole}
                          onValueChange={(value) => setNewRole(value as UserRole)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите роль" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Администратор">Администратор</SelectItem>
                            <SelectItem value="Студент">Студент</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Статус приглашения</label>
                        <Select
                          value={newStatus}
                          onValueChange={(value) => setNewStatus(value as UserStatus)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите статус" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Активен">Отправить сразу</SelectItem>
                            <SelectItem value="Ожидает">Ожидает</SelectItem>
                            <SelectItem value="Заблокирован">Заблокирован</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button className="mt-2 w-full" onClick={handleAddUser}>
                        Отправить приглашение
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="grid grid-cols-1">
          <KpiCard
            icon={Users}
            label="Всего пользователей"
            value={String(totalUsers)}
            delta="+8.2% за месяц"
            trend="up"
            className="w-full"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Фильтры</CardTitle>
            <CardDescription>
              Быстрый поиск и фильтрация списка пользователей
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="flex flex-col gap-3 md:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  placeholder="Поиск по имени или email"
                  className="pl-9"
                />
              </div>

              <Select
                value={role}
                onValueChange={(value) => {
                  setRole(value)
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-full md:w-[220px]">
                  <SelectValue placeholder="Роль" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все роли</SelectItem>
                  <SelectItem value="Администратор">Администратор</SelectItem>
                  <SelectItem value="Студент">Студент</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={status}
                onValueChange={(value) => {
                  setStatus(value)
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="Активен">Активен</SelectItem>
                  <SelectItem value="Ожидает">Ожидает</SelectItem>
                  <SelectItem value="Заблокирован">Заблокирован</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Список пользователей</CardTitle>
            <CardDescription>Найдено: {filteredUsers.length}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Пользователь</TableHead>
                  <TableHead>Роль</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Регистрация</TableHead>
                  <TableHead>Последняя активность</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{user.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>{user.role}</TableCell>

                    <TableCell>
                      <Badge variant={getStatusVariant(user.status)}>
                        {user.status}
                      </Badge>
                    </TableCell>

                    <TableCell>{user.registeredAt}</TableCell>
                    <TableCell>{user.lastSeen}</TableCell>

                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Открыть</DropdownMenuItem>
                          <DropdownMenuItem>Редактировать</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500 focus:text-red-500">
                            Заблокировать
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}

                {paginatedUsers.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
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
                Показано{" "}
                <span className="font-medium text-foreground">
                  {filteredUsers.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}-
                  {Math.min(page * PAGE_SIZE, filteredUsers.length)}
                </span>{" "}
                из{" "}
                <span className="font-medium text-foreground">
                  {filteredUsers.length}
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
                      className={page === 1 ? "pointer-events-none opacity-50" : ""}
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
                        page === totalPages ? "pointer-events-none opacity-50" : ""
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