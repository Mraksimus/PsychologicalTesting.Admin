import { useMemo, useState } from "react"
import { MoreHorizontal, Plus, Search } from "lucide-react"
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { TestsStats } from "@/pages/tests/Tests-stats.tsx"
import {
  getTestStatusVariant,
  initialTests,
  type TestCategory,
  type TestItem,
  type TestStatus,
} from "@/pages/tests/Tests-data.tsx"

const PAGE_SIZE = 8

export default function TestsPage() {
  const [tests, setTests] = useState<TestItem[]>(initialTests)
  const [search, setSearch] = useState("")
  const [statusTab, setStatusTab] = useState("all")
  const [category, setCategory] = useState("all")

  const [sheetOpen, setSheetOpen] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newCategory, setNewCategory] = useState<TestCategory>("Личность")
  const [newStatus, setNewStatus] = useState<TestStatus>("Черновик")
  const [newQuestions, setNewQuestions] = useState("20")

  const [page, setPage] = useState(1)

  const filteredTests = useMemo(() => {
    return tests.filter((test) => {
      const query = search.toLowerCase().trim()
      const matchesSearch =
        test.title.toLowerCase().includes(query) ||
        test.author.toLowerCase().includes(query)
      const matchesCategory = category === "all" || test.category === category
      const matchesStatus = statusTab === "all" || test.status === statusTab
      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [tests, search, category, statusTab])

  // ✅ Эти три нужны для TestsStats
  const totalTests = tests.length
  const publishedTests = tests.filter((t) => t.status === "Опубликован").length
  const totalCompletions = tests.reduce((sum, t) => sum + t.completions, 0)

  const totalPages = Math.max(1, Math.ceil(filteredTests.length / PAGE_SIZE))

  const paginatedTests = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredTests.slice(start, start + PAGE_SIZE)
  }, [filteredTests, page])

  function resetForm() {
    setNewTitle("")
    setNewCategory("Личность")
    setNewStatus("Черновик")
    setNewQuestions("20")
  }

  function handleCreateTest() {
    if (!newTitle.trim()) return
    const today = new Date().toLocaleDateString("ru-RU")
    const newTest: TestItem = {
      id: String(Date.now()),
      title: newTitle.trim(),
      category: newCategory,
      status: newStatus,
      author: "Мария",
      questions: Number(newQuestions) || 0,
      completions: 0,
      averageScore: 0,
      createdAt: today,
    }
    setTests((prev) => [newTest, ...prev])
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

        {/* HEADER */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Управление тестами
            </h1>
            <p className="text-sm text-muted-foreground">
              Каталог тестов по психологическому тестированию, статусы
              публикации и аналитика прохождения
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <ThemeToggle />

            <Sheet open={sheetOpen} onOpenChange={handleOpenSheet}>
              <SheetTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Создать тест
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-full p-0 sm:max-w-[560px]">
                <div className="flex h-full flex-col">
                  <SheetHeader className="border-b px-6 py-5 text-left">
                    <SheetTitle>Новый тест</SheetTitle>
                    <SheetDescription>
                      Быстрое создание теста по психологическому тестированию
                    </SheetDescription>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto px-6 py-6">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Название теста</label>
                        <Input
                          placeholder="Например, Шкала тревожности"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                        />
                      </div>

                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Категория</label>
                        <Select
                          value={newCategory}
                          onValueChange={(v) => setNewCategory(v as TestCategory)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите категорию" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Личность">Личность</SelectItem>
                            <SelectItem value="Тревожность">Тревожность</SelectItem>
                            <SelectItem value="Стресс">Стресс</SelectItem>
                            <SelectItem value="Самооценка">Самооценка</SelectItem>
                            <SelectItem value="Эмоциональный интеллект">
                              Эмоциональный интеллект
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Статус</label>
                        <Select
                          value={newStatus}
                          onValueChange={(v) => setNewStatus(v as TestStatus)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите статус" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Черновик">Черновик</SelectItem>
                            <SelectItem value="Опубликован">Опубликован</SelectItem>
                            <SelectItem value="Архив">Архив</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-2">
                        <label className="text-sm font-medium">Количество вопросов</label>
                        <Input
                          type="number"
                          min={1}
                          value={newQuestions}
                          onChange={(e) => setNewQuestions(e.target.value)}
                        />
                      </div>

                      <Button className="mt-2 w-full" onClick={handleCreateTest}>
                        Создать тест
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* ✅ KPI — вставлен */}
        <TestsStats
          totalTests={totalTests}
          publishedTests={publishedTests}
          totalCompletions={totalCompletions}
        />

        {/* TABLE */}
        <Card>
          <CardHeader>
            <CardTitle>Каталог тестов</CardTitle>
            <CardDescription>
              Поиск, фильтрация и навигация по тестам
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value)
                    setPage(1)
                  }}
                  placeholder="Поиск по названию теста или автору"
                  className="pl-9"
                />
              </div>

              <Select
                value={category}
                onValueChange={(v) => { setCategory(v); setPage(1) }}
              >
                <SelectTrigger className="w-full lg:w-[260px]">
                  <SelectValue placeholder="Категория" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  <SelectItem value="Личность">Личность</SelectItem>
                  <SelectItem value="Тревожность">Тревожность</SelectItem>
                  <SelectItem value="Стресс">Стресс</SelectItem>
                  <SelectItem value="Самооценка">Самооценка</SelectItem>
                  <SelectItem value="Эмоциональный интеллект">
                    Эмоциональный интеллект
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Tabs
              value={statusTab}
              onValueChange={(v) => { setStatusTab(v); setPage(1) }}
            >
              <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
                <TabsTrigger value="all">Все</TabsTrigger>
                <TabsTrigger value="Опубликован">Опубликованные</TabsTrigger>
                <TabsTrigger value="Черновик">Черновики</TabsTrigger>
                <TabsTrigger value="Архив">Архив</TabsTrigger>
              </TabsList>
            </Tabs>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Тест</TableHead>
                  <TableHead>Категория</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Автор</TableHead>
                  <TableHead>Вопросов</TableHead>
                  <TableHead>Прохождений</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {paginatedTests.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{test.title}</span>
                        <span className="text-xs text-muted-foreground">
                          Создан: {test.createdAt}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{test.category}</TableCell>
                    <TableCell>
                      <Badge variant={getTestStatusVariant(test.status)}>
                        {test.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{test.author}</TableCell>
                    <TableCell>{test.questions}</TableCell>
                    <TableCell>{test.completions}</TableCell>
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
                          <DropdownMenuItem>Дублировать</DropdownMenuItem>
                          <DropdownMenuItem className="text-red-500 focus:text-red-500">
                            Архивировать
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}

                {paginatedTests.length === 0 && (
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

            <div className="flex flex-col gap-4 border-t pt-4 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-muted-foreground">
                Показано{" "}
                <span className="font-medium text-foreground">
                  {filteredTests.length === 0
                    ? 0
                    : (page - 1) * PAGE_SIZE + 1}
                  -{Math.min(page * PAGE_SIZE, filteredTests.length)}
                </span>{" "}
                из{" "}
                <span className="font-medium text-foreground">
                  {filteredTests.length}
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