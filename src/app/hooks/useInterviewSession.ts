import useSWR, { Fetcher } from 'swr'
import { PastSession } from '../types'

const fetcher: Fetcher<PastSession[]> = async (url: string) => {
  const response = await fetch(url)
  const data = await response.json()
  return data
}

export function useInterviewSession() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/interview-sessions',
    fetcher,
    {
      revalidateOnFocus: false,
    }
  )

  const deleteSession = async (interviewId: string) => {
    const response = await fetch(`/api/interview-sessions`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ interviewId }),
    })

    if (!response.ok) {
      throw new Error('Failed to delete session')
    }

    mutate()
  }

  return {
    sessionData: data,
    isLoading,
    isError: error,
    deleteSession,
  }
}
