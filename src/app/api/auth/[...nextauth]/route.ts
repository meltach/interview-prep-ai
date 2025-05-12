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
    session: ({ session, user }: { session: Session; user: unknown }) => {
      return {
        ...session,
        user: {
          ...session.user,
          id: (user as { id: string }).id,
        },
      }
    },
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
