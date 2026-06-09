import jwt, { type SignOptions } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface TokenPayload {
  email: string;
  purchaseId?: string;
  exp?: number;
}

export const generateToken = (
  payload: TokenPayload,
  expiresIn: SignOptions["expiresIn"] = "24h"
): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};

export const verifyToken = async (
  token: string
): Promise<TokenPayload | null> => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch {
    return null;
  }
};

export const generateDownloadToken = (
  email: string,
  purchaseId: string
): string => {
  return generateToken({ email, purchaseId }, "7d");
};

export const generateSessionToken = (email: string): string => {
  return generateToken({ email }, "24h");
};