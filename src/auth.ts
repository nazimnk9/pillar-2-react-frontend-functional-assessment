import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "Mock Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "admin@jcrea.com" },
        password: { label: "Password", type: "password" },
        role: { label: "Role (admin/manager)", type: "text", placeholder: "admin" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const email = credentials.email as string;
        const password = credentials.password as string;
        const requestedRole = (credentials.role as string) || "manager";

        // Simple bypass / mock credentials check for local development
        if (email && password) {
          let role = "manager";
          let name = "Manager User";

          if (email.startsWith("admin")) {
            role = "admin";
            name = "Admin User";
          } else if (requestedRole.toLowerCase() === "admin") {
            role = "admin";
            name = "Admin Tester";
          } else if (email.startsWith("manager")) {
            role = "manager";
            name = "Manager User";
          }

          return {
            id: email === "admin@jcrea.com" ? "1" : "2",
            name: name,
            email: email,
            role: role,
            image: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role || "manager";
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.role = token.role || "manager";
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "default_auth_secret_for_local_dev_only_32_chars_long",
});
