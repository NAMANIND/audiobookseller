import jwt, { type SignOptions } from "jsonwebtoken";
import { NextResponse } from "next/server";
import { normalizeEmail } from "@/lib/users";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export type AuthProvider = "google" | "email";

export interface TokenPayload {
  email: string;
  name?: string;
  picture?: string;
  provider?: AuthProvider;
  purchaseId?: string;
  exp?: number;
}

export interface SessionUser {
  email: string;
  name?: string;
  picture?: string;
  provider: AuthProvider;
}

export const generateToken = (
  payload: TokenPayload,
  expiresIn: SignOptions["expiresIn"] = "7d",
): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

export const verifyToken = async (
  token: string,
): Promise<TokenPayload | null> => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
};

export const generateDownloadToken = (
  email: string,
  purchaseId: string,
): string => {
  return generateToken({ email, purchaseId }, "7d");
};

export const generateSessionToken = (user: SessionUser): string => {
  return generateToken(
    {
      email: normalizeEmail(user.email),
      name: user.name,
      picture: user.picture,
      provider: user.provider,
    },
    "7d",
  );
};

export function setAuthCookie(response: NextResponse, user: SessionUser) {
  const token = generateSessionToken(user);
  response.cookies.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60,
    path: "/",
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set("auth_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

export function payloadToSession(payload: TokenPayload): SessionUser | null {
  if (!payload.email) return null;
  return {
    email: normalizeEmail(payload.email),
    name: payload.name,
    picture: payload.picture,
    provider: payload.provider ?? "email",
  };
}
