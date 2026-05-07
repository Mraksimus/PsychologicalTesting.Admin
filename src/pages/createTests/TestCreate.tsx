import { useCallback, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
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
  questions as questionsApi,
  tests as testsApi,
} from "@/api/endpoints"
import type {
  Answer,
  ChoiceContent,
  ExistingQuestion,
  ExistingTest,
} from "@/api/types"
import { ApiError } from "@/api/client"

type DraftAnswer = {
  index: number
  text: string
  score: number
}

type DraftQuestion = {
  // localId for unsaved questions; persistedId after creation
  localId: string
  persistedId?: string
  text: string
  options: DraftAnswer[]
}

function uid(): string {
  return Math.random().toString(36).slice(2, 9)
}

function makeAnswer(index: number): DraftAnswer {
  return { index, text: "", score: 0 }
}

function makeQuestion(): DraftQuestion {
  return {
    localId: uid(),
    text: "",
    options: [makeAnswer(0), makeAnswer(1)],
  }
}

function fromExistingQuestion(q: ExistingQuestion): DraftQuestion {
  if (q.content.type === "Choice") {
    return {
      localId: uid(),
      persistedId: q.id,
      text: q.content.text,
      options: q.content.options.map((o) => ({ ...o })),
    }
  }
  // INPUT not supported in UI yet — fall back to empty draft
  return {
    localId: uid(),
    persistedId: q.id,
    text: q.content.text,
    options: [makeAnswer(0), makeAnswer(1)],
  }
}

function toChoiceContent(q: DraftQuestion): ChoiceContent {
  const options: Answer[] = q.options.map((o, i) => ({
    index: i,
    text: o.text,
    score: o.score,
  }))
  return {
    type: "Choice",
    text: q.text,
    mod: "SINGLE",
    options,
  }
}

