'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { QuestionsList } from '../../components/questions-list'

export default function InterviewHistoryPage() {
    const { sessionId } = useParams()
    const [questions, setQuestions] = useState([])
    const [role, setRole] = useState('')

    useEffect(() => {
        const fetchSession = async () => {
            const res = await fetch(`/api/interview-sessions/${sessionId}`)
            if (res.ok) {
                const data = await res.json()
                setRole(data.role)
                setQuestions(data.questions)
            }
        }

        fetchSession()
    }, [sessionId])

    // No-op functions to satisfy the prop requirements
    const noopSetQuestions = () => { }
    const noopHandleAnswerChange = () => { }
    const noopSubmitAnswer = () => { }
    const noopToggleFeedback = () => { }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <h2 className="text-xl font-semibold mb-4">Past Questions for {role}</h2>
            <QuestionsList
                questions={questions}
                setQuestions={noopSetQuestions}
                handleAnswerChange={noopHandleAnswerChange}
                submitAnswer={noopSubmitAnswer}
                toggleFeedback={noopToggleFeedback}
                readOnly={true}
            />
        </div>
    )
}
