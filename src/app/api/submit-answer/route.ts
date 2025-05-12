import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
// import OpenAI from 'openai'
import { prisma } from '@/lib/prisma'
import { generateAnswerFeedback } from '../services'

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// })

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { question, answer, questionId } = await req.json()

  if (!question || !answer || !questionId) {
    return new NextResponse('Missing question, answer, or questionId', {
      status: 400,
    })
  }

  try {
    // Find the question in the database
    const dbQuestion = await prisma.question.findUnique({
      where: { id: questionId },
      include: { interview: true },
    })

    if (!dbQuestion) {
      return new NextResponse('Question not found', { status: 404 })
    }

    // Verify user owns this interview
    if (dbQuestion.interview.userId !== session.user.id) {
      return new NextResponse('Unauthorized access to this question', {
        status: 403,
      })
    }

    //     // Generate feedback with OpenAI
    //     const prompt = `
    // You are an experienced interview coach. A user was asked the following question:

    // "${question}"

    // Here is the user's answer:
    // "${answer}"

    // Give a concise paragraph of constructive feedback. Mention what was good, what could be improved, and suggest how to improve.
    // `

    //     const aiResponse = await openai.chat.completions.create({
    //       model: 'gpt-4.1-mini',
    //       messages: [{ role: 'user', content: prompt }],
    //       temperature: 0.7,
    //     })

    //     const feedbackContent =
    //       aiResponse.choices[0].message.content?.trim() || 'No feedback available'

    // Generate feedback with AI service
    const feedbackContent = await generateAnswerFeedback(question, answer)

    // Create or update the answer and feedback in the database
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
            create: {
              content: feedbackContent,
            },
            update: {
              content: feedbackContent,
              updatedAt: new Date(),
            },
          },
        },
      },
      include: {
        feedback: true,
      },
    })

    return NextResponse.json({
      feedback: savedAnswer.feedback?.content || feedbackContent,
      answerId: savedAnswer.id,
    })
  } catch (err) {
    console.error('[API Error]', err)
    return new NextResponse('Failed to process answer and feedback', {
      status: 500,
    })
  }
}
