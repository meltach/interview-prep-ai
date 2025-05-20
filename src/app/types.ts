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

export type PastSession = {
  id: string
  role: string
  createdAt: string
}

/**
 * Represents an interview question with its associated data
 */
export interface Question {
  id: string
  text: string
  interviewId?: string
  userAnswer?: string
  isAnswered: boolean
  stream: boolean
  isSubmitting?: boolean
  feedback?: string
  showFeedback?: boolean
  createdAt?: string
  updatedAt?: string
}

/**
 * Represents an interview session
 */
export interface Interview {
  id: string
  role: string
  status: 'active' | 'completed'
  questions: Question[]
  createdAt: string
  updatedAt: string
}

/**
 * Response from the API when generating questions
 */
export interface GenerateQuestionsResponse {
  interviewId: string
  questions: Question[]
}

/**
 * Response from the API when submitting an answer
 */
export interface SubmitAnswerResponse {
  questionId: string
  feedback: string
  isAnswered: boolean
}

/**
 * Parameters needed to generate more questions
 */
export interface GenerateMoreQuestionsParams {
  interviewId: string
  currentCount: number
}

/**
 * Response from the API when generating more questions
 */
export interface GenerateMoreQuestionsResponse {
  newQuestions: Question[]
}

/**
 * Parameters for answer submission
 */
export interface SubmitAnswerParams {
  questionId: string
  interviewId: string
  answer: string
}