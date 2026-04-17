import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

const ALLOWED_DOMAINS = ['savvywealth.com', 'savvyadvisors.com']

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          // Hint hosted domain — still validates server-side
          hd: '*',
        },
      },
    }),
  ],
  callbacks: {
    signIn({ profile }) {
      const email = profile?.email ?? ''
      return ALLOWED_DOMAINS.some(d => email.endsWith(`@${d}`))
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
})
