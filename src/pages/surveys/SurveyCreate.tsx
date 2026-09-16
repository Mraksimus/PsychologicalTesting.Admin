import * as React from "react"
import type { ReactNode } from "react"
import { useCallback, useEffect, useState } from "react"
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
import { useNavigate, useParams } from "react-router-dom"
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  InfoIcon,
  HelpCircleIcon,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  categories as categoriesApi,
  surveyQuestions as surveyQuestionsApi,
  surveys as surveysApi,
} from "@/api/endpoints"
import type {
  Answer,
  ChoiceContent,
  ExistingCategory,
  ExistingQuestion,
  ExistingSurvey,
  InputContent,
  QuestionContent,
} from "@/api/types"
import { ApiError } from "@/api/client"
import { useAuth } from "@/api/auth-context"

type QuestionKind = "SINGLE" | "MULTIPLE" | "SCALE" | "INPUT"

type DraftAnswer = {
  text: string
}

type DraftQuestion = {
  localId: string
  persistedId?: string
  kind: QuestionKind
  text: string
  options: DraftAnswer[]
}

function uid(): string {
  return Math.random().toString(36).slice(2, 9)
}

function makeAnswer(): DraftAnswer {
  return { text: "" }
}

function makeQuestion(kind: QuestionKind = "SINGLE"): DraftQuestion {
  return {
    localId: uid(),
    kind,
    text: "",
    options:
      kind === "SCALE"
        ? [
            { text: "Совсем нет" },
            { text: "2" },
            { text: "3" },
            { text: "4" },
            { text: "Полностью да" },
          ]
        : [makeAnswer(), makeAnswer()],
  }
}

function fromExistingQuestion(q: ExistingQuestion): DraftQuestion {
  if (q.content.type === "Choice") {
    const kind: QuestionKind =
      q.content.mod === "SCALE"
        ? "SCALE"
        : q.content.mod === "MULTIPLE"
        ? "MULTIPLE"
        : "SINGLE"
    return {
      localId: uid(),
      persistedId: q.id,
      kind,
      text: q.content.text,
      options: q.content.options.map((o) => ({ text: o.text })),
    }
  }
  return {
    localId: uid(),
    persistedId: q.id,
    kind: "INPUT",
    text: q.content.text,
    options: [makeAnswer(), makeAnswer()],
  }
}

function toContent(q: DraftQuestion): QuestionContent {
  if (q.kind === "INPUT") {
    const input: InputContent = {
      type: "Input",
      text: q.text,
      correctInputs: null,
    }
    return input
  }
  const options: Answer[] = q.options.map((o, i) => ({
    index: i,
    text: o.text,
  }))
  const choice: ChoiceContent = {
    type: "Choice",
    text: q.text,
    mod:
      q.kind === "SCALE"
        ? "SCALE"
        : q.kind === "MULTIPLE"
        ? "MULTIPLE"
        : "SINGLE",
    options,
  }
  return choice
}

