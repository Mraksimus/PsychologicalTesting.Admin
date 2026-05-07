export type UUID = string

export type Token = {
  userId: UUID
  value: string
  createdAt: string
  expiresAt: string
}

export type Permission =
  | "ADMIN"
  | "ROLES_VIEW"
  | "ROLES_EDIT"
  | "TESTS_VIEW"
  | "TESTS_EDIT"
  | "QUESTIONS_EDIT"
  | "USERS_VIEW"
  | "SESSIONS_VIEW"

export type ExistingRole = {
  id: UUID
  name: string
  color: string | null
  permissions: Permission[]
}

export type NewRole = {
  name: string
  color?: string | null
  permissions: Permission[]
}

export type AdminUserItem = {
  id: UUID
  name: string
  surname: string
  patronymic?: string | null
  email: string
  role?: ExistingRole | null
  registeredAt: string
  lastLoginAt?: string | null
}

export type ExistingTest = {
  id: UUID
  name: string
  description: string
  transcript: string
  durationMins: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  position: number
}

export type NewTest = {
  name: string
  description: string
  transcript: string
  durationMins: string
  isActive: boolean
}

export type Answer = {
  index: number
  text: string
  score: number
}

export type ChoiceMod = "SINGLE" | "SCALE"

export type ChoiceContent = {
  type: "Choice"
  text: string
  mod: ChoiceMod
  options: Answer[]
}

export type InputContent = {
  type: "Input"
  text: string
  correctInputs?: string[] | null
}

export type QuestionContent = ChoiceContent | InputContent

export type ExistingQuestion = {
  id: UUID
  testId: UUID
  content: QuestionContent
  position: number
}

export type NewQuestionRequest = {
  content: QuestionContent
}

export type TestDetails = {
  test: ExistingTest
  questions: ExistingQuestion[]
}

export type SessionStatus = "IN_PROGRESS" | "COMPLETED" | "CLOSED"

export type AdminSessionItem = {
  id: UUID
  userId: UUID
  userFullName: string
  userEmail: string
  testId: UUID
  status: SessionStatus
  result?: string | null
  createdAt: string
  closedAt?: string | null
}

export type PageResponse<T> = {
  total: number
  offset: number
  limit: number
  items: T[]
}
