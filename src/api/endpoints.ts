import { apiFetch } from "./client"
import type {
  AdminSessionItem,
  AdminUserItem,
  ExistingQuestion,
  ExistingRole,
  ExistingTest,
  NewQuestionRequest,
  NewRole,
  NewTest,
  PageResponse,
  TestDetails,
  Token,
  UUID,
} from "./types"

// ───────── Auth ─────────

export const auth = {
  login: (email: string, password: string) =>
    apiFetch<Token>("/auth/login", {
      method: "POST",
      auth: false,
      body: { email, password },
    }),
  register: (data: {
    name: string
    surname: string
    patronymic?: string | null
    email: string
    password: string
  }) =>
    apiFetch<Token>("/auth/register", {
      method: "POST",
      auth: false,
      body: data,
    }),
}

// ───────── Profile ─────────

export const profile = {
  me: () =>
    apiFetch<{
      name: string
      surname: string
      patronymic?: string | null
      email: string
      sessionsCount: number
      completedSessionsCount: number
      inProgressSessionsCount: number
      registeredAt: string
      lastLoginAt?: string | null
    }>("/user/profile"),
}

// ───────── Roles ─────────

export const roles = {
  list: () => apiFetch<ExistingRole[]>("/admin/roles"),
  create: (body: NewRole) =>
    apiFetch<ExistingRole>("/admin/roles/new", {
      method: "POST",
      body,
    }),
  update: (id: UUID, body: NewRole) =>
    apiFetch<void>(`/admin/roles/${id}`, {
      method: "PATCH",
      body,
    }),
  remove: (id: UUID) =>
    apiFetch<void>(`/admin/roles/${id}`, {
      method: "DELETE",
    }),
  assignToUser: (userId: UUID, roleId: UUID | null) =>
    apiFetch<void>(`/admin/roles/users/${userId}`, {
      method: "PUT",
      body: { roleId },
    }),
}

// ───────── Users (admin) ─────────

export const users = {
  list: (params: {
    offset: number
    limit: number
    search?: string
    roleId?: UUID
  }) =>
    apiFetch<PageResponse<AdminUserItem>>("/admin/users", {
      query: {
        offset: params.offset,
        limit: params.limit,
        search: params.search,
        role_id: params.roleId,
      },
    }),
  byId: (id: UUID) =>
    apiFetch<AdminUserItem>(`/admin/users/${id}`),
}

// ───────── Tests (admin) ─────────

export const tests = {
  list: (params: { offset: number; limit: number }) =>
    apiFetch<PageResponse<ExistingTest>>("/admin/tests", {
      query: params,
    }),
  byId: (id: UUID) => apiFetch<TestDetails>(`/admin/tests/${id}`),
  create: (body: NewTest) =>
    apiFetch<ExistingTest>("/admin/tests/new", {
      method: "POST",
      body,
    }),
  update: (id: UUID, body: NewTest) =>
    apiFetch<void>(`/admin/tests/${id}`, {
      method: "PATCH",
      body,
    }),
  remove: (id: UUID) =>
    apiFetch<void>(`/admin/tests/${id}`, {
      method: "DELETE",
    }),
  reorder: (id: UUID, position: number) =>
    apiFetch<void>(`/admin/tests/${id}/position`, {
      method: "PUT",
      body: { position },
    }),
}

// ───────── Questions (admin) ─────────

export const questions = {
  list: (testId: UUID) =>
    apiFetch<ExistingQuestion[]>(`/admin/tests/${testId}/questions`),
  create: (testId: UUID, body: NewQuestionRequest) =>
    apiFetch<ExistingQuestion>(`/admin/tests/${testId}/questions/new`, {
      method: "POST",
      body,
    }),
  update: (testId: UUID, questionId: UUID, body: NewQuestionRequest) =>
    apiFetch<void>(`/admin/tests/${testId}/questions/${questionId}`, {
      method: "PATCH",
      body,
    }),
  remove: (testId: UUID, questionId: UUID) =>
    apiFetch<void>(`/admin/tests/${testId}/questions/${questionId}`, {
      method: "DELETE",
    }),
  reorder: (testId: UUID, questionId: UUID, position: number) =>
    apiFetch<void>(`/admin/tests/${testId}/questions/${questionId}/position`, {
      method: "PUT",
      body: { position },
    }),
}

// ───────── Sessions (admin) ─────────

export const sessions = {
  byTest: (
    testId: UUID,
    params: { offset: number; limit: number },
  ) =>
    apiFetch<PageResponse<AdminSessionItem>>(
      `/admin/tests/${testId}/sessions`,
      { query: params },
    ),
}
