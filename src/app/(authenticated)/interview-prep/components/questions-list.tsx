'use client';

import { useState } from 'react';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QuestionCard } from './question-card';
import { Question } from '../../../types';
import { motion } from 'framer-motion';

interface QuestionsListProps {
    questions: Question[];
    setQuestions: (questions: Question[]) => void;
    handleAnswerChange: (id: string, value: string) => void;
    submitAnswer: (id: string) => void;
    toggleFeedback: (id: string) => void;
    readOnly?: boolean;
}

export function QuestionsList({
    questions,
    setQuestions,
    handleAnswerChange,
    submitAnswer,
    toggleFeedback,
    readOnly = false // Default to false to maintain current behavior
}: QuestionsListProps) {
    const [isGenerating, setIsGenerating] = useState(false);

    const generateMoreQuestions = async () => {
        setIsGenerating(true);

        try {
            // Get the current interview ID from the first question
            // This assumes all questions are part of the same interview session
            const interviewId = questions.length > 0 ?
                questions[0].interviewId :
                null;

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
            setQuestions([...questions, ...newQuestions]);
        } catch (error) {
            console.error('Error generating more questions:', error);
        } finally {
            setIsGenerating(false);
        }
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
                        submitAnswer={submitAnswer}
                        toggleFeedback={toggleFeedback}
                        readOnly={readOnly}
                    />
                </motion.div>
            ))}

            {/* Only show the "Generate More Questions" button if not in readOnly mode */}
            {!readOnly && (
                <Button
                    variant="outline"
                    className="w-full py-6"
                    onClick={generateMoreQuestions}
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