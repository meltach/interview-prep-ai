import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { generateInterviewQuestions, parseQuestions } from '../services'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { role, resume } = await req.json()

  if (!role || !resume) {
    return new NextResponse('Missing input', { status: 400 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return new NextResponse('User not found', { status: 404 })
    }

    // Step 1: Create InterviewSession
    const interviewSession = await prisma.interviewSession.create({
      data: {
        userId: user.id,
        jobRole: role,
        resume,
      },
    })

    const rawQuestions = await generateInterviewQuestions(resume, role)
    console.log('Generated Questions:', rawQuestions)

    // Step 2: Parse questions to extract text and rationale
    const parsedQuestions = parseQuestions(rawQuestions)
    console.log('Parsed Questions:', parsedQuestions)

    // Step 3: Save questions to DB with rationale
    const savedQuestions = await Promise.all(
      parsedQuestions.map((question, index) =>
        prisma.question.create({
          data: {
            interviewId: interviewSession.id,
            text: question.text,
            rationale: question.rationale, // Save the rationale
            order: index + 1,
          },
        })
      )
    )

    console.log('Saved Questions:', savedQuestions)

    // Step 4: Return questions to client
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

    console.log('Response Data:', responseData)

    return NextResponse.json(responseData)
  } catch (err) {
    console.error('[API Error]', err)
    return new NextResponse('Failed to generate questions', { status: 500 })
  }
}
