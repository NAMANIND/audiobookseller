import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: { bookId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || !decoded.email || !decoded.purchaseId) {
      return new NextResponse("Invalid token", { status: 401 });
    }

    // Get purchase details from database
    console.log("Decoded token:", decoded.purchaseId);
    const purchase = await prisma.purchase.findFirst({
      where: {
        id: decoded.purchaseId,
        email: decoded.email,
        status: "COMPLETED",
      },
      include: {
        book: true,
      },
    });

    if (!purchase) {
      return new NextResponse("Purchase not found", { status: 404 });
    }

    // Check download count
    if (purchase.downloadCount >= 1) {
      return new NextResponse("Download limit exceeded", { status: 404 });
    }

    // Increment download count
    await prisma.purchase.update({
      where: { id: purchase.id },
      data: {
        downloadCount: {
          increment: 1,
        },
      },
    });

    // Fetch the image from Unsplash
    const imageUrl =
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=1000";
    const imageResponse = await fetch(imageUrl);
    const imageBlob = await imageResponse.blob();

    const headers = new Headers();
    headers.set("Content-Disposition", `attachment; filename="book-image.jpg"`);
    headers.set(
      "Content-Type",
      imageResponse.headers.get("Content-Type") || "image/jpeg"
    );

    return new NextResponse(imageBlob, {
      headers,
    });
  } catch (error) {
    console.error("Download error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
