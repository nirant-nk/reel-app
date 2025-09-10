import User from "@/models/user.model";
import bcrypt from "bcryptjs";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import connectToDatabase from "./db";

export const AuthOptions: NextAuthOptions = {
  providers: [
    // add providers here
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        try {
          await connectToDatabase();

          const user = await User.findOne({ email: credentials.email });

          if (!user) {
            throw new Error("No user found with the given email");
          }

          const passwordIsValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!passwordIsValid) {
            throw new Error("Invalid password");
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          throw new Error(
            "AUTH_ERROR: " +
              (error instanceof Error ? error.message : String(error))
          );
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin", // Error code passed in query string as ?error=
  },
  session: {
    strategy: "jwt", // can also be 'database' if using a database
    maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
  },
  secret: process.env.NEXTAUTH_SECRET,
  
};
