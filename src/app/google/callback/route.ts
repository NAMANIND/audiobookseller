import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { exchangeGoogleCode, fetchGoogleUser } from "@/lib/google-auth";
import { setAuthCookie } from "@/lib/auth";
import { upsertUserFromLogin, userToSession } from "@/lib/users";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const storedState = request.cookies.get("oauth_state")?.value;
  const returnTo = request.cookies.get("oauth_return_to")?.value ?? "/purchases";

  if (!code || !state || !storedState || state !== storedState) {
    return NextResponse.redirect(
      new URL("/purchases?error=google_auth_failed", request.url),
    );
  }

  try {
    const tokens = await exchangeGoogleCode(code);
    const profile = await fetchGoogleUser(tokens.access_token);

    if (!profile.email || profile.verified_email === false) {
      throw new Error("Google account email not verified");
    }

    const user = await upsertUserFromLogin({
      email: profile.email,
      provider: "google",
      name: profile.name,
      picture: profile.picture,
    });

    const response = NextResponse.redirect(new URL(returnTo, request.url));
    setAuthCookie(response, userToSession(user, "google"));

    response.cookies.set("oauth_state", "", { maxAge: 0, path: "/" });
    response.cookies.set("oauth_return_to", "", { maxAge: 0, path: "/" });

    return response;
  } catch (error) {
    console.error("Google callback error:", error);
    return NextResponse.redirect(
      new URL("/purchases?error=google_auth_failed", request.url),
    );
  }
}
