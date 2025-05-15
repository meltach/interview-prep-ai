'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { SetupForm } from './components/setup-form';
import { QuestionsList } from './components/questions-list';
import { PageHeader } from './components/page-header';
import { Button } from '@/components/ui/button';
import { SideNav } from './components/side-nav';
import { cn } from '@/lib/utils';
import { SetupFormSkeleton, QuestionSkeleton } from './components/skeletons';
import { useInterviewForm } from '@/app/hooks/useInterviewForm';
import { useQuestionInteractions } from '@/app/hooks/useQuestionInteractions';

export default function ClientInterviewPrepPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const {
    formState,
    updateField,
    questions,
    setQuestions,
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
  } = useQuestionInteractions(questions, setQuestions, currentInterviewId);

  const isLoading = isGenerating || isParsing;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="sticky top-0 z-20 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <PageHeader />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <SideNav onOpenChange={setIsSidebarOpen} />
        <main className={cn(
          "flex-1 max-w-4xl w-full px-4 py-8 overflow-y-auto",
          isSidebarOpen ? "ml-72" : "mx-auto"
        )}>
          {isLoading && currentStep === 'setup' ? (
            <SetupFormSkeleton />
          ) : isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <QuestionSkeleton key={i} />
              ))}
            </div>
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
                        onClick={resetForm}
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
                      setQuestions={setQuestions}
                      handleAnswerChange={handleAnswerChange}
                      submitAnswer={submitAnswer}
                      toggleFeedback={toggleFeedback}
                    />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}