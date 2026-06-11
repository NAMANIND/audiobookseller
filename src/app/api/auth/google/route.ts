import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "crypto";
import { buildGoogleAuthUrl } from "@/lib/google-auth";

export async function GET(request: NextRequest) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return NextResponse.json({ error: "Google sign-in is not configured" }, { status: 503 });
  }

  const returnTo = request.nextUrl.searchParams.get("returnTo") ?? "/purchases";
  const state = crypto.randomBytes(24).toString("hex");

  const response = NextResponse.redirect(buildGoogleAuthUrl(state));
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  response.cookies.set("oauth_return_to", returnTo, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return response;
}
