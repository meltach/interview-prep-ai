type PastSession = {
  id: string
  role: string
  createdAt: string
}

type GroupedSessions = {
  [key: string]: PastSession[]
}

// Group sessions by date ranges
export const groupSessionsByDate = (
  sessions: PastSession[],
  setGroupedSessions: (grouped: GroupedSessions) => void
) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const oneWeekAgo = new Date(today)
  oneWeekAgo.setDate(today.getDate() - 7)

  const oneMonthAgo = new Date(today)
  oneMonthAgo.setDate(today.getDate() - 30)

  const grouped: GroupedSessions = {
    Today: [],
    'Last 7 Days': [],
    'Last 30 Days': [],
    Older: [],
  }

  sessions.forEach((session) => {
    const sessionDate = new Date(session.createdAt)
    sessionDate.setHours(0, 0, 0, 0)

    if (sessionDate.getTime() === today.getTime()) {
      grouped['Today'].push(session)
    } else if (sessionDate >= oneWeekAgo) {
      grouped['Last 7 Days'].push(session)
    } else if (sessionDate >= oneMonthAgo) {
      grouped['Last 30 Days'].push(session)
    } else {
      grouped['Older'].push(session)
    }
  })

  setGroupedSessions(grouped)
}

// Format date for display
export const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

// Format time for display
export const formatTime = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
