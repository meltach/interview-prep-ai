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
  createdAt: Date
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
  rationale?: string
  stream: boolean
  isSubmitting?: boolean
  feedback?: string
  showFeedback?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface InterviewResponse {
  id: string
  jobRole: string
  createdAt: Date
}

/**
 * Represents an interview session
 */
export interface Interview {
  id: string
  role: string
  status: 'active' | 'completed'
  questions: Question[]
  createdAt: Date
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

export interface InterviewSessionResponse {
  id: string
  interviewId: string
  text: string
  rationale: string | null
  order: number
  createdAt: Date
  answer: {
    id: string
    questionId: string
    text: string
    createdAt: Date
    feedback: {
      id: string
      content: string
      createdAt: Date
      updatedAt?: Date
      answerId?: string
      clarity?: number | null
      relevance?: number | null
      depth?: number | null
    } | null
  } | null
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