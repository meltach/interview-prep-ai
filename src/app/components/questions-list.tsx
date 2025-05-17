'use client';

import { useState } from 'react';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuestionCard } from './question-card';
import { motion } from 'framer-motion';
import { Question } from '@/app/types';

interface QuestionsListProps {
    questions: Question[];
    handleAnswerChange: (id: string, value: string) => void;
    submitAnswer: (id: string) => void;
    toggleFeedback: (id: string) => void;
    readOnly?: boolean;
    interviewId?: string | null; // Added for generateMoreQuestions
}

export function QuestionsList({
    questions,
    handleAnswerChange,
    submitAnswer,
    toggleFeedback,
    readOnly = false,
    interviewId = null
}: QuestionsListProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const generateMoreQuestions = async () => {
        setIsGenerating(true);

        try {
            if (!interviewId) {
                console.error('No interview ID found');
                return;
            }

            const res = await fetch('/api/generate-more-questions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    interviewId,
                    currentCount: questions.length
                }),
            });

            if (!res.ok) throw new Error('Failed to generate more questions');

            const newQuestions = await res.json();
            // Note: Since we're using SWR mutations, we'll handle this in the parent component
            // The parent should handle the mutation after receiving new questions
            // We'll need to return the new questions to the parent
            return newQuestions;
        } catch (error) {
            console.error('Error generating more questions:', error);
            throw error;
        } finally {
            setIsGenerating(false);
        }
    };

    // Determine if we should show submit button in read-only mode
    const shouldShowSubmit = (question: Question) => {
        if (!readOnly) return true;
        return !question.isAnswered && question.userAnswer?.trim();
    };

    return (
        <div className="space-y-4">
            {questions.map((question, index) => (
                <motion.div
                    key={question.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        delay: index * 0.05,
                        type: "spring",
                        stiffness: 100
                    }}
                >
                    <QuestionCard
                        question={question}
                        handleAnswerChange={handleAnswerChange}
                        submitAnswer={shouldShowSubmit(question) ? submitAnswer : undefined}
                        toggleFeedback={toggleFeedback}
                        readOnly={readOnly && question.isAnswered} // Only enforce readOnly for answered questions
                    />
                </motion.div>
            ))}

            {/* Only show the "Generate More Questions" button if not in readOnly mode */}
            {!readOnly && (
                <Button
                    variant="outline"
                    className="w-full py-6"
                    onClick={async () => {
                        try {
                            const newQuestions = await generateMoreQuestions();
                            // Parent component should handle the mutation with SWR
                            // This assumes the parent is listening for a promise resolution
                            return newQuestions;
                        } catch (error) {
                            console.error('Error generating more questions:', error);
                            // Error is already logged in generateMoreQuestions
                        }
                    }}
                    disabled={isGenerating}
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Generate More Questions
                        </>
                    )}
                </Button>
            )}
        </div>
    );
}