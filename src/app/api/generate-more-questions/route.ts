import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
// import OpenAI from 'openai'
import { prisma } from '@/lib/prisma'
import { generateMoreQuestions } from '../services'

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { interviewId, currentCount = 0 } = await req.json()

  if (!interviewId) {
    return new NextResponse('Missing interviewId', { status: 400 })
  }

  try {
    // Find the interview session and validate ownership
    const interviewSession = await prisma.interviewSession.findUnique({
      where: { id: interviewId },
    })

    if (!interviewSession) {
      return new NextResponse('Interview session not found', { status: 404 })
    }

    // Verify user owns this interview
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user || interviewSession.userId !== user.id) {
      return new NextResponse('Unauthorized access to this interview', {
        status: 403,
      })
    }

    // Get existing questions to avoid duplication
    const existingQuestions = await prisma.question.findMany({
      where: { interviewId },
      select: { text: true },
    })

    const existingQuestionsText = existingQuestions.map((q) => q.text)

    // Generate new questions with OpenAI
    //     const prompt = `
    // Given the following resume:

    // ${interviewSession.resume}

    // And for the job role: ${interviewSession.jobRole}

    // Generate 2 additional interview questions that are different from these existing questions:
    // ${existingQuestionsText.join('\n')}

    // The questions should be challenging and specifically tailored to assess the candidate's suitability for this exact role.
    // `

    //     const response = await openai.chat.completions.create({
    //       model: 'gpt-4.1-mini',
    //       messages: [{ role: 'user', content: prompt }],
    //       temperature: 0.7,
    //     })

    // const rawQuestions =
    //   response.choices[0].message.content
    //     ?.split('\n')
    //     .filter(Boolean)
    //     .map((q) => q.replace(/^\d+\.?\s*/, '')) ?? []

    // Generate new questions with AI service
    const rawQuestions = await generateMoreQuestions(
      interviewSession.resume,
      interviewSession.jobRole,
      existingQuestionsText
    )

    // Save new questions to DB
    const nextOrderNumber = currentCount + 1
    const savedQuestions = await Promise.all(
      rawQuestions.map((text, index) =>
        prisma.question.create({
          data: {
            interviewId,
            text,
            order: nextOrderNumber + index,
          },
        })
      )
    )

    // Format response for client
    const responseData = savedQuestions.map((q) => ({
      id: q.id,
      text: q.text,
      userAnswer: '',
      feedback: '',
      showFeedback: false,
      isAnswered: false,
      isSubmitting: false,
      interviewId: q.interviewId,
    }))

    return NextResponse.json(responseData)
  } catch (err) {
    console.error('[API Error]', err)
    return new NextResponse('Failed to generate more questions', {
      status: 500,
    })
  }
}
