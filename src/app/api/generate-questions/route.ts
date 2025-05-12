import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
// import OpenAI from 'openai'
import { prisma } from '@/lib/prisma' // adjust path if needed
import { generateInterviewQuestions } from '../services'

// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { role, resume } = await req.json()

  if (!role || !resume) {
    return new NextResponse('Missing input', { status: 400 })
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return new NextResponse('User not found', { status: 404 })
    }

    // Step 1: Create InterviewSession
    const interviewSession = await prisma.interviewSession.create({
      data: {
        userId: user.id,
        jobRole: role,
        resume,
      },
    })

    // // Step 2: Generate questions with OpenAI
    // const prompt = `Given the following resume:\n\n${resume}\n\nGenerate 3 interview questions for a ${role} role. The questions should be challenging and specifically tailored to assess the candidate's suitability for this exact role.`

    // const response = await openai.chat.completions.create({
    //   model: 'gpt-4.1-mini',
    //   messages: [{ role: 'user', content: prompt }],
    //   temperature: 0.7,
    // })

    // const rawQuestions =
    //   response.choices[0].message.content
    //     ?.split('\n')
    //     .filter(Boolean)
    //     .map((q) => q.replace(/^\d+\.?\s*/, '')) ?? []

    // Step 2: Generate questions with AI service
    const rawQuestions = await generateInterviewQuestions(resume, role)
    console.log('Generated Questions:', rawQuestions)

    // Step 3: Save questions to DB
    const savedQuestions = await Promise.all(
      rawQuestions.map((text, index) =>
        prisma.question.create({
          data: {
            interviewId: interviewSession.id,
            text,
            order: index + 1,
          },
        })
      )
    )

    console.log('Saved Questions:', savedQuestions)

    // Step 4: Return questions to client
    const responseData = savedQuestions.map((q) => ({
      id: q.id,
      text: q.text,
      userAnswer: '',
      feedback: '',
      showFeedback: false,
      isAnswered: false,
      isSubmitting: false,
      interviewId: interviewSession.id, // Include interviewId
    }))

    console.log('Response Data:', responseData)

    return NextResponse.json(responseData)
  } catch (err) {
    console.error('[API Error]', err)
    return new NextResponse('Failed to generate questions', { status: 500 })
  }
}
