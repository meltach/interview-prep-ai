'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import useSWR from 'swr';
import { Interview } from '@/app/types';

// Define types
type InterviewStatus = 'setup' | 'generating' | 'questions' | 'completed';

interface InterviewContextType {
  // Interview setup 
  role: string;
  resume: string;
  file: File | null;
  fileName: string;
  updateField: <K extends keyof InterviewFormState>(field: K, value: InterviewFormState[K]) => void;
  handleFileUpload: (file: File | null) => void;

  // Status and state
  interviewId: string | null;
  status: InterviewStatus;
  isGenerating: boolean;
  isParsing: boolean;

  // Questions and interactions
  interviewData: Interview;
  isFetchingHistory: boolean;
  handleAnswerChange: (id: string, value: string) => void;
  submitAnswer: (id: string) => Promise<void>;
  toggleFeedback: (id: string) => void;

  // Actions
  generateQuestions: () => Promise<void>;
  generateMoreQuestions: () => Promise<void>;
  resetInterview: () => void;
}

interface InterviewFormState {
  role: string;
  resume: string;
  file: File | null;
  fileName: string;
}

interface InterviewProviderProps {
  children: ReactNode;
}

// Create the context
const InterviewContext = createContext<InterviewContextType | undefined>(undefined);

// Fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch data');
  }
  return await response.json();
};

