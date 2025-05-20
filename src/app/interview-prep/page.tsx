
'use client';

import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuestionsList } from '@/app/components/questions-list';
import { InterviewLayout } from '@/app/components/layouts/InterviewLayouts';
import { SetupForm } from '@/app/components/setup-form';
import { QuestionSkeleton } from '@/app/components/skeletons';
import { useInterview } from '@/app/context/InterviewContext';
import { motion, AnimatePresence } from 'framer-motion';

export function parseQuestions(
    rawQuestions: string[]
): { text: string; rationale: string }[] {
    const formattedQuestions: { text: string; rationale: string }[] = []

    // Skip the introduction (index 0) and process question-rationale pairs
    for (let i = 1; i < rawQuestions.length; i += 2) {
        // Check if this is a question (typically odd indices: 1, 3, 5)
        if (i < rawQuestions.length && rawQuestions[i].includes('"')) {
            const questionText = rawQuestions[i]
                // Clean up the question - remove numbering if present
                .replace(/^\d+\.\s*/, '')
                // Remove extra quotation marks
                .replace(/^["']|["']$/g, '')
                .trim()

            // Get the rationale (the next item in the array, if it exists)
            let rationale = ''
            if (i + 1 < rawQuestions.length) {
                // Extract the actual explanation, removing any markdown formatting
                rationale = rawQuestions[i + 1]
                    .replace(/^\s*\*\s*\*\*Why it's challenging:\*\*/, '')
                    .replace(/^\s*Why it's challenging:\s*/, '')
                    .replace(/^\s*\*\s*/, '')
                    .trim()
            }

            formattedQuestions.push({ text: questionText, rationale })
        }
    }

    return formattedQuestions
}

export default function ImprovedInterviewPrepPage() {
    const {
        role,
        status,
        interviewData,
        isGenerating,
        isParsing,
        resetInterview,
    } = useInterview();

    const data = [
        'Given your resume states "Over 5 years of vanilla Java developer," and we are interviewing for a Senior JavaScript developer position, could you describe a time when you successfully translated a complex Java-based concept or pattern into a JavaScript-equivalent solution, highlighting the challenges you faced and how you overcame them to ensure a smooth transition for yourself and any team members involved? (Technical & Reference to resume)',
        'Considering your background in Java, which is known for its strong typing, and now transitioning to a language like JavaScript, which is dynamically typed, how would you approach architecting a large-scale JavaScript application to ensure code maintainability, reduce potential runtime errors, and promote collaboration amongst a development team? (Situational/Problem-Solving)',
        "Tell me about a situation where you had to learn a completely new technology or paradigm quickly, specifically something outside of your comfort zone in Java, and apply it to a project. What steps did you take to master the new skill, and how did you ensure that your contributions met the project's quality standards? (Behavioral)"
    ]

    console.log("persed data", parseQuestions(data));

    const isLoading = isGenerating || isParsing;
    console.log("status", status);

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