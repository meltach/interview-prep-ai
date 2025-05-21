import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { authOptions } from '../../auth/[...nextauth]/auth-options'
type Params = Promise<{
  interviewId: string
}>
export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  try {
    const { interviewId } = await params
    const interviewSession = await prisma.interviewSession.findUnique({
      where: {
        id: interviewId,
        userId: session.user.id, // Direct ownership check in query
      },
      include: {
        questions: {
          include: {
            answer: {
              include: {
                feedback: true,
              },
            },
          },
          orderBy: {
            order: 'asc', // Ensure consistent question ordering
          },
        },
      },
    })

    if (!interviewSession) {
      return new NextResponse('Interview session not found', { status: 404 })
    }

    const formattedQuestions = interviewSession.questions.map((question) => ({
      id: question.id,
      text: question.text,
      userAnswer: question.answer?.text || '',
      feedback: question.answer?.feedback?.content || '',
      showFeedback: false,
      isAnswered: !!question.answer,
      isSubmitting: false,
      answerId: question.answer?.id || undefined,
      interviewId: interviewSession.id,
    }))

    return NextResponse.json({
      id: interviewSession.id,
      role: interviewSession.jobRole,
      questions: formattedQuestions,
      status: interviewSession.status,
      createdAt: interviewSession.createdAt,
      updatedAt: interviewSession.updatedAt,
    })
  } catch (error) {
    console.error('Error fetching interview session:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
