// File: app/api/auth/[...nextauth]/route.ts
import NextAuth, { Session } from 'next-auth'
import GitHubProvider from 'next-auth/providers/github'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'database' as const,
  },
  callbacks: {
    session: async ({ session, user }: { session: Session; user: unknown }) => {
      console.log('SESSION CALLBACK', session)
      console.log('USER CALLBACK', user)
     // Find the active session for this user
    const activeSession = await prisma.interviewSession.findFirst({
      where: {
        userId: (user as { id: string }).id,
      },
    })

    console.log('Active Session:', activeSession)

    return {
      ...session,
      user: {
        ...session.user,
        id: (user as { id: string }).id,
        interviewSessionId: activeSession?.id || null,
      },
    }
  },
},
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }

// SESSION CALLBACK {
//   user: {
//     name: 'Melaku Tachbele',
//     email: 'mbandwalu@gmail.com',
//     image: 'https://avatars.githubusercontent.com/u/56900055?v=4'
//   },
//   expires: '2025-06-11T01:46:27.133Z'
// }
// USER CALLBACK {
//   id: 'cmakf9cbe0000jfpk38itvj0t',
//   name: 'Melaku Tachbele',
//   email: 'mbandwalu@gmail.com',
//   emailVerified: null,
//   image: 'https://avatars.githubusercontent.com/u/56900055?v=4',
//   createdAt: 2025-05-12T01:46:27.098Z,
//   updatedAt: 2025-05-12T01:46:27.098Z
// }
