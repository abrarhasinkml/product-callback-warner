import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import PostgresAdapter from "@auth/pg-adapter";
import { pool } from "@/lib/db";
import bcrypt from "bcryptjs";
import { getUserByEmail } from "@/lib/db/users";

export const authOptions: NextAuthOptions = {
  adapter: PostgresAdapter(pool) as NextAuthOptions["adapter"],
  session: { strategy: "jwt" },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      /**
       * Authorize credentials.
       *
       * Expects password to be pre-hashed with SHA-256 on the client side.
       * Compares the SHA-256 hash with the bcrypt-hashed password in the database.
       */
      authorize: async (credentials) => {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await getUserByEmail(credentials.email);
        if (!user || !user.password_hash) {
          return null;
        }

        // credentials.password is already SHA-256 hashed by the client
        // user.password_hash is bcrypt(SHA-256(password))
        const isValid = await bcrypt.compare(
          credentials.password,
          user.password_hash
        );

        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    newUser: "/profile",
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user && token?.id) {
        (session.user as { id: string }).id = token.id as string;
      }
      return session;
    },
  },
};

export default NextAuth(authOptions);
