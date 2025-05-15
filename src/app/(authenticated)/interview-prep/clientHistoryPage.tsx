'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { PageHeader } from './components/page-header'
import { QuestionsList } from './components/questions-list'
import { SideNav } from './components/side-nav'
import { HistorySkeleton } from './components/skeletons'
import { Question } from '@/app/types'

export default function ClientHistoryPage() {
    const { sessionId } = useParams()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [questions, setQuestions] = useState<Question[]>([])
    const [role, setRole] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [sessionDate, setSessionDate] = useState('')

    useEffect(() => {
        const fetchSession = async () => {
            setIsLoading(true)
            try {
                const res = await fetch(`/api/history/${sessionId}`)
                if (res.ok) {
                    const data = await res.json()
                    setRole(data.role)
                    setQuestions(data.questions)
                    if (data.createdAt) {
                        setSessionDate(new Date(data.createdAt).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        }))
                    }
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

    const toggleFeedback = (id: string) => {
        setQuestions(questions.map(q =>
            q.id === id ? { ...q, showFeedback: !q.showFeedback } : q
        ))
    }

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
            <div className="fixed top-0 left-0 right-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <PageHeader />
            </div>

            <div className="flex pt-16">
                <SideNav onOpenChange={setIsSidebarOpen} />

                <main className={cn(
                    "flex-1 max-w-4xl w-full px-4 py-8 transition-all duration-300",
                    isSidebarOpen ? "ml-72" : "mx-auto"
                )}>
                    {isLoading ? (
                        <HistorySkeleton />
                    ) : (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
                                <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-1">
                                    {role || 'Interview Review'}
                                </h2>
                                {sessionDate && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Completed on {sessionDate}
                                    </p>
                                )}
                            </div>

                            {questions.length > 0 ? (
                                <QuestionsList
                                    questions={questions}
                                    setQuestions={() => { }}
                                    handleAnswerChange={() => { }}
                                    submitAnswer={() => { }}
                                    toggleFeedback={toggleFeedback}
                                    readOnly={true}
                                />
                            ) : (
                                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
                                    <p className="text-gray-500 dark:text-gray-400">
                                        No questions found for this interview session
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </main>
            </div>
        </div>
    )
}