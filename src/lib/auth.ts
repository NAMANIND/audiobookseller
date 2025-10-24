import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export interface TokenPayload {
  email: string;
  purchaseId?: string;
  exp?: number;
}

export const generateToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
};

export const verifyToken = async (
  token: string
): Promise<TokenPayload | null> => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    return decoded;
  } catch (error) {
    return null;
  }
};

export const generateDownloadToken = (
  email: string,
  purchaseId: string
): string => {
  return generateToken({ email, purchaseId });
};

export const generateMagicLinkToken = (email: string): string => {
  return generateToken({ email });
};
