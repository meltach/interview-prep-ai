// import 'next-auth'

// declare module 'next-auth' {
//   interface Session {
//     user: {
//       id: string
//       name?: string | null
//       email?: string | null
//       image?: string | null
//     }
//   }
// }
export {}
import 'next-auth'

declare global {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}
