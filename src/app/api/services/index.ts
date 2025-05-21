import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY as string,
  baseURL: 'https://api.deepseek.com/v1',
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
  const prompt = `
As an expert ${role} interviewer, carefully analyze this resume:
\`\`\`
${resume}
\`\`\`

Generate 3 interview questions tailored specifically to this candidate's background for a ${role} position.

Create questions that:
- Assess both technical competence and soft skills relevant to the role
- Challenge the candidate to demonstrate their expertise from past experiences
- Include 1 behavioral question, 1 technical question, and 1 situational/problem-solving question
- Reference specific elements from their resume when relevant

**Return ONLY a valid JSON array of 3 strings, each being a complete question. No explanations, no numbering**
`

  const content = await generateText(prompt)

  try {
    // Remove Markdown code block fences like ```json and ```
    const json = content.trim().replace(/^```(?:json)?\s*|\s*```$/g, '')
    const questions = JSON.parse(json)
    if (Array.isArray(questions)) {
      return questions
    }
    throw new Error('Invalid response format')
  } catch (e) {
    console.error('Failed to parse questions:', e)
    return []
  }
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
As an expert technical interviewer for ${role} positions, analyze this resume:
\`\`\`
${resume}
\`\`\`

Generate 2 challenging, role-specific interview questions that:
- Target skills/experiences specifically mentioned in the resume
- Test both technical knowledge and practical application
- Are different from these existing questions:
${existingQuestions.map((q) => `- "${q}"`).join('\n')}

Each question should assess the candidate's actual fit for this ${role} role. Include one behavioral question and one technical/situational question. Format each as a complete question no explanations no numbering.
`

  const content = await generateText(prompt)

  try {
    // Remove Markdown code block fences like ```json and ```
    const json = content.trim().replace(/^```(?:json)?\s*|\s*```$/g, '')
    const questions = JSON.parse(json)
    if (Array.isArray(questions)) {
      return questions
    }
    throw new Error('Invalid response format')
  } catch (e) {
    console.error('Failed to parse questions:', e)
    return []
  }
}
/**
 * Generate feedback for an interview answer
 */
export async function generateAnswerFeedback(
  question: string,
  answer: string
): Promise<string> {
  const prompt = `
You are an experienced interview coach specializing in professional roles. A candidate was asked:
"${question}"

Their answer was:
"${answer}"

Provide concise, constructive feedback (max 150 words) that:
1. Highlights 1-2 specific strengths in their response
2. Identifies 1-2 specific areas for improvement
3. Offers actionable advice to enhance their answer
4. If relevant, suggests a brief example of how a stronger response might be phrased

Use markdown formatting for clarity: **bold** for key points and \`code\` for any technical terms.
**Do not include any introductory phrases or explanations. Output only the feedback.**
`

  return await generateText(prompt)
}

