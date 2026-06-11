import { cookies } from "next/headers";
import { payloadToSession, verifyToken, type SessionUser } from "@/lib/auth";

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload) return null;

  return payloadToSession(payload);
}
