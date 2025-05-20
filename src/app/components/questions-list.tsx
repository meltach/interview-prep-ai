'use client';

import { useState } from 'react';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useInterview } from '@/app/context/InterviewContext';
import QuestionCard from './question-card';

interface QuestionsListProps {
    readOnly?: boolean;
}

export function QuestionsList({ readOnly = false }: QuestionsListProps) {
    const {
        interviewData,
        interviewId,
        generateMoreQuestions

    } = useInterview();
    const questions = interviewData?.questions || [];

    const [isGeneratingMore, setIsGeneratingMore] = useState(false);

    const handleGenerateMore = async () => {
        if (isGeneratingMore) return;

        setIsGeneratingMore(true);
        try {
            await generateMoreQuestions();
        } catch (error) {
            console.error('Failed to generate more questions:', error);
        } finally {
            setIsGeneratingMore(false);
        }
    };

    return (
        <div className="space-y-4 w-full">
            <AnimatePresence>
                {questions.map((question, index) => (
                    <motion.div
                        key={question.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{
                            delay: index * 0.05,
                            type: "spring",
                            stiffness: 100
                        }}
                        className="w-full"
                    >
                        <QuestionCard
                            question={question}
                            readOnly={false} // Only enforce readOnly for answered questions
                        />
                    </motion.div>
                ))} 
            </AnimatePresence>

            {/* Only show the "Generate More Questions" button if not in readOnly mode */}
            {!readOnly && interviewId && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: questions.length * 0.05 + 0.1 }}
                >
                    <Button
                        variant="outline"
                        className="w-full py-6 group transition-all duration-300 hover:bg-blue-50"
                        onClick={handleGenerateMore}
                        disabled={isGeneratingMore}
                    >
                        {isGeneratingMore ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating more questions...
                            </>
                        ) : (
                            <>
                                <PlusCircle className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                                Generate More Questions
                            </>
                        )}
                    </Button>
                </motion.div>
            )}

            {questions.length === 0 && !isGeneratingMore && (
                <div className="text-center p-8 border border-dashed rounded-lg">
                    <p className="text-gray-500">No questions available</p>
                </div>  
            )}
        </div>
    );
}