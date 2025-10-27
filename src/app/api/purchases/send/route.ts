import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { addUserAccessToFile, extractFileIdFromDriveUrl } from "@/lib/drive";

const emailSchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = emailSchema.parse(body);

    // Fetch all completed purchases for this email
    const purchases = await prisma.purchase.findMany({
      where: {
        email,
        status: "COMPLETED",
      },
      include: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            driveLink: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (purchases.length === 0) {
      return NextResponse.json(
        { error: "No purchases found for this email" },
        { status: 404 }
      );
    }

    // Grant access to all purchased audiobooks
    const audiobooksWithAccess = [];
    
    for (const purchase of purchases) {
      try {
        if (purchase.book.driveLink) {
          const fileId = extractFileIdFromDriveUrl(purchase.book.driveLink);
          if (fileId) {
            // Grant access (will not fail if already has access)
            await addUserAccessToFile(fileId, email);
            
            audiobooksWithAccess.push({
              title: purchase.book.title,
              author: purchase.book.author,
              driveLink: purchase.book.driveLink,
            });
          }
        }
      } catch (error) {
        console.error(`Failed to grant access for book ${purchase.book.title}:`, error);
        // Continue with other books even if one fails
      }
    }

    // Send email with all purchased audiobooks
    const { sendPurchasesEmail } = await import("@/lib/email");
    await sendPurchasesEmail(email, audiobooksWithAccess);

    return NextResponse.json({ 
      success: true, 
      count: audiobooksWithAccess.length,
      message: `Sent ${audiobooksWithAccess.length} audiobook(s) to your email`
    });
  } catch (error) {
    console.error("Error sending purchases:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to send purchases" },
      { status: 500 }
    );
  }
}

