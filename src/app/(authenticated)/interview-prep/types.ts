export interface Question {
  id: string
  text: string
  userAnswer: string
  feedback?: string
  showFeedback: boolean
  isAnswered: boolean
  isSubmitting: boolean
  answerId?: string // Optional ID of the saved answer
  interviewId?: string // ID of the parent interview session
}

export interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
}

export interface Session {
  user?: User
  expires: string
  id: string
}
