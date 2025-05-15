import { toast } from 'sonner'
import { Question } from '../types'

export function useQuestionInteractions(
  questions: Question[],
  setQuestions: (questions: Question[]) => void,
  currentInterviewId: string | null
) {
  const handleAnswerChange = (id: string, value: string) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, userAnswer: value } : q))
    )
  }

  const submitAnswer = async (id: string) => {
    const questionObj = questions.find((q) => q.id === id)
    if (!questionObj || !questionObj.userAnswer.trim()) return

    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, isSubmitting: true } : q))
    )

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

      setQuestions(
        questions.map((q) =>
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
        )
      )
    } catch (err) {
      console.error('Error submitting answer:', err)
      setQuestions(
        questions.map((q) => (q.id === id ? { ...q, isSubmitting: false } : q))
      )
      toast('Failed to submit answer')
    }
  }

  const toggleFeedback = (id: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === id ? { ...q, showFeedback: !q.showFeedback } : q
      )
    )
  }

  return {
    handleAnswerChange,
    submitAnswer,
    toggleFeedback,
  }
}
