import { toast } from 'sonner'
import { Question, SessionData } from '../types'
import { KeyedMutator } from 'swr'

export function useQuestionInteractions(
  mutate: KeyedMutator<SessionData>,
  currentInterviewId: string | null
) {
  const handleAnswerChange = async (id: string, value: string) => {
    // Optimistic update
    await mutate(
      (currentData) => {
        if (!currentData) return currentData
        return {
          ...currentData,
          questions: currentData.questions.map((q) =>
            q.id === id ? { ...q, userAnswer: value } : q
          ),
        }
      },
      { revalidate: false } // Don't revalidate immediately
    )
  }

  const submitAnswer = async (id: string) => {
    let questionObj: Question | undefined

    // First get the current question data optimistically
    await mutate(
      (currentData) => {
        if (!currentData) return currentData
        questionObj = currentData.questions.find((q) => q.id === id)
        if (!questionObj || !questionObj.userAnswer?.trim()) return currentData

        return {
          ...currentData,
          questions: currentData.questions.map((q) =>
            q.id === id ? { ...q, isSubmitting: true } : q
          ),
        }
      },
      { revalidate: false }
    )

    if (!questionObj || !questionObj.userAnswer?.trim()) return

    try {
      const res = await fetch('/api/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionObj.text,
          answer: questionObj.userAnswer,
          questionId: id,
          interviewId: currentInterviewId,
        }),
      })

      if (!res.ok) throw new Error('Feedback request failed')
      const { feedback, answerId } = await res.json()

      // Update with server response
      await mutate(
        (currentData) => {
          if (!currentData) return currentData
          return {
            ...currentData,
            questions: currentData.questions.map((q) =>
              q.id === id
                ? {
                    ...q,
                    isAnswered: true,
                    showFeedback: true,
                    isSubmitting: false,
                    feedback,
                    answerId,
                  }
                : q
            ),
          }
        },
        { revalidate: true } // Ensure data is fresh
      )
    } catch (err) {
      console.error('Error submitting answer:', err)
      // Rollback on error
      await mutate(
        (currentData) => {
          if (!currentData) return currentData
          return {
            ...currentData,
            questions: currentData.questions.map((q) =>
              q.id === id ? { ...q, isSubmitting: false } : q
            ),
          }
        },
        { revalidate: true }
      )
      toast('Failed to submit answer')
    }
  }

  const toggleFeedback = async (id: string) => {
    await mutate(
      (currentData) => {
        if (!currentData) return currentData
        return {
          ...currentData,
          questions: currentData.questions.map((q) =>
            q.id === id ? { ...q, showFeedback: !q.showFeedback } : q
          ),
        }
      },
      { revalidate: false }
    )
  }

  return {
    handleAnswerChange,
    submitAnswer,
    toggleFeedback,
  }
}