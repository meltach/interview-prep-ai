import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { generateAnswerFeedback } from '../services'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { question, answer, questionId } = await req.json()

  if (!question || !answer || !questionId) {
    return new NextResponse('Missing question, answer, or questionId', {
      status: 400,
    })
  }

  try {
    // Find the question in the database
    const dbQuestion = await prisma.question.findUnique({
      where: { id: questionId },
      include: { interview: true },
    })

    if (!dbQuestion) {
      return new NextResponse('Question not found', { status: 404 })
    }

    // Verify user owns this interview
    if (dbQuestion.interview.userId !== (session.user as { id?: string }).id) {
      return new NextResponse('Unauthorized access to this question', {
        status: 403,
      })
    }

    // Generate feedback with AI service
    const feedbackContent = await generateAnswerFeedback(question, answer)

    // Create or update the answer and feedback in the database
    const savedAnswer = await prisma.answer.upsert({
      where: { questionId },
      create: {
        questionId,
        text: answer,
        feedback: {
          create: {
            content: feedbackContent,
          },
        },
      },
      update: {
        text: answer,
        feedback: {
          upsert: {
            create: {
              content: feedbackContent,
            },
            update: {
              content: feedbackContent,
              updatedAt: new Date(),
            },
          },
        },
      },
      include: {
        feedback: true,
      },
    })

    return NextResponse.json({
      feedback: savedAnswer.feedback?.content || feedbackContent,
      answerId: savedAnswer.id,
    })
  } catch (err) {
    console.error('[API Error]', err)
    return new NextResponse('Failed to process answer and feedback', {
      status: 500,
    })
  }
}
