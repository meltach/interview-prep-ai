import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '../auth/[...nextauth]/auth-options'
import { InterviewResponse } from '@/app/types'

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    // Check for id instead of email
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const interviews = await prisma.interviewSession.findMany({
      where: {
        userId: session.user.id, // Query by userId instead of email
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(
      interviews.map((interview: InterviewResponse) => ({
        id: interview.id,
        role: interview.jobRole,
        createdAt: interview.createdAt,
      }))
    )
  } catch (error) {
    console.error('Failed to fetch interview sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { interviewId } = await req.json()

    if (!interviewId) {
      return NextResponse.json(
        { error: 'Missing interviewId' },
        { status: 400 }
      )
    }

    const interview = await prisma.interviewSession.findUnique({
      where: { id: interviewId },
    })

    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      )
    }

    if (interview.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Unauthorized - You don't have permission" },
        { status: 403 }
      )
    }

    const deletedInterview = await prisma.interviewSession.delete({
      where: { id: interviewId },
    })

    return NextResponse.json({
      message: 'Interview session deleted successfully',
      deletedInterviewId: deletedInterview.id,
    })
  } catch (error) {
    console.error('Error deleting interview:', error)
    return NextResponse.json(
      { error: 'Failed to delete interview session' },
      { status: 500 }
    )
  }
}
