import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { generateAnswerFeedback } from '../services'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email || !session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { answer, questionId } = await req.json()

  if (!questionId || !answer) {
    return new NextResponse('Missing question or answer', { status: 400 })
  }

  try {
    // Find the question and associated interview
    const dbQuestion = await prisma.question.findUnique({
      where: { id: questionId },
      include: { interview: true },
    })

    if (!dbQuestion) {
      return new NextResponse('Question not found', { status: 404 })
    }

    // Ensure the current user owns the interview
    if (dbQuestion.interview.userId !== session.user.id) {
      return new NextResponse('Unauthorized access to this question', {
        status: 403,
      })
    }

    // Generate feedback using AI service
    const feedbackContent = await generateAnswerFeedback(
      dbQuestion.text,
      answer
    )

    // Upsert the answer and feedback
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
            create: { content: feedbackContent },
            update: { content: feedbackContent, updatedAt: new Date() },
          },
        },
      },
      include: {
        feedback: true,
      },
    })

    // Check if all questions in the interview are now answered
    const interviewId = dbQuestion.interviewId

    const [totalQuestions, answeredQuestions] = await Promise.all([
      prisma.question.count({ where: { interviewId } }),
      prisma.answer.count({ where: { question: { interviewId } } }),
    ])

    // If all questions are answered, mark the interview as completed
    if (totalQuestions > 0 && totalQuestions === answeredQuestions) {
      await prisma.interviewSession.update({
        where: { id: interviewId },
        data: { status: 'completed' },
      })
    }

    return NextResponse.json({
      feedback: savedAnswer.feedback?.content || feedbackContent,
      answerId: savedAnswer.id,
    })
  } catch (err) {
    console.error('[Submit Answer API Error]', err)
    return new NextResponse('Failed to process answer and feedback', {
      status: 500,
    })
  }
}
