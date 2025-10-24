import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth";

export async function middleware(request: NextRequest) {
  // Public paths that don't require authentication
  const publicPaths = ["/", "/api/purchase", "/api/verify"];

  // Check if the current path is public
  const isPublicPath = publicPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Handle download route specifically
  if (request.nextUrl.pathname.startsWith("/api/download/")) {
    const token = request.nextUrl.searchParams.get("token");

    if (!token) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
      const decoded = await verifyToken(token);
      if (!decoded || !decoded.email || !decoded.purchaseId) {
        return new NextResponse("Invalid token", { status: 401 });
      }

      // Continue to the download handler
      return NextResponse.next();
    } catch (error) {
      return new NextResponse("Invalid token", { status: 401 });
    }
  }

  // For other protected routes, verify the token from cookie
  const token = request.cookies.get("auth_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/api/verify", request.url));
  }

  try {
    const verified = await verifyToken(token);
    if (!verified) {
      return NextResponse.redirect(new URL("/api/verify", request.url));
    }
    return NextResponse.next();
  } catch (error) {
    return NextResponse.redirect(new URL("/api/verify", request.url));
  }
}

export const config = {
  matcher: ["/download/:path*", "/purchases/:path*", "/api/download/:path*"],
};
