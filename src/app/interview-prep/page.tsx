'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInterviewForm } from '@/app/hooks/useInterviewForm';
import { useQuestionInteractions } from '@/app/hooks/useQuestionInteractions';
import { QuestionsList } from '@/app/components/questions-list';
import { InterviewLayout } from '@/app/components/layouts/InterviewLayouts';
import { SetupForm } from '@/app/components/setup-form';
import { QuestionSkeleton } from '@/app/components/skeletons';
import { mutate } from 'swr';

export default function InterviewPrepPage() {
    const router = useRouter();

    const {
        formState,
        updateField,
        questions,
        currentInterviewId,
        currentStep,
        isGenerating,
        isParsing,
        handleFileUpload,
        generateQuestions,
        resetForm
    } = useInterviewForm();

    const {
        handleAnswerChange,
        submitAnswer,
        toggleFeedback
    } = useQuestionInteractions(mutate, currentInterviewId);

    const isLoading = isGenerating || isParsing;

    // Update the URL when an interview session is created
    useEffect(() => {
        if (currentInterviewId && currentStep === 'questions') {
            // Update the URL without causing a page reload
            router.push(`/interview-prep/${currentInterviewId}`, { scroll: false });
        }
    }, [currentInterviewId, currentStep, router]);

    // Handle going back to setup
    const handleReset = () => {
        resetForm();
        router.push('/interview-prep', { scroll: false });
    };

    return (
        <InterviewLayout>
            {isLoading && currentInterviewId ? (
                <>
                    {[...Array(3)].map((_, i) => (
                        <QuestionSkeleton key={i} />
                    ))}
                </>
            ) : currentStep === 'setup' ? (
                <SetupForm
                    formState={formState}
                    updateField={updateField}
                    handleFileUpload={handleFileUpload}
                    generateQuestions={generateQuestions}
                    isGenerating={isGenerating}
                    isParsing={isParsing}
                />
            ) : (
                <div className="space-y-6">
                    <div className="flex justify-between items-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
                            Interview Questions for {formState.role}
                        </h2>
                        <Button
                            onClick={handleReset}
                            variant="ghost"
                            size="sm"
                            className="text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                            <X className="mr-1 h-4 w-4" />
                            Start Over
                        </Button>
                    </div>

                    <QuestionsList
                        questions={questions}
                        handleAnswerChange={handleAnswerChange}
                        submitAnswer={submitAnswer}
                        toggleFeedback={toggleFeedback}
                    />
                </div>
            )}
        </InterviewLayout>
    );
}