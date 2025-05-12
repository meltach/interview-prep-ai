'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { QuestionsList } from '../../components/questions-list'
import { PageHeader } from '../../components/page-header'
import { Question } from '../../types'
import { SideNav } from '../../components/side-nav'

export default function InterviewHistoryPage() {
    const { sessionId } = useParams()
    const [questions, setQuestions] = useState<Question[]>([]);
    const [role, setRole] = useState('')
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchSession = async () => {
            setIsLoading(true)
            try {
                const res = await fetch(`/api/interview-sessions/${sessionId}`)
                if (res.ok) {
                    const data = await res.json()
                    setRole(data.role)
                    setQuestions(data.questions)
                }
            } catch (error) {
                console.error('Failed to fetch session details:', error)
            } finally {
                setIsLoading(false)
            }
        }

        if (sessionId) {
            fetchSession()
        }
    }, [sessionId])

    // No-op functions to satisfy the prop requirements
    const noopSetQuestions = () => { }
    const noopHandleAnswerChange = () => { }
    const noopSubmitAnswer = () => { }

    const toggleFeedback = (id: string) => {
        setQuestions(questions.map(q =>
            q.id === id ? { ...q, showFeedback: !q.showFeedback } : q
        ));
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <PageHeader />
            <SideNav />
            <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 ml-0 md:ml-16 transition-all duration-300">
                <h2 className="text-xl font-semibold mb-6">Interview for: {role}</h2>
                {isLoading ? (
                    <div className="p-8 text-center text-gray-500">Loading interview data...</div>
                ) : questions.length > 0 ? (
                    <QuestionsList
                        questions={questions}
                        setQuestions={noopSetQuestions}
                        handleAnswerChange={noopHandleAnswerChange}
                        submitAnswer={noopSubmitAnswer}
                            toggleFeedback={toggleFeedback}
                            readOnly={true}
                        />
                ) : (
                    <div className="p-8 text-center text-gray-500">No questions found for this interview</div>
                )}
            </main>
            <footer className="bg-white border-t border-gray-200 py-4">
                <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
                    © 2025 InterviewPrep AI. Powered by AI to help you ace your interviews.
                </div>
            </footer>
        </div>
    )
}