export default function SurveyCreatePage() {
  const navigate = useNavigate()
  const { hasPermission } = useAuth()
  const canEdit = hasPermission("SURVEYS_EDIT")
  const canEditQuestions = hasPermission("SURVEY_QUESTIONS_EDIT")
  const { surveyId } = useParams<{ surveyId?: string }>()
  const isEdit = Boolean(surveyId)

  const [survey, setSurvey] = useState<ExistingSurvey | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [durationMins, setDurationMins] = useState("5")
  const [isActive, setIsActive] = useState(false)
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [categoriesList, setCategoriesList] = useState<ExistingCategory[]>([])

  const [questions, setQuestions] = useState<DraftQuestion[]>([makeQuestion()])

  const [loading, setLoading] = useState<boolean>(isEdit)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  )

  function handleQuestionsDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    setQuestions((prev) => {
      const from = prev.findIndex((q) => q.localId === active.id)
      const to = prev.findIndex((q) => q.localId === over.id)
      if (from === -1 || to === -1) return prev
      return arrayMove(prev, from, to)
    })
  }

  const load = useCallback(async () => {
    if (!surveyId) return
    setLoading(true)
    setError(null)
    try {
      const details = await surveysApi.byId(surveyId)
      setSurvey(details.survey)
      setTitle(details.survey.name)
      setDescription(details.survey.description)
      setDurationMins(details.survey.durationMins)
      setIsActive(details.survey.isActive)
      setCategoryId(details.survey.categoryId ?? null)
      setQuestions(
        details.questions.length > 0
          ? details.questions.map(fromExistingQuestion)
          : [makeQuestion()],
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить опрос")
    } finally {
      setLoading(false)
    }
  }, [surveyId])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    categoriesApi
      .list()
      .then(setCategoriesList)
      .catch(() => setCategoriesList([]))
  }, [])

  function updateQuestion(localId: string, patch: Partial<DraftQuestion>) {
    setQuestions((prev) =>
      prev.map((q) => (q.localId === localId ? { ...q, ...patch } : q)),
    )
  }

  function removeQuestion(localId: string) {
    setQuestions((prev) =>
      prev.length === 1 ? prev : prev.filter((q) => q.localId !== localId),
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
          ? { ...q, options: [...q.options, makeAnswer()] }
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
        durationMins,
        isActive: publish,
        categoryId,
      }

      if (!body.name) {
        setError("Введите название опроса")
        return
      }

      let savedId: string
      if (survey) {
        await surveysApi.update(survey.id, body)
        savedId = survey.id
        setSurvey({ ...survey, ...body })
      } else {
        const created = await surveysApi.create(body)
        savedId = created.id
        setSurvey(created)
      }

      const newDrafts: DraftQuestion[] = []
      for (const q of questions) {
        if (!q.text.trim()) {
          newDrafts.push(q)
          continue
        }
        const content = toContent(q)
        if (q.persistedId) {
          await surveyQuestionsApi.update(savedId, q.persistedId, { content })
          newDrafts.push(q)
        } else {
          const created = await surveyQuestionsApi.create(savedId, { content })
          newDrafts.push({ ...q, persistedId: created.id })
        }
      }

      for (let i = 0; i < newDrafts.length; i++) {
        const persistedId = newDrafts[i].persistedId
        if (persistedId) {
          await surveyQuestionsApi.reorder(savedId, persistedId, i)
        }
      }
      setQuestions(newDrafts)

      setIsActive(publish)

      if (!isEdit) {
        navigate(`/surveys/${savedId}`, { replace: true })
      }
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : "Не удалось сохранить опрос",
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!survey) return
    try {
      await surveysApi.remove(survey.id)
      navigate("/surveys", { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось удалить опрос")
    }
  }

  async function handleDeleteQuestion(q: DraftQuestion) {
    if (q.persistedId && survey) {
      try {
        await surveyQuestionsApi.remove(survey.id, q.persistedId)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Не удалось удалить вопрос")
        return
      }
    }
    removeQuestion(q.localId)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
        Загрузка опроса...
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="mt-1 shrink-0"
            title="К списку опросов"
            onClick={() => navigate("/surveys")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0 flex-1">
            <h1
              className="truncate text-2xl font-semibold tracking-tight"
              title={title.trim() || "Новый опрос"}
            >
              {title.trim() || "Новый опрос"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEdit ? "Редактирование опроса" : "Создание нового опроса"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <ThemeToggle />
          {survey && hasPermission("SURVEY_SESSIONS_VIEW") ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/surveys/${survey.id}/sessions`)}
            >
              Результаты
            </Button>
          ) : null}
          {canEdit ? (
            isActive ? (
              <Button size="sm" onClick={() => save(true)} disabled={saving}>
                {saving ? "Сохраняем..." : "Сохранить"}
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => save(false)}
                  disabled={saving}
                >
                  {saving ? "Сохраняем..." : "Сохранить как черновик"}
                </Button>
                <Button size="sm" onClick={() => save(true)} disabled={saving}>
                  {saving ? "Публикуем..." : "Опубликовать"}
                </Button>
              </>
            )
          ) : null}
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
                Название, описание и длительность опроса
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid gap-1.5">
                <Label htmlFor="title">Название опроса</Label>
                <Input
                  id="title"
                  placeholder="Например, Обратная связь по интерфейсу"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  placeholder="Краткое описание опроса"
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

              <div className="grid gap-1.5">
                <Label>Категория</Label>
                <Select
                  value={categoryId ?? "__none__"}
                  onValueChange={(v) =>
                    setCategoryId(v === "__none__" ? null : v)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Без категории" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Без категории</SelectItem>
                    {categoriesList.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.icon} {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Questions */}
        <TabsContent value="questions" className="mt-4 space-y-3">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleQuestionsDragEnd}
          >
            <SortableContext
              items={questions.map((q) => q.localId)}
              strategy={verticalListSortingStrategy}
            >
          {questions.map((q, i) => (
            <SortableWrapper key={q.localId} id={q.localId}>
              {({ setActivatorNodeRef, attributes, listeners }) => (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    ref={setActivatorNodeRef}
                    {...attributes}
                    {...listeners}
                    className="mt-2 cursor-grab rounded text-muted-foreground hover:text-foreground"
                    title="Перетащить"
                  >
                    <GripVertical className="h-4 w-4 shrink-0" />
                  </button>
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

                    <div className="flex items-center gap-2">
                      <Select
                        value={q.kind}
                        onValueChange={(value) =>
                          updateQuestion(q.localId, {
                            kind: value as QuestionKind,
                          })
                        }
                      >
                        <SelectTrigger size="sm" className="w-[220px]">
                          <SelectValue placeholder="Тип вопроса" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SINGLE">Один вариант</SelectItem>
                          <SelectItem value="MULTIPLE">Несколько вариантов</SelectItem>
                          <SelectItem value="SCALE">Шкала</SelectItem>
                          <SelectItem value="INPUT">Текстовый ответ</SelectItem>
                        </SelectContent>
                      </Select>
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
                {q.kind === "INPUT" ? (
                  <p className="text-xs text-muted-foreground">
                    Пользователь введёт свой ответ в свободной форме.
                  </p>
                ) : (
                  <>
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
                  </>
                )}
              </CardContent>
            </Card>
              )}
            </SortableWrapper>
          ))}
            </SortableContext>
          </DndContext>

          {canEditQuestions ? (
            <Button variant="outline" className="w-full" onClick={addQuestion}>
              <Plus className="mr-2 h-4 w-4" />
              Добавить вопрос
            </Button>
          ) : null}
        </TabsContent>

        {/* Settings */}
        <TabsContent value="settings" className="mt-4 space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Текущий статус</CardTitle>
              <CardDescription>
                {isActive ? "Опрос опубликован" : "Опрос в черновике"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {canEdit ? (
                <Button
                  variant={isActive ? "secondary" : "default"}
                  onClick={() => save(!isActive)}
                  disabled={saving}
                >
                  {isActive ? "Снять с публикации" : "Опубликовать"}
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Нет прав на изменение статуса.
                </p>
              )}
            </CardContent>
          </Card>

          {survey && canEdit ? (
            <Card className="border-red-200 dark:border-red-900">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-red-600 dark:text-red-400">
                  Опасная зона
                </CardTitle>
                <CardDescription>
                  Удаление опроса удалит все его вопросы и сессии.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Separator className="mb-4" />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Удалить опрос
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Удалить опрос?</AlertDialogTitle>
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

interface SortableWrapperProps {
  id: string
  children: (bag: {
    setActivatorNodeRef: (element: HTMLElement | null) => void
    attributes: React.HTMLAttributes<HTMLElement>
    listeners: React.HTMLAttributes<HTMLElement> | undefined
  }) => ReactNode
}

function SortableWrapper({ id, children }: SortableWrapperProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      {children({
        setActivatorNodeRef,
        attributes: attributes as React.HTMLAttributes<HTMLElement>,
        listeners: listeners as React.HTMLAttributes<HTMLElement> | undefined,
      })}
    </div>
  )
}
