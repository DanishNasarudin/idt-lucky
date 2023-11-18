"use server";
import { findUserByEmail } from "@/app/(serverActions)/manageJSON";
import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      const validUser = await findUserByEmail(user.email, "users");

      if (validUser && validUser.role === "admin") {
        return true;
      }

      return false;
    },
  },
});

export { handler as GET, handler as POST };
