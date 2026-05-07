import { useCallback, useEffect, useMemo, useState } from "react"
import { MoreHorizontal, Plus, Shield, Trash2 } from "lucide-react"

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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { roles as rolesApi } from "@/api/endpoints"
import type { ExistingRole, NewRole, Permission } from "@/api/types"
import { ApiError } from "@/api/client"

const ALL_PERMISSIONS: { value: Permission; label: string }[] = [
  { value: "ADMIN", label: "Полный доступ (ADMIN)" },
  { value: "ROLES_VIEW", label: "Просмотр ролей" },
  { value: "ROLES_EDIT", label: "Редактирование ролей" },
  { value: "TESTS_VIEW", label: "Просмотр тестов" },
  { value: "TESTS_EDIT", label: "Редактирование тестов" },
  { value: "QUESTIONS_EDIT", label: "Редактирование вопросов" },
  { value: "USERS_VIEW", label: "Просмотр пользователей" },
  { value: "SESSIONS_VIEW", label: "Просмотр сессий" },
]

type FormState = {
  name: string
  color: string
  permissions: Permission[]
}

const emptyForm: FormState = {
  name: "",
  color: "#3b82f6",
  permissions: [],
}

export default function RolesPage() {
  const [items, setItems] = useState<ExistingRole[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [sheetOpen, setSheetOpen] = useState(false)
  const [editing, setEditing] = useState<ExistingRole | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await rolesApi.list()
      setItems(result)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось загрузить роли",
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const totalRoles = items.length

  const sorted = useMemo(
    () => [...items].sort((a, b) => a.name.localeCompare(b.name, "ru")),
    [items],
  )

  function openCreate() {
    setEditing(null)
    setForm(emptyForm)
    setSheetOpen(true)
  }

  function openEdit(role: ExistingRole) {
    setEditing(role)
    setForm({
      name: role.name,
      color: role.color ?? "#3b82f6",
      permissions: [...role.permissions],
    })
    setSheetOpen(true)
  }

  function togglePermission(p: Permission) {
    setForm((prev) =>
      prev.permissions.includes(p)
        ? { ...prev, permissions: prev.permissions.filter((x) => x !== p) }
        : { ...prev, permissions: [...prev.permissions, p] },
    )
  }

  async function handleSave() {
    if (!form.name.trim()) {
      setError("Введите название роли")
      return
    }

    const body: NewRole = {
      name: form.name.trim(),
      color: form.color || null,
      permissions: form.permissions,
    }

    setSaving(true)
    setError(null)
    try {
      if (editing) {
        await rolesApi.update(editing.id, body)
      } else {
        await rolesApi.create(body)
      }
      setSheetOpen(false)
      setForm(emptyForm)
      setEditing(null)
      await load()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Не удалось сохранить роль",
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(role: ExistingRole) {
    try {
      await rolesApi.remove(role.id)
      await load()
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Не удалось удалить роль",
      )
    }
  }

  const handleOpenSheet = (open: boolean) => {
    setSheetOpen(open)
    if (!open) {
      setEditing(null)
      setForm(emptyForm)
    }
  }

  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Управление ролями
            </h1>
            <p className="text-sm text-muted-foreground">
              Роли и набор прав доступа в системе
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <ThemeToggle />

            <Sheet open={sheetOpen} onOpenChange={handleOpenSheet}>
              <SheetTrigger asChild>
                <Button size="sm" onClick={openCreate}>
                  <Plus className="mr-2 h-4 w-4" />
                  Новая роль
                </Button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="w-full sm:max-w-[560px] p-0"
              >
                <div className="flex h-full flex-col">
                  <SheetHeader className="border-b px-6 py-5 text-left">
                    <SheetTitle>
                      {editing ? "Редактирование роли" : "Новая роль"}
                    </SheetTitle>
                    <SheetDescription>
                      Название, цвет и набор прав доступа
                    </SheetDescription>
                  </SheetHeader>

                  <div className="flex-1 overflow-y-auto px-6 py-6">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="role-name">Название</Label>
                        <Input
                          id="role-name"
                          placeholder="Например, Администратор"
                          value={form.name}
                          onChange={(e) =>
                            setForm((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="role-color">Цвет</Label>
                        <div className="flex items-center gap-3">
                          <input
                            id="role-color"
                            type="color"
                            value={form.color}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                color: e.target.value,
                              }))
                            }
                            className="h-9 w-12 cursor-pointer rounded border bg-transparent"
                          />
                          <Input
                            value={form.color}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                color: e.target.value,
                              }))
                            }
                            placeholder="#3b82f6"
                          />
                        </div>
                      </div>

                      <div className="grid gap-2">
                        <Label>Права доступа</Label>
                        <div className="grid gap-2 rounded-md border p-3">
                          {ALL_PERMISSIONS.map((p) => {
                            const checked = form.permissions.includes(p.value)
                            return (
                              <label
                                key={p.value}
                                className="flex cursor-pointer items-center gap-2 text-sm"
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => togglePermission(p.value)}
                                />
                                <span>{p.label}</span>
                              </label>
                            )
                          })}
                        </div>
                      </div>

                      <Button
                        className="mt-2 w-full"
                        onClick={handleSave}
                        disabled={saving}
                      >
                        {saving
                          ? "Сохраняем..."
                          : editing
                            ? "Сохранить"
                            : "Создать роль"}
                      </Button>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
            <div>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Всего ролей
              </CardTitle>
            </div>
            <Shield className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold tracking-tight">
              {loading ? "…" : totalRoles}
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
            <CardTitle>Список ролей</CardTitle>
            <CardDescription>
              {loading ? "Загрузка..." : `Найдено: ${sorted.length}`}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Роль</TableHead>
                  <TableHead>Права</TableHead>
                  <TableHead className="w-[60px]" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {sorted.map((role) => (
                  <TableRow
                    key={role.id}
                    className="cursor-pointer"
                    onClick={() => openEdit(role)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {role.color ? (
                          <span
                            className="inline-block h-3 w-3 rounded-full border"
                            style={{ background: role.color }}
                          />
                        ) : null}
                        <span className="font-medium">{role.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.length === 0 ? (
                          <span className="text-xs text-muted-foreground">
                            Нет прав
                          </span>
                        ) : (
                          role.permissions.map((p) => (
                            <Badge key={p} variant="secondary">
                              {p}
                            </Badge>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(role)}>
                            Редактировать
                          </DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem
                                className="text-red-500 focus:text-red-500"
                                onSelect={(e) => e.preventDefault()}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Удалить
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Удалить роль «{role.name}»?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Действие нельзя отменить. Пользователи с этой
                                  ролью останутся без неё.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Отмена</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => handleDelete(role)}
                                >
                                  Удалить
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}

                {!loading && sorted.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="py-10 text-center text-muted-foreground"
                    >
                      Роли не найдены
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
