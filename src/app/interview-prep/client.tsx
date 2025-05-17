'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { SetupForm } from './components/setup-form';
import { QuestionsList } from './components/questions-list';
import { PageHeader } from './components/page-header';
import { Button } from '@/components/ui/button';
import { SideNav } from './components/side-nav';
import { SetupFormSkeleton, QuestionSkeleton } from './components/skeletons';
import { useInterviewForm } from '@/app/hooks/useInterviewForm';
import { useQuestionInteractions } from '@/app/hooks/useQuestionInteractions';
import { motion } from 'framer-motion';

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
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <div className="fixed top-0 left-0 h-full z-50">
        <SideNav onOpenChange={setIsSidebarOpen} />
      </div>
      <motion.div
        className="flex-1 flex flex-col transition-transform duration-300 ease-in-out"
        style={{
          paddingLeft: '4rem', // base for collapsed sidebar
          transform: isSidebarOpen ? 'translateX(14rem)' : 'translateX(0)', // slide effect
        }}
      >
        <PageHeader />
        <main className="flex-1 overflow-y-auto pt-16 custom-scrollbar">
          <div className="container mx-auto px-6 py-8">

            {isLoading && currentStep === 'setup' ? (
              <SetupFormSkeleton />
            ) : isLoading ? (
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
          </div>
        </main>
      </motion.div>
    </div>
  );
}