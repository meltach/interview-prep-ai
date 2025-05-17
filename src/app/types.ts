import { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

export interface Question {
  id: string
  text: string
  userAnswer: string
  feedback: string
  showFeedback: boolean
  isAnswered: boolean
  isSubmitting: boolean
  answerId?: string
  interviewId: string
}
export interface SessionData {
  id: string
  role: string
  questions: Question[]
  status: 'active' | 'completed' | 'archived'
  createdAt: string
}

export type PastSession = {
  id: string
  role: string
  createdAt: string
}
