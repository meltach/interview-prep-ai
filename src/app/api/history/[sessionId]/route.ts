import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const interviewSession = await prisma.interviewSession.findUnique({
    where: { id: params.sessionId },
    include: {
      questions: {
        include: {
          answer: {
            include: {
              feedback: true,
            },
          },
        },
      },
    },
  })

  if (!interviewSession) {
    return new NextResponse('Not found', { status: 404 })
  }

  // Optional: check if session.user.id matches interviewSession.userId
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user || interviewSession.userId !== user.id) {
    return new NextResponse('Unauthorized access to this interview', {
      status: 403,
    })
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
    role: interviewSession.jobRole,
    questions: formattedQuestions,
  })
}
