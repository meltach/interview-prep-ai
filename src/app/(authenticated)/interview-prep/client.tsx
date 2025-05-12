'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { SetupForm } from './components/setup-form';
import { QuestionsList } from './components/questions-list';
import { PageHeader } from './components/page-header';
import { Button } from '@/components/ui/button';
import { Question } from './types';
import { SideNav } from './components/side-nav';

export default function ClientInterviewPrepPage() {
  const [role, setRole] = useState('');
  const [resume, setResume] = useState('');
  const [fileName, setFileName] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentStep, setCurrentStep] = useState<'setup' | 'questions'>('setup');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentInterviewId, setCurrentInterviewId] = useState<string | null>(null);

  const generateQuestions = async () => {
    if (!role || !resume) return;

    setIsGenerating(true);

    try {
      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role, resume }),
      });

      if (!res.ok) throw new Error('Failed to generate questions');


      const data = await res.json();

      // Set the current interview ID from the first question
      if (data.length > 0 && data[0].interviewId) {
        setCurrentInterviewId(data[0].interviewId);
      }

      setQuestions(data);
      setCurrentStep('questions');
    } catch (err) {
      console.error('Error generating questions:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAnswerChange = (id: string, value: string) => {
    setQuestions(questions.map(q =>
      q.id === id ? { ...q, userAnswer: value } : q
    ));
  };

  const submitAnswer = async (id: string) => {
    const questionObj = questions.find(q => q.id === id);
    if (!questionObj || !questionObj.userAnswer.trim()) return;

    setQuestions(questions.map(q =>
      q.id === id ? { ...q, isSubmitting: true } : q
    ));

    try {
      const res = await fetch('/api/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionObj.text,
          answer: questionObj.userAnswer,
          questionId: id,
          interviewId: currentInterviewId // Include the interview ID
        }),
      });

      if (!res.ok) throw new Error('Feedback request failed');
      const { feedback, answerId } = await res.json();

      // Rest of the function remains the same
      setQuestions(questions.map(q =>
        q.id === id
          ? {
            ...q,
            isAnswered: true,
            showFeedback: true,
            isSubmitting: false,
            feedback,
            answerId,
          }
          : q
      ));
    } catch (err) {
      console.error('Error submitting answer:', err);
      setQuestions(questions.map(q =>
        q.id === id ? { ...q, isSubmitting: false } : q
      ));
    }
  };


  const toggleFeedback = (id: string) => {
    setQuestions(questions.map(q =>
      q.id === id ? { ...q, showFeedback: !q.showFeedback } : q
    ));
  };

  const handleStartOver = () => {
    setQuestions([]);
    setCurrentInterviewId(null);
    setCurrentStep('setup');
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <PageHeader />
      <SideNav />
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 ml-0 md:ml-16 transition-all duration-300">
        {currentStep === 'setup' ? (
          <SetupForm
            role={role}
            setRole={setRole}
            resume={resume}
            setResume={setResume}
            fileName={fileName}
            setFileName={setFileName}
            generateQuestions={generateQuestions}
            isGenerating={isGenerating}
          />
        ) : (
          <>
            <div className="mb-6 flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                Interview Questions for {role}
              </h2>
              <Button
                onClick={handleStartOver}
                variant="ghost"
                className="text-sm flex items-center"
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
          </>
        )}
      </main>

      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-6xl mx-auto px-4 text-center text-sm text-gray-500">
          © 2025 InterviewPrep AI. Powered by AI to help you ace your interviews.
        </div>
      </footer>
    </div>
  );
}