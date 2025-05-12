export interface Question {
  id: string
  text: string
  rationale?: string
  interviewId: string
  userAnswer: string
  feedback?: string
  showFeedback: boolean
  isAnswered: boolean
  isSubmitting: boolean
}

export interface User {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  session: Session
}

export interface Session {
  user?: User
  expires: string
  id: string
}
