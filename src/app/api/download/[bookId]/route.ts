import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    {
      error:
        "This download link is no longer supported. Sign in and download from My Purchases.",
    },
    { status: 410 },
  );
}
