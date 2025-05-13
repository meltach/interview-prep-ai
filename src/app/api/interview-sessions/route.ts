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
