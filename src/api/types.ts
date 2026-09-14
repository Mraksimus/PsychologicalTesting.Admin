export type UUID = string

export type AuthResponse = {
  token: string
}

export type Permission =
  | "ADMIN"
  | "ROLES_VIEW"
  | "ROLES_EDIT"
  | "TESTS_VIEW"
  | "TESTS_EDIT"
  | "QUESTIONS_EDIT"
  | "USERS_VIEW"
  | "USERS_EDIT"
  | "SESSIONS_VIEW"
  | "SURVEYS_VIEW"
  | "SURVEYS_EDIT"
  | "SURVEY_QUESTIONS_EDIT"
  | "SURVEY_SESSIONS_VIEW"
  | "CATEGORIES_VIEW"
  | "CATEGORIES_EDIT"

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

export type ExistingCategory = {
  id: UUID
  name: string
  color: string
  icon: string
  position: number
  createdAt: string
  updatedAt: string
}

export type NewCategory = {
  name: string
  color: string
  icon: string
}

export type ExistingTest = {
  id: UUID
  name: string
  description: string
  transcript: string
  durationMins: string
  isActive: boolean
  categoryId?: UUID | null
  category?: ExistingCategory | null
  questionsCount?: number
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
  categoryId?: UUID | null
}

export type Answer = {
  index: number
  text: string
}

export type ChoiceMod = "SINGLE" | "SCALE" | "MULTIPLE"

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
  testId?: UUID | null
  surveyId?: UUID | null
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

// ───────── Surveys ─────────

export type ExistingSurvey = {
  id: UUID
  name: string
  description: string
  durationMins: string
  isActive: boolean
  categoryId?: UUID | null
  category?: ExistingCategory | null
  questionsCount?: number
  createdAt: string
  updatedAt: string
  position: number
}

export type NewSurvey = {
  name: string
  description: string
  durationMins: string
  isActive: boolean
  categoryId?: UUID | null
}

export type SurveyDetails = {
  survey: ExistingSurvey
  questions: ExistingQuestion[]
}

export type SurveySessionAnswer = {
  questionId: UUID
  selectedIndex: number | null
  selectedIndices?: number[] | null
  textAnswer?: string | null
}

export type AdminSurveySessionItem = {
  id: UUID
  userId: UUID
  userFullName: string
  userEmail: string
  surveyId: UUID
  status: SessionStatus
  answers: SurveySessionAnswer[]
  createdAt: string
  closedAt?: string | null
}
