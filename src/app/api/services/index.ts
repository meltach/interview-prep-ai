import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY as string,
  baseURL: 'https://api.deepseek.com',
})

export type AIProvider = 'openai' | 'gemini' | 'deepseek'

const defaultProvider: AIProvider =
  (process.env.DEFAULT_AI_PROVIDER as AIProvider) || 'gemini'

/**
 * Generate text using the configured AI provider
 */
export async function generateText(
  prompt: string,
  provider: AIProvider = defaultProvider
): Promise<string> {
  console.log(`Using provider: ${provider}`)
  try {
    switch (provider) {
      case 'openai':
        return await generateWithOpenAI(prompt)
      case 'deepseek':
        return await generateWithDeepSeek(prompt)
      case 'gemini':
        return await generateWithGemini(prompt)
      default:
        // Fallback to deepseek if provider is not recognized (they are cheaper)
        return await generateWithDeepSeek(prompt)
    }
  } catch (error) {
    console.error(`Error with ${provider}:`, error)

    // If the default provider fails, try an alternative
    if (provider === defaultProvider) {
      const fallbackProviders: AIProvider[] = [
        'openai',
        'gemini',
        'deepseek',
      ].filter((p) => p !== defaultProvider) as AIProvider[]

      for (const fallbackProvider of fallbackProviders) {
        try {
          return await generateText(prompt, fallbackProvider)
        } catch (fallbackError) {
          console.error(
            `Error with fallback provider ${fallbackProvider}:`,
            fallbackError
          )
          continue
        }
      }
    }
    throw error
  }
}

//Provider-specific implementations
async function generateWithOpenAI(prompt: string): Promise<string> {
  const response = await openai.chat.completions.create({
    model: 'o4-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  })

  return response.choices[0].message.content?.trim() || 'No content generated'
}

async function generateWithGemini(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })
  const result = await model.generateContent(prompt)
  const response = result.response
  return response.text() || 'No content generated'
}

async function generateWithDeepSeek(prompt: string): Promise<string> {
  const response = await deepseek.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: 'deepseek-chat',
    temperature: 1.3,
  })

  return response.choices[0].message.content?.trim() || 'No content generated'
}

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

/**
 * Parses raw questions output from AI and extracts questions with their rationales
 *
 * @param rawQuestions - The array of strings returned from the AI
 * @returns Array of objects with question text and rationale
 */
export function parseQuestions(
  rawQuestions: string[]
): { text: string; rationale: string }[] {
  const formattedQuestions: { text: string; rationale: string }[] = []

  // Skip the introduction (index 0) and process question-rationale pairs
  for (let i = 1; i < rawQuestions.length; i += 2) {
    // Check if this is a question (typically odd indices: 1, 3, 5)
    if (i < rawQuestions.length && rawQuestions[i].includes('"')) {
      const questionText = rawQuestions[i]
        // Clean up the question - remove numbering if present
        .replace(/^\d+\.\s*/, '')
        // Remove extra quotation marks
        .replace(/^["']|["']$/g, '')
        .trim()

      // Get the rationale (the next item in the array, if it exists)
      let rationale = ''
      if (i + 1 < rawQuestions.length) {
        // Extract the actual explanation, removing any markdown formatting
        rationale = rawQuestions[i + 1]
          .replace(/^\s*\*\s*\*\*Why it's challenging:\*\*/, '')
          .replace(/^\s*Why it's challenging:\s*/, '')
          .replace(/^\s*\*\s*/, '')
          .trim()
      }

      formattedQuestions.push({ text: questionText, rationale })
    }
  }

  return formattedQuestions
}