export function InterviewProvider({ children }: InterviewProviderProps) {
  const router = useRouter();
  const params = useParams();
  // Normalize interviewId to string or null
  const interviewId: string | null =
    params?.interviewId
      ? Array.isArray(params.interviewId)
        ? params.interviewId[0]
        : params.interviewId
      : null;
  // Form state
  const [formState, setFormState] = useState<InterviewFormState>({
    role: '',
    resume: '',
    file: null,
    fileName: '',
  });
  console.log("FormState", formState)

  // Status states
  const [status, setStatus] = useState<InterviewStatus>('setup');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isParsing, setIsParsing] = useState<boolean>(false);
  // SWR for fetching questions
  const { data: interviewData = {} as Interview, mutate, isLoading: isFetchingHistory } = useSWR<Interview>(
    interviewId ? `/api/history/${interviewId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      onSuccess: (data) => {
        // If we successfully load questions, update the status
        if (data.questions?.length > 0) {
          setStatus('questions');
        }
      },
      onError: (error) => {
        console.error('Failed to fetch questions:', error);
        toast.error('Failed to load interview questions');
      }
    }
  );

  const questionsData = interviewData?.questions || [];

  // Update URL when interview ID changes
  useEffect(() => {
    if (interviewId && status === 'questions') {
      router.push(`/interview-prep/${interviewId}`, { scroll: false });
    }
    if (!interviewId && status === 'questions') {
      setStatus('setup');
    }
  }, [interviewId, status, router]);

  // Form field updaters
  const updateField = <K extends keyof InterviewFormState>(
    field: K,
    value: InterviewFormState[K]
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
  };

  // File handling
  const handleFileUpload = (uploadedFile: File | null) => {
    if (!uploadedFile) return;

    updateField('fileName', uploadedFile.name);
    updateField('file', uploadedFile);

    // Only read text files content
    if (uploadedFile.type !== 'application/pdf') {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateField('resume', event.target?.result as string);
      };
      reader.readAsText(uploadedFile);
    } else {
      // For PDFs, just keep the file object, clear text area
      updateField('resume', '');
    }
  };

  // Generate questions
  const generateQuestions = async () => {
    const { role, resume, file } = formState;

    if (!role || (!file && !resume)) {
      toast.error('Please provide a role and either paste a resume or upload a file');
      return;
    }

    setIsGenerating(true);
    setIsParsing(!!file);
    setStatus('generating');

    try {
      const formData = new FormData();
      formData.append('role', role);

      if (file) {
        formData.append('resumeFile', file);
      } else {
        formData.append('resumeText', resume);
      }

      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(
          res.status === 413
            ? 'File too large (max 5MB)'
            : 'Failed to generate questions'
        );
      }

      const data = await res.json();
      const newInterviewId = data[0]?.interviewId;
      console.log('Generated questions:', data);

      if (newInterviewId) {
        // await mutate(); // Refresh the questions data
        router.push(`/interview-prep/${newInterviewId}`, { scroll: false });
        // reset form state
        setFormState({
          role: '',
          resume: '',
          file: null,
          fileName: '',
        });
        setStatus('questions');
      } else {
        throw new Error('No interview ID returned from API');
      }
    } catch (err) {
      console.error('Error generating questions:', err);
      toast.error('Failed to generate questions');
      setStatus('setup');
    } finally {
      setIsGenerating(false);
      setIsParsing(false);
    }
  };

  // Generate more questions
  const generateMoreQuestions = async () => {
    if (!interviewId) {
      toast.error('No active interview found');
      return;
    }

    setIsGenerating(true);

    try {
      const res = await fetch('/api/generate-more-questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interviewId,
          currentCount: questionsData?.length || 0
        }),
      });

      if (!res.ok) throw new Error('Failed to generate more questions');

      await mutate(); // Refresh the questions data
      toast.success('New questions generated!');
    } catch (error) {
      console.error('Error generating more questions:', error);
      toast.error('Failed to generate additional questions');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle answer changes
  const handleAnswerChange = (id: string, value: string) => {
    if (!questionsData.length) return;

    const updatedQuestions = questionsData.map(q =>
      q.id === id ? { ...q, userAnswer: value } : q
    );
    // Use optimistic updates with SWR
    mutate({ ...(interviewData || {}), questions: updatedQuestions }, false);
  };

  const submitAnswer = async (id: string) => {
    if (!questionsData || !interviewId) return;

    // Find question
    const question = questionsData.find(q => q.id === id);
    if (!question || !question.userAnswer?.trim()) return;

    // Only mark as submitting, don't optimistically update feedback
    const updatedQuestions = questionsData.map(q =>
      q.id === id ? { ...q, isSubmitting: true } : q
    );

    // Apply update to show loading state
    mutate({ ...(interviewData || {}), questions: updatedQuestions, }, false);
    console.log("UpdatedQuestions", updatedQuestions)

    try {
      const res = await fetch('/api/submit-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          questionId: id,
          answer: question.userAnswer
        }),
      });

      if (!res.ok) throw new Error('Failed to submit answer');

      // Get the response data with feedback
      const feedbackData = await res.json();

      // Update with the received feedback and set showFeedback to true
      const updatedWithFeedback = questionsData.map(q =>
        q.id === id ? {
          ...q,
          isSubmitting: false,
          isAnswered: true,
          feedback: feedbackData.feedback,
          showFeedback: true,
          stream: feedbackData.stream,
        } : q
      );

      // Update the UI immediately with the feedback
      mutate({ ...(interviewData || {}), questions: updatedWithFeedback }, false);

      // if all questions are answered, mark the interview as completed

      // await mutate();
    } catch (error) {
      console.error('Error submitting answer:', error);
      toast.error('Failed to submit answer');

      // Revert to original state
      const revertedQuestions = questionsData.map(q =>
        q.id === id ? { ...q, isSubmitting: false } : q
      );
      mutate({ ...(interviewData || {}), questions: revertedQuestions }, false);
    }
  };

  // Toggle feedback visibility
  const toggleFeedback = (id: string) => {
    if (!questionsData) return;

    const updatedQuestions = questionsData.map(q =>
      q.id === id ? { ...q, showFeedback: !q.showFeedback } : q
    );

    mutate({ ...(interviewData || {}), questions: updatedQuestions }, false);
  };

  // Reset interview
  const resetInterview = () => {
    setFormState({
      role: '',
      resume: '',
      file: null,
      fileName: '',
    });
    setStatus('setup');
    router.push('/interview-prep', { scroll: false });
    mutate({ ...(interviewData || {}), questions: [] }, false); // Clear questions data
  };

  // Create context value
  const contextValue: InterviewContextType = {
    // Form state
    role: formState.role,
    resume: formState.resume,
    file: formState.file,
    fileName: formState.fileName,
    updateField,
    handleFileUpload,

    // Status
    interviewId,
    status,
    isGenerating,
    isParsing,

    // Questions and interactions
    interviewData,
    isFetchingHistory,
    handleAnswerChange,
    submitAnswer,
    toggleFeedback,

    // Actions
    generateQuestions,
    generateMoreQuestions,
    resetInterview,
  };

  return (
    <InterviewContext.Provider value={contextValue}>
      {children}
    </InterviewContext.Provider>
  );
}

// Custom hook for using the interview context
export function useInterview() {
  const context = useContext(InterviewContext);

  if (context === undefined) {
    throw new Error('useInterview must be used within an InterviewProvider');
  }

  return context;
}