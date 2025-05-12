// File: lib/ai.ts
import { OpenAI } from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateQuestionsWithAI(
  jobRole: string,
  resume: string
): Promise<string[]> {
  try {
    const prompt = `
    You are an expert interviewer for ${jobRole} positions.
    Generate 5 relevant interview questions based on the following resume:
    ${resume}
    
    The questions should assess technical skills, experience, problem-solving abilities, and cultural fit.
    Return only the questions as a JSON array of strings with no additional text.
    `

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    })

    const content = response.choices[0].message?.content || '[]'

    try {
      // Extract JSON array from the response if needed
      const jsonMatch = content.match(/\[.*\]/s)
      const jsonString = jsonMatch ? jsonMatch[0] : content
      return JSON.parse(jsonString)
    } catch (error) {
      console.error('Error parsing questions from AI:', error)
      return [
        "Can you describe a challenging technical problem you've solved recently?",
        'How do you ensure your code is maintainable and scalable?',
        'Tell me about your experience with relevant technologies for this role',
        'How do you approach learning new technologies?',
        "Can you share an example of how you've contributed to a team project?",
      ]
    }
  } catch (error) {
    console.error('Error generating questions with AI:', error)
    return [
      "Can you describe a challenging technical problem you've solved recently?",
      'How do you ensure your code is maintainable and scalable?',
      'Tell me about your experience with relevant technologies for this role',
      'How do you approach learning new technologies?',
      "Can you share an example of how you've contributed to a team project?",
    ]
  }
}

export async function generateFeedbackWithAI(
  question: string,
  answer: string
): Promise<{
  content: string
  clarity: number
  relevance: number
  depth: number
}> {
  try {
    const prompt = `
    You are an expert interview coach evaluating a candidate's interview response.
    
    Question: ${question}
    
    Answer: ${answer}
    
    Provide detailed feedback on this answer with specific suggestions for improvement.
    Also rate the answer on a scale of 1-5 (where 5 is best) for:
    - Clarity: How clear and well-structured the answer is
    - Relevance: How well the answer addresses the question
    - Depth: How comprehensive and detailed the answer is
    
    Return your response as a JSON object with the following format:
    {
      "content": "Your detailed feedback here...",
      "clarity": 4,
      "relevance": 3,
      "depth": 5
    }
    `

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    })

    const content = response.choices[0].message?.content || ''

    try {
      // Extract JSON object from the response if needed
      const jsonMatch = content.match(/\{.*\}/s)
      const jsonString = jsonMatch ? jsonMatch[0] : content
      return JSON.parse(jsonString)
    } catch (error) {
      console.error('Error parsing feedback from AI:', error)
      return {
        content:
          'Your answer is good, but could be more specific with examples. Consider structuring your response with a clear problem-solution-outcome framework.',
        clarity: 3,
        relevance: 4,
        depth: 3,
      }
    }
  } catch (error) {
    console.error('Error generating feedback with AI:', error)
    return {
      content:
        'Your answer is good, but could be more specific with examples. Consider structuring your response with a clear problem-solution-outcome framework.',
      clarity: 3,
      relevance: 4,
      depth: 3,
    }
  }
}
