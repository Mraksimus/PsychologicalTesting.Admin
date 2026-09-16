import { apiFetch } from "./client"
import type {
  AdminSessionItem,
  AdminSurveySessionItem,
  AdminUserItem,
  AuthResponse,
  ExistingCategory,
  ExistingQuestion,
  ExistingRole,
  ExistingSurvey,
  ExistingTest,
  NewCategory,
  NewQuestionRequest,
  NewRole,
  NewSurvey,
  NewTest,
  PageResponse,
  Permission,
  SurveyDetails,
  TestDetails,
  UUID,
} from "./types"

// ───────── Auth ─────────

export const auth = {
  login: (email: string, password: string) =>
    apiFetch<AuthResponse>("/auth/admin/login", {
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
    apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      auth: false,
      body: data,
    }),
}

// ───────── Admin me ─────────

export type AdminMeResponse = {
  role: ExistingRole | null
  permissions: Permission[]
}

export const adminMe = {
  get: () => apiFetch<AdminMeResponse>("/admin/me"),
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
  create: (body: {
    name: string
    surname: string
    patronymic?: string | null
    email: string
    password: string
    roleId?: UUID | null
  }) =>
    apiFetch<AdminUserItem>("/admin/users/new", {
      method: "POST",
      body,
    }),
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

// ───────── Surveys (admin) ─────────

export const surveys = {
  list: (params: { offset: number; limit: number }) =>
    apiFetch<PageResponse<ExistingSurvey>>("/admin/surveys", {
      query: params,
    }),
  byId: (id: UUID) => apiFetch<SurveyDetails>(`/admin/surveys/${id}`),
  create: (body: NewSurvey) =>
    apiFetch<ExistingSurvey>("/admin/surveys/new", {
      method: "POST",
      body,
    }),
  update: (id: UUID, body: NewSurvey) =>
    apiFetch<void>(`/admin/surveys/${id}`, {
      method: "PATCH",
      body,
    }),
  remove: (id: UUID) =>
    apiFetch<void>(`/admin/surveys/${id}`, {
      method: "DELETE",
    }),
  reorder: (id: UUID, position: number) =>
    apiFetch<void>(`/admin/surveys/${id}/position`, {
      method: "PUT",
      body: { position },
    }),
}

// ───────── Survey questions (admin) ─────────

export const surveyQuestions = {
  list: (surveyId: UUID) =>
    apiFetch<ExistingQuestion[]>(`/admin/surveys/${surveyId}/questions`),
  create: (surveyId: UUID, body: NewQuestionRequest) =>
    apiFetch<ExistingQuestion>(`/admin/surveys/${surveyId}/questions/new`, {
      method: "POST",
      body,
    }),
  update: (surveyId: UUID, questionId: UUID, body: NewQuestionRequest) =>
    apiFetch<void>(`/admin/surveys/${surveyId}/questions/${questionId}`, {
      method: "PATCH",
      body,
    }),
  remove: (surveyId: UUID, questionId: UUID) =>
    apiFetch<void>(`/admin/surveys/${surveyId}/questions/${questionId}`, {
      method: "DELETE",
    }),
  reorder: (surveyId: UUID, questionId: UUID, position: number) =>
    apiFetch<void>(
      `/admin/surveys/${surveyId}/questions/${questionId}/position`,
      {
        method: "PUT",
        body: { position },
      },
    ),
}

// ───────── Categories (admin) ─────────

export const categories = {
  list: () => apiFetch<ExistingCategory[]>("/admin/categories"),
  create: (body: NewCategory) =>
    apiFetch<ExistingCategory>("/admin/categories/new", {
      method: "POST",
      body,
    }),
  update: (id: UUID, body: NewCategory) =>
    apiFetch<void>(`/admin/categories/${id}`, {
      method: "PATCH",
      body,
    }),
  remove: (id: UUID) =>
    apiFetch<void>(`/admin/categories/${id}`, {
      method: "DELETE",
    }),
}

// ───────── Statistics (admin) ─────────

export interface ActivityPoint {
  date: string
  testingCount: number
  surveyCount: number
}

export interface TopItem {
  id: UUID
  name: string
  completions: number
}

export interface RecentEvent {
  kind: "TESTING" | "SURVEY"
  userDisplayName: string
  itemName: string
  at: string
}

export interface AdminStatistics {
  usersCount: number
  testsCount: number
  surveysCount: number
  categoriesCount: number
  completedTestingSessions: number
  completedSurveySessions: number
  activityByDay: ActivityPoint[]
  topTests: TopItem[]
  topSurveys: TopItem[]
  recentEvents: RecentEvent[]
}

export const statistics = {
  get: () => apiFetch<AdminStatistics>("/admin/statistics"),
}

// ───────── Survey sessions (admin) ─────────

export const surveySessions = {
  bySurvey: (
    surveyId: UUID,
    params: { offset: number; limit: number },
  ) =>
    apiFetch<PageResponse<AdminSurveySessionItem>>(
      `/admin/surveys/${surveyId}/sessions`,
      { query: params },
    ),
}
