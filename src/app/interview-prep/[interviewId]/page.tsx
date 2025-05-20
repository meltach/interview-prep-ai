'use client'

import { motion } from 'framer-motion'
import { InterviewLayout } from '@/app/components/layouts/InterviewLayouts'
import { QuestionsList } from '@/app/components/questions-list'
import { HistorySkeleton } from '@/app/components/skeletons'
import { useInterview } from '@/app/context/InterviewContext'


export default function InterviewSessionPage() {
    const { isFetchingHistory, interviewData } = useInterview()


    if (isFetchingHistory) {
        return (
            <InterviewLayout>
                <HistorySkeleton />
            </InterviewLayout>
        )
    }

    if (!interviewData) {
        return (
            <InterviewLayout>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 text-center w-full">
                    <p className="text-gray-500 dark:text-gray-400">
                        No session data available
                    </p>
                </div>
            </InterviewLayout>
        )
    }

    const formattedDate = interviewData.createdAt
        ? new Date(interviewData.createdAt).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
        : null

    return (
        <InterviewLayout>
            <motion.div
                className='w-full'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-1">
                        {interviewData.role || 'Interview Review'}
                    </h2>
                    {formattedDate && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            {interviewData.status === 'active'
                                ? 'Session in progress'
                                : `Completed on ${formattedDate}`}
                        </p>
                    )}
                </div>

                {interviewData.questions.length > 0 ? (
                    <QuestionsList
                        readOnly={interviewData.status === 'completed'}
                    />
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 text-center">
                        <p className="text-gray-500 dark:text-gray-400">
                            No questions found for this interview session
                        </p>
                    </div>
                )}
            </motion.div>
        </InterviewLayout>
    )
}