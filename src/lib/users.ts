import { db } from "@/lib/firebase-admin";
import type { AuthProvider, SessionUser } from "@/lib/auth";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export interface AppUser {
  email: string;
  name?: string;
  picture?: string;
  providers: AuthProvider[];
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string;
  lastLoginProvider: AuthProvider;
}

export async function upsertUserFromLogin(input: {
  email: string;
  provider: AuthProvider;
  name?: string;
  picture?: string;
}): Promise<AppUser> {
  const email = normalizeEmail(input.email);
  const ref = db.collection("users").doc(email);
  const snap = await ref.get();
  const now = new Date().toISOString();
  const existing = snap.data() as Partial<AppUser> | undefined;

  const providers = new Set<AuthProvider>(existing?.providers ?? []);
  providers.add(input.provider);

  const user: AppUser = {
    email,
    name: input.name ?? existing?.name,
    picture: input.picture ?? existing?.picture,
    providers: Array.from(providers),
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
    lastLoginAt: now,
    lastLoginProvider: input.provider,
  };

  await ref.set(user, { merge: true });
  return user;
}

export function userToSession(user: AppUser, provider: AuthProvider): SessionUser {
  return {
    email: user.email,
    name: user.name,
    picture: user.picture,
    provider,
  };
}

export async function getUserByEmail(email: string): Promise<AppUser | null> {
  const doc = await db.collection("users").doc(normalizeEmail(email)).get();
  if (!doc.exists) return null;
  return doc.data() as AppUser;
}