export default function TestCreatePage() {
  const navigate = useNavigate()
  const { testId } = useParams<{ testId?: string }>()
  const isEdit = Boolean(testId)

  const [test, setTest] = useState<ExistingTest | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [transcript, setTranscript] = useState("")
  const [durationMins, setDurationMins] = useState("15")
  const [isActive, setIsActive] = useState(false)

  const [questions, setQuestions] = useState<DraftQuestion[]>([
    makeQuestion(),
  ])

  const [loading, setLoading] = useState<boolean>(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!testId) return
    setLoading(true)
    setError(null)
    try {
      const details = await testsApi.byId(testId)
      setTest(details.test)
      setTitle(details.test.name)
      setDescription(details.test.description)
      setTranscript(details.test.transcript)
      setDurationMins(details.test.durationMins)
      setIsActive(details.test.isActive)
      setQuestions(
        details.questions.length > 0
          ? details.questions.map(fromExistingQuestion)
          : [makeQuestion()],
      )
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось загрузить тест",
      )
    } finally {
      setLoading(false)
    }
  }, [testId])

  useEffect(() => {
    void load()
  }, [load])

  function updateQuestion(localId: string, patch: Partial<DraftQuestion>) {
    setQuestions((prev) =>
      prev.map((q) => (q.localId === localId ? { ...q, ...patch } : q)),
    )
  }

  function removeQuestion(localId: string) {
    setQuestions((prev) =>
      prev.length === 1
        ? prev
        : prev.filter((q) => q.localId !== localId),
    )
  }

  function addQuestion() {
    setQuestions((prev) => [...prev, makeQuestion()])
  }

  function moveQuestion(localId: string, dir: "up" | "down") {
    setQuestions((prev) => {
      const idx = prev.findIndex((q) => q.localId === localId)
      if (idx === -1) return prev
      const next = [...prev]
      const swapIdx = dir === "up" ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= next.length) return prev
      ;[next[idx], next[swapIdx]] = [next[swapIdx], next[idx]]
      return next
    })
  }

  function addOption(localId: string) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.localId === localId
          ? { ...q, options: [...q.options, makeAnswer(q.options.length)] }
          : q,
      ),
    )
  }

  function updateOption(
    localId: string,
    optionIdx: number,
    patch: Partial<DraftAnswer>,
  ) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.localId === localId
          ? {
              ...q,
              options: q.options.map((o, i) =>
                i === optionIdx ? { ...o, ...patch } : o,
              ),
            }
          : q,
      ),
    )
  }

  function removeOption(localId: string, optionIdx: number) {
    setQuestions((prev) =>
      prev.map((q) =>
        q.localId === localId
          ? {
              ...q,
              options:
                q.options.length > 2
                  ? q.options.filter((_, i) => i !== optionIdx)
                  : q.options,
            }
          : q,
      ),
    )
  }

  async function save(publish: boolean) {
    setSaving(true)
    setError(null)
    try {
      const body = {
        name: title.trim(),
        description: description.trim(),
        transcript: transcript.trim(),
        durationMins,
        isActive: publish,
      }

      if (!body.name) {
        setError("Введите название теста")
        return
      }

      let savedId: string

      if (test) {
        await testsApi.update(test.id, body)
        savedId = test.id
        setTest({ ...test, ...body })
      } else {
        const created = await testsApi.create(body)
        savedId = created.id
        setTest(created)
      }

      // Save questions: existing → PATCH, new → POST. Skip empty.
      const newDrafts: DraftQuestion[] = []
      for (const q of questions) {
        if (!q.text.trim()) {
          newDrafts.push(q)
          continue
        }
        const content = toChoiceContent(q)
        if (q.persistedId) {
          await questionsApi.update(savedId, q.persistedId, { content })
          newDrafts.push(q)
        } else {
          const created = await questionsApi.create(savedId, { content })
          newDrafts.push({ ...q, persistedId: created.id })
        }
      }
      setQuestions(newDrafts)

      setIsActive(publish)

      if (!isEdit) {
        navigate(`/tests/${savedId}`, { replace: true })
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : "Не удалось сохранить тест",
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!test) return
    try {
      await testsApi.remove(test.id)
      navigate("/tests", { replace: true })
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось удалить тест",
      )
    }
  }

  async function handleDeleteQuestion(q: DraftQuestion) {
    if (q.persistedId && test) {
      try {
        await questionsApi.remove(test.id, q.persistedId)
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Не удалось удалить вопрос",
        )
        return
      }
    }
    removeQuestion(q.localId)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Загрузка теста...
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {title.trim() || "Новый тест"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEdit ? "Редактирование теста" : "Создание нового теста"}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          <Button
            variant="secondary"
            onClick={() => save(false)}
            disabled={saving}
          >
            {saving ? "Сохраняем..." : "Сохранить как черновик"}
          </Button>
          <Button onClick={() => save(true)} disabled={saving}>
            {saving ? "Публикуем..." : "Опубликовать"}
          </Button>
        </div>
      </div>

      {error ? (
        <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-600">
          {error}
        </div>
      ) : null}

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
        </TabsList>

        {/* Basic */}
        <TabsContent value="basic" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Основная информация</CardTitle>
              <CardDescription>
                Название, описание и длительность теста
              </CardDescription>
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
                  placeholder="Краткое описание теста"
                  className="min-h-[100px] resize-none"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="duration">Длительность (минут)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={1}
                  value={durationMins}
                  onChange={(e) => setDurationMins(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Questions */}
        <TabsContent value="questions" className="mt-4 space-y-3">
          {questions.map((q, i) => (
            <Card key={q.localId}>
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <GripVertical className="mt-2 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        Вопрос {i + 1}
                        {q.persistedId ? "" : " · не сохранён"}
                      </span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground"
                          disabled={i === 0}
                          onClick={() => moveQuestion(q.localId, "up")}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground"
                          disabled={i === questions.length - 1}
                          onClick={() => moveQuestion(q.localId, "down")}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-red-500"
                          disabled={questions.length === 1}
                          onClick={() => handleDeleteQuestion(q)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <Textarea
                      placeholder="Текст вопроса"
                      value={q.text}
                      onChange={(e) =>
                        updateQuestion(q.localId, { text: e.target.value })
                      }
                      className="min-h-[64px] resize-none"
                    />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pl-10">
                <div className="space-y-2">
                  {q.options.map((option, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <span className="w-5 shrink-0 text-center text-xs text-muted-foreground">
                        {oi + 1}
                      </span>
                      <Input
                        placeholder={`Вариант ${oi + 1}`}
                        value={option.text}
                        onChange={(e) =>
                          updateOption(q.localId, oi, {
                            text: e.target.value,
                          })
                        }
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        value={option.score}
                        onChange={(e) =>
                          updateOption(q.localId, oi, {
                            score: Number(e.target.value) || 0,
                          })
                        }
                        className="w-20"
                        title="Балл"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-muted-foreground hover:text-red-500"
                        disabled={q.options.length <= 2}
                        onClick={() => removeOption(q.localId, oi)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-muted-foreground"
                  onClick={() => addOption(q.localId)}
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Добавить вариант
                </Button>
              </CardContent>
            </Card>
          ))}

          <Button variant="outline" className="w-full" onClick={addQuestion}>
            <Plus className="mr-2 h-4 w-4" />
            Добавить вопрос
          </Button>
        </TabsContent>

        {/* Interpretation */}
        <TabsContent value="interpretation" className="mt-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Расшифровка для ИИ</CardTitle>
              <CardDescription>
                Текст, который LLM использует для интерпретации результатов.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={`Например:\n0–20 баллов — минимум\n21–40 — умеренно\n41+ — высокий уровень`}
                className="min-h-[260px] resize-y font-mono text-sm"
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="mt-4 space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Текущий статус</CardTitle>
              <CardDescription>
                {isActive ? "Тест опубликован" : "Тест в черновике"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant={isActive ? "secondary" : "default"}
                onClick={() => save(!isActive)}
                disabled={saving}
              >
                {isActive ? "Снять с публикации" : "Опубликовать"}
              </Button>
            </CardContent>
          </Card>

          {test ? (
            <Card className="border-red-200 dark:border-red-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-red-600 dark:text-red-400">
                  Опасная зона
                </CardTitle>
                <CardDescription>
                  Удаление теста удалит все его вопросы и сессии.
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
                        Это действие нельзя отменить.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Отмена</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        onClick={handleDelete}
                      >
                        Удалить
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          ) : null}
        </TabsContent>
      </Tabs>
    </div>
  )
}
