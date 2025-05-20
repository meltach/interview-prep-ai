import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import pdf from 'pdf-parse'
import { generateInterviewQuestions } from '../services'

// Define allowed MIME types
const ALLOWED_FILE_TYPES = [
  'application/pdf', // PDF
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'application/msword', // DOC
  'text/plain', // TXT
]

// Max file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024

export async function POST(req: NextRequest) {
  try {
    // Auth check - run this in parallel with form parsing to save time
    const sessionPromise = getServerSession(authOptions)
    const formDataPromise = req.formData()

    // Wait for both promises to resolve
    const [session, formData] = await Promise.all([
      sessionPromise,
      formDataPromise,
    ])

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Extract form data
    const role = formData.get('role') as string
    const resumeText = formData.get('resumeText') as string | null
    const resumeFile = formData.get('resumeFile') as File | null

    // Validate inputs
    if (!role?.trim()) {
      return NextResponse.json(
        { error: 'Job role is required' },
        { status: 400 }
      )
    }

    let finalResumeText = resumeText || ''
    let textExtractionPromise = Promise.resolve(finalResumeText)

    // Start user lookup early - we'll need it regardless of file processing
    const userPromise = prisma.user.findUnique({
      where: { email: session.user.email },
    })

    // Handle file upload if provided
    if (resumeFile) {
      // Security checks
      if (!ALLOWED_FILE_TYPES.includes(resumeFile.type)) {
        return NextResponse.json(
          {
            error:
              'Invalid file type. Please upload PDF, DOCX, DOC, or TXT files only',
          },
          { status: 400 }
        )
      }

      if (resumeFile.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            error: 'File size exceeds 5MB limit',
          },
          { status: 413 }
        )
      }

      // Extract text based on file type
      textExtractionPromise = (async () => {
        try {
          if (resumeFile.type === 'application/pdf') {
            const arrayBuffer = await resumeFile.arrayBuffer()
            const pdfData = await pdf(Buffer.from(arrayBuffer))
            return pdfData.text
          } else {
            // For text-based files (DOCX, TXT)
            return await resumeFile.text()
          }
        } catch (error) {
          console.error('[File Processing Error]', error)
          throw new Error('Failed to process the uploaded file')
        }
      })()
    }

    // Wait for text extraction and user lookup to complete
    const [extractedText, user] = await Promise.all([
      textExtractionPromise,
      userPromise,
    ])

    finalResumeText = extractedText

    // Ensure we have resume content
    if (!finalResumeText?.trim()) {
      return NextResponse.json(
        {
          error: 'Resume content is required',
        },
        { status: 400 }
      )
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Generate questions in parallel with creating the interview session
    const questionsPromise = generateInterviewQuestions(finalResumeText, role)

    const interviewSession = await prisma.interviewSession.create({
      data: {
        userId: user.id,
        jobRole: role,
        resume: finalResumeText,
      },
    })

    // Wait for questions to be generated
    let questions
    try {
      questions = await questionsPromise
    } catch (error) {
      console.error('[AI Processing Error]', error)

      // Clean up the interview session if we failed to generate questions
      await prisma.interviewSession.delete({
        where: { id: interviewSession.id },
      })

      return NextResponse.json(
        {
          error: 'Failed to generate interview questions',
        },
        { status: 500 }
      )
    }

    // Use a transaction for bulk question creation
    const savedQuestions = await prisma.$transaction(
      questions.map((question, index) =>
        prisma.question.create({
          data: {
            interviewId: interviewSession.id,
            text: question,
            order: index + 1,
            // rationale: question.rationale,
          },
        })
      )
    )

    // Format response
    const responseData = savedQuestions.map((q) => ({
      id: q.id,
      text: q.text,
      rationale: q.rationale,
      userAnswer: '',
      feedback: '',
      showFeedback: false,
      isAnswered: false,
      isSubmitting: false,
      interviewId: interviewSession.id,
    }))

    return NextResponse.json(responseData)
  } catch (err) {
    console.error('[API Error]', err)
    return NextResponse.json(
      {
        error: 'An unexpected error occurred',
      },
      { status: 500 }
    )
  }
}