import { DefaultSession } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

export type UserRole = "USER" | "CREATOR" | "ADMIN";

declare module "next-auth" {
  interface User {
    id?: string;
    role?: UserRole;
    phone?: string | null;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      role: UserRole;
      phone?: string | null;
      image?: string | null;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    role?: UserRole;
    phone?: string | null;
  }
}
