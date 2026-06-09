import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getPurchaseByIdAndEmail, incrementDownloadCount } from "@/lib/db";
import { getDownloadUrl } from "@/lib/storage";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { bookId } = await params;
    const token = new URL(request.url).searchParams.get("token");

    if (!token) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded?.email || !decoded.purchaseId) {
      return new NextResponse("Invalid token", { status: 401 });
    }

    const purchase = await getPurchaseByIdAndEmail(decoded.purchaseId, decoded.email);
    if (!purchase || purchase.bookId !== bookId) {
      return new NextResponse("Purchase not found", { status: 404 });
    }

    const maxDownloads = Number(process.env.MAX_DOWNLOADS ?? 2);
    if (purchase.downloadCount >= maxDownloads) {
      return new NextResponse("Download limit exceeded", { status: 403 });
    }

    await incrementDownloadCount(purchase.id);

    const signedUrl = await getDownloadUrl(
      purchase.book.storagePath,
      purchase.book.fallbackUrl
    );

    return NextResponse.redirect(signedUrl);
  } catch (error) {
    if (error instanceof Error && error.message === "DOWNLOAD_LIMIT_EXCEEDED") {
      return new NextResponse("Download limit exceeded", { status: 403 });
    }
    console.error("Download error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}