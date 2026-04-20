export type TestStatus = "Опубликован" | "Черновик" | "Архив"
export type TestCategory =
  | "Личность"
  | "Тревожность"
  | "Стресс"
  | "Самооценка"
  | "Эмоциональный интеллект"

export type TestItem = {
  id: string
  title: string
  category: TestCategory
  status: TestStatus
  author: string
  questions: number
  completions: number
  averageScore: number
  createdAt: string
}

export type TestBadgeVariant = "default" | "secondary" | "outline" | "destructive"

export const initialTests: TestItem[] = [
  {
    id: "1",
    title: "Шкала тревожности Бека",
    category: "Тревожность",
    status: "Опубликован",
    author: "Мария Тихонова",
    questions: 21,
    completions: 428,
    averageScore: 74,
    createdAt: "12.01.2026",
  },
  {
    id: "2",
    title: "Уровень субъективного стресса",
    category: "Стресс",
    status: "Опубликован",
    author: "Анна Белова",
    questions: 18,
    completions: 316,
    averageScore: 69,
    createdAt: "18.01.2026",
  },
  {
    id: "3",
    title: "Тест на эмоциональный интеллект",
    category: "Эмоциональный интеллект",
    status: "Черновик",
    author: "Елена Смирнова",
    questions: 24,
    completions: 0,
    averageScore: 0,
    createdAt: "22.01.2026",
  },
  {
    id: "4",
    title: "Шкала самооценки Розенберга",
    category: "Самооценка",
    status: "Опубликован",
    author: "Павел Фёдоров",
    questions: 10,
    completions: 512,
    averageScore: 81,
    createdAt: "26.01.2026",
  },
  {
    id: "5",
    title: "Психологический портрет личности",
    category: "Личность",
    status: "Архив",
    author: "Мария Тихонова",
    questions: 35,
    completions: 214,
    averageScore: 72,
    createdAt: "02.02.2026",
  },
  {
    id: "6",
    title: "Диагностика эмоционального выгорания",
    category: "Стресс",
    status: "Опубликован",
    author: "Анна Белова",
    questions: 20,
    completions: 189,
    averageScore: 67,
    createdAt: "08.02.2026",
  },
  {
    id: "7",
    title: "Тревожность в социальных ситуациях",
    category: "Тревожность",
    status: "Черновик",
    author: "Елена Смирнова",
    questions: 16,
    completions: 0,
    averageScore: 0,
    createdAt: "14.02.2026",
  },
  {
    id: "8",
    title: "Самооценка и уверенность в себе",
    category: "Самооценка",
    status: "Опубликован",
    author: "Мария Тихонова",
    questions: 14,
    completions: 276,
    averageScore: 78,
    createdAt: "19.02.2026",
  },
  {
    id: "9",
    title: "Экспресс-оценка уровня стресса",
    category: "Стресс",
    status: "Опубликован",
    author: "Павел Фёдоров",
    questions: 12,
    completions: 603,
    averageScore: 71,
    createdAt: "24.02.2026",
  },
  {
    id: "10",
    title: "Тип личности в командной работе",
    category: "Личность",
    status: "Архив",
    author: "Анна Белова",
    questions: 28,
    completions: 145,
    averageScore: 75,
    createdAt: "02.03.2026",
  },
  {
    id: "11",
    title: "Оценка эмоциональной устойчивости",
    category: "Эмоциональный интеллект",
    status: "Опубликован",
    author: "Мария Тихонова",
    questions: 17,
    completions: 338,
    averageScore: 79,
    createdAt: "09.03.2026",
  },
  {
    id: "12",
    title: "Профиль психологического состояния",
    category: "Личность",
    status: "Черновик",
    author: "Елена Смирнова",
    questions: 30,
    completions: 0,
    averageScore: 0,
    createdAt: "15.03.2026",
  },
]

export function getTestStatusVariant(status: TestStatus): TestBadgeVariant {
  switch (status) {
    case "Опубликован":
      return "default"
    case "Черновик":
      return "secondary"
    case "Архив":
      return "outline"
    default:
      return "outline"
  }
}