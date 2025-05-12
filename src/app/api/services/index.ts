// src/services/ai-service.ts
import OpenAI from 'openai'
// import Anthropic from '@anthropic-ai/sdk'
import { GoogleGenerativeAI } from '@google/generative-ai'
// import Together from '@together-ai/sdk'
// import { CohereClient } from 'cohere-ai'

// Initialize the API clients
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
// const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
// const together = new Together({ apiKey: process.env.TOGETHER_API_KEY })
// const cohere = new CohereClient({ token: process.env.COHERE_API_KEY })

// Define the provider type
export type AIProvider =
  | 'openai'
  | 'anthropic'
  | 'gemini'
  | 'together'
  | 'cohere'

// Set your default provider here
const defaultProvider: AIProvider =
  (process.env.DEFAULT_AI_PROVIDER as AIProvider) || 'gemini'

/**
 * Generate text using the configured AI provider
 */
export async function generateText(
  prompt: string,
  provider: AIProvider = defaultProvider
): Promise<string> {
  try {
    switch (provider) {
      case 'openai':
        return await generateWithOpenAI(prompt)

      case 'gemini':
        return await generateWithGemini(prompt)
      case 'together':

      default:
        // Fallback to openai if provider is not recognized
        return await generateWithOpenAI(prompt)
    }
  } catch (error) {
    console.error(`Error with ${provider}:`, error)

    // If the default provider fails, try an alternative
    if (provider === defaultProvider) {
      const fallbackProvider: AIProvider =
        defaultProvider === 'openai' ? 'anthropic' : 'openai'
      console.log(`Falling back to ${fallbackProvider}`)
      return await generateText(prompt, fallbackProvider)
    }

    throw error
  }
}

//Provider-specific implementations
async function generateWithOpenAI(prompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  })

  return response.choices[0].message.content?.trim() || 'No content generated'
}

// async function generateWithAnthropic(prompt: string): Promise<string> {
//   const response = await anthropic.messages.create({
//     model: 'claude-3-haiku-20240307',
//     max_tokens: 1000,
//     messages: [{ role: 'user', content: prompt }],
//     temperature: 0.7,
//   })

//   return response.content[0].text?.trim() || 'No content generated'
// }

async function generateWithGemini(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
  const result = await model.generateContent(prompt)
  const response = result.response
  return response.text() || 'No content generated'
}

// async function generateWithTogether(prompt: string): Promise<string> {
//   const response = await together.chat.completions.create({
//     model: 'meta-llama/Llama-3-8b-chat',
//     messages: [{ role: 'user', content: prompt }],
//     temperature: 0.7,
//     max_tokens: 800,
//   })

//   return response.choices[0].message.content?.trim() || 'No content generated'
// }

// async function generateWithCohere(prompt: string): Promise<string> {
//   const response = await cohere.chat({
//     model: 'command',
//     message: prompt,
//     temperature: 0.7,
//   })

//   return response.text?.trim() || 'No content generated'
// }

/**
 * Generate interview questions
 */
export async function generateInterviewQuestions(
  resume: string,
  role: string
): Promise<string[]> {
  const prompt = `Given the following resume:\n\n${resume}\n\nGenerate 3 interview questions for a ${role} role. The questions should be challenging and specifically tailored to assess the candidate's suitability for this exact role.`

  const content = await generateText(prompt)

  return content
    .split('\n')
    .filter(Boolean)
    .map((q) => q.replace(/^\d+\.?\s*/, ''))
}

/**
 * Generate feedback for an interview answer
 */
export async function generateAnswerFeedback(
  question: string,
  answer: string
): Promise<string> {
  const prompt = `
You are an experienced interview coach. A user was asked the following question:

"${question}"

Here is the user's answer:
"${answer}"

Give a concise paragraph of constructive feedback. Mention what was good, what could be improved, and suggest how to improve.
`

  return await generateText(prompt)
}

/**
 * Generate additional interview questions
 */
export async function generateMoreQuestions(
  resume: string,
  role: string,
  existingQuestions: string[]
): Promise<string[]> {
  const prompt = `
Given the following resume:

${resume}

And for the job role: ${role}

Generate 2 additional interview questions that are different from these existing questions:
${existingQuestions.join('\n')}

The questions should be challenging and specifically tailored to assess the candidate's suitability for this exact role.
`

  const content = await generateText(prompt)

  return content
    .split('\n')
    .filter(Boolean)
    .map((q) => q.replace(/^\d+\.?\s*/, ''))
}
