// File: app/api/interviews/route.ts
import { NextResponse } from 'next/server'
import { getServerSession, Session } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { generateQuestionsWithAI } from '@/lib/server/ai'
import { authOptions } from '../auth/[...nextauth]/route'

interface CustomSession extends Session {
  user?: Session['user'] & {
    id: string
  }
}

export async function POST(request: Request) {
  const session = (await getServerSession(authOptions)) as CustomSession

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { jobRole, resume } = await request.json()

    if (!jobRole || !resume) {
      return NextResponse.json(
        { error: 'Job role and resume are required' },
        { status: 400 }
      )
    }

    // Create a new interview session
    const interview = await prisma.interviewSession.create({
      data: {
        userId: session.user.id,
        jobRole,
        resume,
      },
    })

    // Generate questions with AI
    const questionTexts = await generateQuestionsWithAI(jobRole, resume)

    // Create questions in database
    const questions = await Promise.all(
      questionTexts.map((text, index) =>
        prisma.question.create({
          data: {
            interviewId: interview.id,
            text,
            order: index + 1,
          },
        })
      )
    )

    return NextResponse.json({ interview, questions })
  } catch (error) {
    console.error('Error creating interview:', error)
    return NextResponse.json(
      { error: 'Failed to create interview' },
      { status: 500 }
    )
  }
}

export async function GET() {
  const session = (await getServerSession(authOptions)) as CustomSession

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const interviews = await prisma.interviewSession.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
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
            order: 'asc',
          },
        },
      },
    })

    return NextResponse.json(interviews)
  } catch (error) {
    console.error('Error fetching interviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch interviews' },
      { status: 500 }
    )
  }
}
