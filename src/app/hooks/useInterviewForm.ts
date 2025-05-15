import { useState } from 'react'
import { toast } from 'sonner'
import { Question } from '../types'

export type InterviewFormState = {
  role: string
  resume: string
  file: File | null
  fileName: string
}

export function useInterviewForm() {
  // Form state
  const [formState, setFormState] = useState<InterviewFormState>({
    role: '',
    resume: '',
    file: null,
    fileName: '',
  })

  // Processing states
  const [isGenerating, setIsGenerating] = useState(false)
  const [isParsing, setIsParsing] = useState(false)

  // Results state
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentInterviewId, setCurrentInterviewId] = useState<string | null>(
    null
  )
  const [currentStep, setCurrentStep] = useState<'setup' | 'questions'>('setup')

  // Form field updaters
  const updateField = <K extends keyof InterviewFormState>(
    field: K,
    value: InterviewFormState[K]
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }))
  }

  // File handling
  const handleFileUpload = (uploadedFile: File | null) => {
    if (!uploadedFile) return

    updateField('fileName', uploadedFile.name)
    updateField('file', uploadedFile)

    // Only read text files content
    if (uploadedFile.type !== 'application/pdf') {
      const reader = new FileReader()
      reader.onload = (event) => {
        updateField('resume', event.target?.result as string)
      }
      reader.readAsText(uploadedFile)
    } else {
      // For PDFs, just keep the file object, clear text area
      updateField('resume', '')
    }
  }

  // Form submission
  const generateQuestions = async () => {
    const { role, resume, file } = formState

    if (!role || (!file && !resume)) {
      toast('Please provide a role and either paste a resume or upload a file')
      return
    }

    setIsGenerating(true)
    setIsParsing(!!file)

    try {
      const formData = new FormData()
      formData.append('role', role)

      if (file) {
        formData.append('resumeFile', file)
      } else {
        formData.append('resumeText', resume)
      }

      const res = await fetch('/api/generate-questions', {
        method: 'POST',
        body: formData,
      })

      if (!res.ok) {
        throw new Error(
          res.status === 413
            ? 'File too large (max 5MB)'
            : 'Failed to generate questions'
        )
      }

      const data = await res.json()

      if (data.length > 0 && data[0].interviewId) {
        setCurrentInterviewId(data[0].interviewId)
      }

      setQuestions(data)
      setCurrentStep('questions')
    } catch (err) {
      console.error('Error generating questions:', err)
      toast('Failed to generate questions')
    } finally {
      setIsGenerating(false)
      setIsParsing(false)
    }
  }

  // Reset form
  const resetForm = () => {
    setFormState({
      role: '',
      resume: '',
      file: null,
      fileName: '',
    })
    setQuestions([])
    setCurrentInterviewId(null)
    setCurrentStep('setup')
  }

  return {
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
    resetForm,
  }
}
