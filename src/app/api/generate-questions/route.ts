import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { generateInterviewQuestions, parseQuestions } from '../services'
import pdf from 'pdf-parse'

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
    // Auth check
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Parse FormData
    const formData = await req.formData()
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
      try {
        if (resumeFile.type === 'application/pdf') {
          const arrayBuffer = await resumeFile.arrayBuffer()
          const pdfData = await pdf(Buffer.from(arrayBuffer))
          finalResumeText = pdfData.text
        } else {
          // For text-based files (DOCX, TXT)
          finalResumeText = await resumeFile.text()
        }
      } catch (error) {
        console.error('[File Processing Error]', error)
        return NextResponse.json(
          {
            error: 'Failed to process the uploaded file',
          },
          { status: 422 }
        )
      }
    }

    // Ensure we have resume content from either source
    if (!finalResumeText?.trim()) {
      return NextResponse.json(
        {
          error: 'Resume content is required',
        },
        { status: 400 }
      )
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Create interview session
    const interviewSession = await prisma.interviewSession.create({
      data: {
        userId: user.id,
        jobRole: role,
        resume: finalResumeText,
      },
    })


    // Generate and parse questions
    try {
      const rawQuestions = await generateInterviewQuestions(
        finalResumeText,
        role
      )
      const parsedQuestions = parseQuestions(rawQuestions)

      // Save questions to database
      const savedQuestions = await Promise.all(
        parsedQuestions.map((question, index) =>
          prisma.question.create({
            data: {
              interviewId: interviewSession.id,
              text: question.text,
              rationale: question.rationale,
              order: index + 1,
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
