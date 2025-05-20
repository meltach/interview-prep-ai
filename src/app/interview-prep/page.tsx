
'use client';

import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuestionsList } from '@/app/components/questions-list';
import { InterviewLayout } from '@/app/components/layouts/InterviewLayouts';
import { SetupForm } from '@/app/components/setup-form';
import { QuestionSkeleton } from '@/app/components/skeletons';
import { useInterview } from '@/app/context/InterviewContext';
import { motion, AnimatePresence } from 'framer-motion';

export default function ImprovedInterviewPrepPage() {
    const {
        role,
        status,
        interviewData,
        isGenerating,
        isParsing,
        resetInterview,
    } = useInterview();

    const isLoading = isGenerating || isParsing;

    return (
        <InterviewLayout>
            <AnimatePresence mode="wait">
                {isLoading && status === 'questions' ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full space-y-4"
                    >
                        {[...Array(3)].map((_, i) => (
                            <QuestionSkeleton key={i} />
                        ))}
                    </motion.div>
                ) : status === 'setup' || status === "generating" ? (
                    <motion.div
                        className="w-full space-y-4"
                        key="setup"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <SetupForm />
                    </motion.div>
                ) : (
                            <motion.div
                                key="questions"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-4 w-full"
                            >
                                <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                                        Interview Questions for {role || 'Your Role'}
                                    </h2>
                                    <Button
                                        onClick={resetInterview}
                                        variant="ghost"
                                        size="sm"
                                        className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        <X className="mr-1 h-4 w-4" />
                                        Start Over
                                    </Button>
                                </div>

                                {interviewData?.questions?.length > 0 ? (
                                    <QuestionsList />
                                ) : (
                                    <div className="p-12 text-center border border-dashed rounded-lg">
                                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-4" />
                                        <p className="text-gray-500">Loading interview questions...</p>
                                    </div>
            )}
                    </motion.div>
                )}
            </AnimatePresence>
        </InterviewLayout>
    );
}