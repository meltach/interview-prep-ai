import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '../auth/[...nextauth]/route'

export async function GET() {
  const session = await getServerSession(authOptions)

  // Check if user is authenticated
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Fetch interview sessions for the current user
    const interviews = await prisma.interviewSession.findMany({
      where: {
        user: {
          email: session.user.email,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })
    // Format the response i want the sessionid, role, and createdAt
    const formattedInterviews = interviews.map((interview) => ({
      id: interview.id,
      role: interview.jobRole,
      createdAt: interview.createdAt,
    }))

    return NextResponse.json(formattedInterviews)
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

    // Check if user is authenticated
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId } = await req.json()

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    // Find the interview to verify it belongs to the current user
    const interview = await prisma.interviewSession.findUnique({
      where: {
        id: sessionId,
      },
      select: {
        userId: true,
      },
    })

    if (!interview) {
      return NextResponse.json(
        { error: 'Interview not found' },
        { status: 404 }
      )
    }

    // Ensure the interview belongs to the current user
    if (interview.userId !== (session.user as { id?: string }).id) {
      return NextResponse.json(
        {
          error:
            "Unauthorized - You don't have permission to delete this interview",
        },
        { status: 403 }
      )
    }

    const deletedInterview = await prisma.interviewSession.delete({
      where: {
        id: sessionId,
      },
    })

    return NextResponse.json({
      message: 'Interview session and all related data successfully deleted',
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
