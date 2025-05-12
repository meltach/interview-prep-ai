// File: app/api/questions/[id]/answers/route.ts
import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { generateFeedbackWithAI } from '@/lib/server/ai'
import { Session } from 'next-auth' // Add this import

interface CustomSession extends Session {
  user?: Session['user'] & {
    id: string
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = (await getServerSession(authOptions)) as CustomSession

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { text } = await request.json()
    const questionId = params.id

    if (!text) {
      return NextResponse.json(
        { error: 'Answer text is required' },
        { status: 400 }
      )
    }

    // Verify user owns this question
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { interview: true },
    })

    if (!question || question.interview.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Create or update answer
    const answer = await prisma.answer.upsert({
      where: { questionId },
      update: { text },
      create: {
        questionId,
        text,
      },
    })

    // Generate AI feedback
    const feedbackContent = await generateFeedbackWithAI(
      question.text,
      answer.text
    )

    // Create or update feedback
    const feedback = await prisma.feedback.upsert({
      where: { answerId: answer.id },
      update: {
        content: feedbackContent.content,
        clarity: feedbackContent.clarity,
        relevance: feedbackContent.relevance,
        depth: feedbackContent.depth,
      },
      create: {
        answerId: answer.id,
        content: feedbackContent.content,
        clarity: feedbackContent.clarity,
        relevance: feedbackContent.relevance,
        depth: feedbackContent.depth,
      },
    })

    return NextResponse.json({ answer, feedback })
  } catch (error) {
    console.error('Error submitting answer:', error)
    return NextResponse.json(
      { error: 'Failed to submit answer' },
      { status: 500 }
    )
  }
}
