import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { streamPurchaseDownload } from "@/lib/download";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ purchaseId: string }> },
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const { purchaseId } = await params;
    return streamPurchaseDownload(purchaseId, session.email);
  } catch (error) {
    console.error("Authenticated download error:", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}
