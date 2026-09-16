import { useCallback, useEffect, useState } from "react"
import { Pencil, Plus, Trash2 } from "lucide-react"

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
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { categories as categoriesApi } from "@/api/endpoints"
import type { ExistingCategory, NewCategory } from "@/api/types"
import { ApiError } from "@/api/client"
import { useAuth } from "@/api/auth-context"

const EMPTY: NewCategory = { name: "", color: "#667eea", icon: "🧠" }

export default function CategoriesPage() {
  const { hasPermission } = useAuth()
  const canEdit = hasPermission("CATEGORIES_EDIT")
  const [items, setItems] = useState<ExistingCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<ExistingCategory | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<NewCategory>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<ExistingCategory | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const list = await categoriesApi.list()
      setItems(list)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить категории")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  function openCreate() {
    setEditing(null)
    setForm(EMPTY)
    setCreating(true)
  }

  function openEdit(cat: ExistingCategory) {
    setEditing(cat)
    setForm({ name: cat.name, color: cat.color, icon: cat.icon })
    setCreating(true)
  }

  async function save() {
    if (!form.name.trim()) {
      setError("Введите название категории")
      return
    }
    setSaving(true)
    setError(null)
    try {
      if (editing) {
        await categoriesApi.update(editing.id, form)
      } else {
        await categoriesApi.create(form)
      }
      setCreating(false)
      setEditing(null)
      await load()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : "Не удалось сохранить категорию",
      )
    } finally {
      setSaving(false)
    }
  }

  async function performDelete() {
    if (!confirmDelete) return
    setIsDeleting(true)
    setError(null)
    try {
      await categoriesApi.remove(confirmDelete.id)
      setConfirmDelete(null)
      await load()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : "Не удалось удалить категорию",
      )
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Категории
            </h1>
            <p className="text-sm text-muted-foreground">
              Категории для группировки тестов и опросов
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <ThemeToggle />
            {canEdit ? (
              <Button size="sm" onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Добавить категорию
              </Button>
            ) : null}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Все категории</CardTitle>
            <CardDescription>
              {loading ? "Загрузка..." : `Всего: ${items.length}`}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error ? (
              <div className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-600">
                {error}
              </div>
            ) : null}

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[60px]">Иконка</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Цвет</TableHead>
                  <TableHead className="w-[120px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell className="text-2xl">{cat.icon}</TableCell>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className="inline-block h-5 w-5 rounded-full border"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="text-xs text-muted-foreground">
                          {cat.color}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {canEdit ? (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEdit(cat)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-500"
                            onClick={() => setConfirmDelete(cat)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      ) : null}
                    </TableCell>
                  </TableRow>
                ))}
                {!loading && items.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="py-10 text-center text-muted-foreground"
                    >
                      Категорий пока нет
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={creating} onOpenChange={(o) => !saving && setCreating(o)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Редактировать категорию" : "Новая категория"}
            </DialogTitle>
            <DialogDescription>
              Название, иконка (эмодзи) и цвет для отображения
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label htmlFor="cat-name">Название</Label>
              <Input
                id="cat-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Личность"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="cat-icon">Иконка (эмодзи)</Label>
                <Input
                  id="cat-icon"
                  value={form.icon}
                  onChange={(e) => setForm({ ...form, icon: e.target.value })}
                  placeholder="🧠"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="cat-color">Цвет</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="cat-color"
                    type="color"
                    value={form.color}
                    onChange={(e) =>
                      setForm({ ...form, color: e.target.value })
                    }
                    className="h-10 w-16 p-1"
                  />
                  <Input
                    value={form.color}
                    onChange={(e) =>
                      setForm({ ...form, color: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreating(false)}
              disabled={saving}
            >
              Отмена
            </Button>
            <Button onClick={() => void save()} disabled={saving}>
              {saving ? "Сохраняем..." : "Сохранить"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={confirmDelete !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setConfirmDelete(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить категорию?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmDelete
                ? `«${confirmDelete.name}» будет удалена. У тестов и опросов, привязанных к ней, категория станет пустой.`
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
