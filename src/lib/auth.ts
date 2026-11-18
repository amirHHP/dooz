import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { UserRole } from "@/types/next-auth";
import { verifyOtp } from "@/lib/otp";

/**
 * Normalizes Persian and Arabic numerals to ASCII digits.
 */
export function normalizeDigits(input: string): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  let output = input;
  for (let i = 0; i < 10; i++) {
    output = output
      .replaceAll(persianDigits[i], String(i))
      .replaceAll(arabicDigits[i], String(i));
  }
  return output.trim();
}

export const authConfig: NextAuthConfig = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.AUTH_SECRET || "dooz-development-fallback-secret-minimum-32-chars",
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      name: "شماره موبایل یا ایمیل",
      credentials: {
        identifier: { label: "ایمیل یا شماره موبایل", type: "text" },
        password: { label: "رمز عبور یا کد یکبار مصرف", type: "password" },
        authType: { label: "نوع احراز هویت", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null;
        }

        const rawIdentifier = String(credentials.identifier);
        const normalizedIdentifier = normalizeDigits(rawIdentifier);
        const secret = String(credentials.password);
        const authType = credentials.authType ? String(credentials.authType) : "password";

        try {
          // 1. Handle OTP Verification
          if (authType === "otp") {
            const cleanEmail = normalizedIdentifier.toLowerCase();
            const otpCheck = verifyOtp(cleanEmail, secret);
            if (!otpCheck.valid) {
              console.warn("OTP verification failed:", otpCheck.error);
              return null;
            }

            // Find existing user or auto-register with default role USER
            let user = await prisma.user.findUnique({
              where: { email: cleanEmail },
            });

            if (!user) {
              user = await prisma.user.create({
                data: {
                  email: cleanEmail,
                  name: cleanEmail.split("@")[0] || "کاربر دوز",
                  role: "USER",
                  walletBalance: 0,
                  bio: "عضو استودیو الگوسازی دوز",
                },
              });
            }

            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role as UserRole,
              phone: user.phone,
              image: user.avatar,
            };
          }

          // 2. Handle Password Verification
          const user = await prisma.user.findFirst({
            where: {
              OR: [
                { email: normalizedIdentifier.toLowerCase() },
                { phone: normalizedIdentifier },
              ],
            },
          });

          if (!user || !user.passwordHash) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(secret, user.passwordHash);
          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role as UserRole,
            phone: user.phone,
            image: user.avatar,
          };
        } catch (error) {
          console.error("Auth authorize error:", error);
          return null;
        }
      },
    }),
    // Conditionally enable Google OAuth only when credentials exist
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            const newUser = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name || "کاربر دوز",
                avatar: user.image,
                role: "USER",
              },
            });
            user.id = newUser.id;
            user.role = newUser.role as UserRole;
          } else {
            user.id = existingUser.id;
            user.role = existingUser.role as UserRole;
            user.phone = existingUser.phone;
          }
        } catch (error) {
          console.error("Error during Google OAuth sign in:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role || "USER";
        token.phone = user.phone || null;
      }

      if (trigger === "update" && session?.user) {
        token.name = session.user.name ?? token.name;
        token.role = session.user.role ?? token.role;
        token.phone = session.user.phone ?? token.phone;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as UserRole) || "USER";
        session.user.phone = token.phone as string | null;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
