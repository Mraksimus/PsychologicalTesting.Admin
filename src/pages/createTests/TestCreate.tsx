import { useState } from "react"
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  InfoIcon,
  HelpCircleIcon,
  BrainIcon,
  SettingsIcon,
  ClipboardListIcon,
} from "lucide-react"

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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// ─── Types ────────────────────────────────────────────────────────────────────

type TestStatus = "Черновик" | "Опубликован" | "Архив"
type TestCategory =
  | "Личность"
  | "Тревожность"
  | "Стресс"
  | "Самооценка"
  | "Эмоциональный интеллект"

type AnswerOption = {
  id: string
  text: string
}

type Question = {
  id: string
  text: string
  options: AnswerOption[]
}

type TestResult = {
  id: string
  respondent: string
  email: string
  completedAt: string
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockResults: TestResult[] = [
  { id: "r1", respondent: "Алексей Орлов",  email: "orlov@company.ru",    completedAt: "18.04.2026"  },
  { id: "r2", respondent: "Ирина Новикова", email: "novikova@company.ru", completedAt: "19.04.2026" },
  { id: "r3", respondent: "Николай Попов",  email: "popov@company.ru",    completedAt: "20.04.2026" },
  { id: "r4", respondent: "Татьяна Ларина", email: "larina@company.ru",   completedAt: "20.04.2026" },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

function makeOption(): AnswerOption {
  return { id: uid(), text: "" }
}

function makeQuestion(): Question {
  return { id: uid(), text: "", options: [makeOption(), makeOption()] }
}

// ─── AnswerOptionRow ──────────────────────────────────────────────────────────

function AnswerOptionRow({
 option,
 index,
 canRemove,
 onChange,
 onRemove,
}: {
  option: AnswerOption
  index: number
  canRemove: boolean
  onChange: (id: string, field: keyof AnswerOption, value: string | number) => void
  onRemove: (id: string) => void
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-5 shrink-0 text-center text-xs text-muted-foreground">
        {index + 1}
      </span>

      <Input
        placeholder={`Вариант ${index + 1}`}
        value={option.text}
        onChange={(e) => onChange(option.id, "text", e.target.value)}
        className="flex-1"
      />

      <Button
        variant="ghost"
        size="icon"
        className="shrink-0 text-muted-foreground hover:text-red-500"
        disabled={!canRemove}
        onClick={() => onRemove(option.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  )
}

// ─── QuestionCard ─────────────────────────────────────────────────────────────

function QuestionCard({
                        question,
                        index,
                        total,
                        onChange,
                        onRemove,
                        onMoveUp,
                        onMoveDown,
                      }: {
  question: Question
  index: number
  total: number
  onChange: (id: string, updated: Question) => void
  onRemove: (id: string) => void
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
}) {
  function updateOption(optionId: string, field: keyof AnswerOption, value: string | number) {
    onChange(question.id, {
      ...question,
      options: question.options.map((o) =>
        o.id === optionId ? { ...o, [field]: value } : o
      ),
    })
  }

  function removeOption(optionId: string) {
    onChange(question.id, {
      ...question,
      options: question.options.filter((o) => o.id !== optionId),
    })
  }

  function addOption() {
    onChange(question.id, {
      ...question,
      options: [...question.options, makeOption()],
    })
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <GripVertical className="mt-2 h-4 w-4 shrink-0 text-muted-foreground" />

          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Вопрос {index + 1}
              </span>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground"
                  disabled={index === 0}
                  onClick={() => onMoveUp(question.id)}
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground"
                  disabled={index === total - 1}
                  onClick={() => onMoveDown(question.id)}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-red-500"
                  disabled={total === 1}
                  onClick={() => onRemove(question.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Textarea
              placeholder="Текст вопроса"
              value={question.text}
              onChange={(e) =>
                onChange(question.id, { ...question, text: e.target.value })
              }
              className="min-h-[64px] resize-none"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 pl-10">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-muted-foreground">Тип вопроса</Label>
          <Badge variant="outline" className="text-xs">
            Варианты ответов
          </Badge>
        </div>

        <div className="space-y-2">
          {question.options.map((option, i) => (
            <AnswerOptionRow
              key={option.id}
              option={option}
              index={i}
              canRemove={question.options.length > 2}
              onChange={updateOption}
              onRemove={removeOption}
            />
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs text-muted-foreground"
          onClick={addOption}
        >
          <Plus className="mr-1 h-3 w-3" />
          Добавить вариант
        </Button>
      </CardContent>
    </Card>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CreateTestPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<TestCategory | "">("")
  const [questions, setQuestions] = useState<Question[]>([makeQuestion()])
  const [interpretation, setInterpretation] = useState("")
  const [status, setStatus] = useState<TestStatus>("Черновик")
  const [selectedResult, setSelectedResult] = useState<TestResult | null>(null)

  function updateQuestion(id: string, updated: Question) {
    setQuestions((prev) => prev.map((q) => (q.id === id ? updated : q)))
  }

  function removeQuestion(id: string) {
    setQuestions((prev) => prev.filter((q) => q.id !== id))
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, makeQuestion()])
  }

  function moveQuestion(id: string, dir: "up" | "down") {
    setQuestions((prev) => {
      const idx = prev.findIndex((q) => q.id === id)
      if (idx === -1) return prev
      const next = [...prev]
      const swap = dir === "up" ? idx - 1 : idx + 1
      if (swap < 0 || swap >= next.length) return prev
        ;[next[idx], next[swap]] = [next[swap], next[idx]]
      return next
    })
  }

  return (
    <div className="flex flex-col gap-4 p-4 max-w-3xl mx-auto">

      {/* HEADER */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {title.trim() || "Новый тест"}
          </h1>
          <p className="text-sm text-muted-foreground">
            Конструктор психологического теста
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <Button variant="secondary">
            Сохранить как черновик
          </Button>
          <Button>
            Опубликовать
          </Button>
        </div>
      </div>

      {/* TABS */}
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="basic" className="gap-1.5">
            <InfoIcon className="h-4 w-4" />
            Основное
          </TabsTrigger>
          <TabsTrigger value="questions" className="gap-1.5">
            <HelpCircleIcon className="h-4 w-4" />
            Вопросы
          </TabsTrigger>
          <TabsTrigger value="interpretation" className="gap-1.5">
            <BrainIcon className="h-4 w-4" />
            Расшифровка
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-1.5">
            <SettingsIcon className="h-4 w-4" />
            Настройки
          </TabsTrigger>
          <TabsTrigger value="answers" className="gap-1.5">
            <ClipboardListIcon className="h-4 w-4" />
            Ответы
          </TabsTrigger>
        </TabsList>

        {/* ── Основное ── */}
        <TabsContent value="basic" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Основная информация</CardTitle>
              <CardDescription>Название, описание и категория теста</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-1.5">
                <Label htmlFor="title">Название теста</Label>
                <Input
                  id="title"
                  placeholder="Например, Шкала тревожности Бека"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  placeholder="Краткое описание теста, его цели и области применения"
                  className="min-h-[100px] resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid gap-1.5">
                <Label>Категория</Label>
                <Select
                  value={category}
                  onValueChange={(v) => setCategory(v as TestCategory)}
                >
                  <SelectTrigger className="w-full md:w-[280px]">
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Вопросы ── */}
        <TabsContent value="questions" className="mt-4 space-y-3">
          {questions.map((q, i) => (
            <QuestionCard
              key={q.id}
              question={q}
              index={i}
              total={questions.length}
              onChange={updateQuestion}
              onRemove={removeQuestion}
              onMoveUp={(id) => moveQuestion(id, "up")}
              onMoveDown={(id) => moveQuestion(id, "down")}
            />
          ))}

          <Button variant="outline" className="w-full" onClick={addQuestion}>
            <Plus className="mr-2 h-4 w-4" />
            Добавить вопрос
          </Button>
        </TabsContent>

        {/* ── Расшифровка ── */}
        <TabsContent value="interpretation" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Расшифровка для ИИ</CardTitle>
              <CardDescription>
                Опишите шкалы и их интерпретацию. ИИ будет
                использовать этот текст для генерации персонализированного
                заключения по результатам теста.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={`Например:\n0–20 баллов — минимальный уровень тревожности\n21–40 баллов — умеренная тревожность\n41–60 баллов — высокая тревожность\n\nОбратите особое внимание на...`}
                className="min-h-[260px] resize-y font-mono text-sm"
                value={interpretation}
                onChange={(e) => setInterpretation(e.target.value)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Настройки ── */}
        <TabsContent value="settings" className="mt-4 space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Статус теста</CardTitle>
              <CardDescription>
                Управляйте видимостью теста для пользователей
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as TestStatus)}
              >
                <SelectTrigger className="w-full md:w-[260px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Черновик">Черновик</SelectItem>
                  <SelectItem value="Опубликован">Опубликован</SelectItem>
                  <SelectItem value="Архив">Архив</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card className="border-red-200 dark:border-red-900">
            <CardHeader className="pb-3">
              <CardTitle className="text-base text-red-600 dark:text-red-400">
                Опасная зона
              </CardTitle>
              <CardDescription>
                Удаление теста необратимо. Все вопросы и ответы будут удалены.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Separator className="mb-4" />
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Удалить тест
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Удалить тест?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Это действие нельзя отменить. Тест, все вопросы и
                      результаты прохождений будут удалены навсегда.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                    <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                      Удалить
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Ответы ── */}
        <TabsContent value="answers" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Ответы респондентов</CardTitle>
              <CardDescription>
                {mockResults.length} прохождений теста
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mockResults.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  Пока никто не прошёл этот тест
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Респондент</TableHead>
                      <TableHead>Дата</TableHead>
                      <TableHead className="w-[100px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockResults.map((result) => (
                      <TableRow key={result.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{result.respondent}</span>
                            <span className="text-xs text-muted-foreground">
                              {result.email}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{result.completedAt}</TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedResult(result)}
                          >
                            Результаты
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ── Result Dialog ── */}
      <Dialog
        open={!!selectedResult}
        onOpenChange={(open) => {
          if (!open) setSelectedResult(null)
        }}
      >
        <DialogContent className="sm:max-w-[460px]">
          <DialogHeader>
            <DialogTitle>
              Результаты — {selectedResult?.respondent}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Дата</p>
                <p className="text-sm font-medium">
                  {selectedResult?.completedAt}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Интерпретация ИИ</p>
              <div className="rounded-lg bg-muted/50 p-4 text-sm text-muted-foreground whitespace-pre-wrap">
                {interpretation.trim()
                  ? interpretation
                  : "Расшифровка не заполнена. Добавьте её на вкладке «Расшифровка»."}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}