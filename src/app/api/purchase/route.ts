import { NextResponse } from "next/server";
import { z } from "zod";
import { generateDownloadToken } from "@/lib/auth";
import { sendDownloadLink } from "@/lib/email";

// In a real app, this would be in a database
const purchases = new Map<string, { email: string; bookTitle: string }>();

const purchaseSchema = z.object({
  email: z.string().email(),
  bookId: z.string(),
  bookTitle: z.string(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, bookId, bookTitle } = purchaseSchema.parse(body);

    // Store purchase (in a real app, this would be in a database)
    purchases.set(bookId, { email, bookTitle });

    // Generate download token
    const token = generateDownloadToken(email, bookId);

    // Create download URL
    const downloadUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/download/${bookId}?token=${token}`;

    // Send download link via email
    await sendDownloadLink(email, downloadUrl, bookTitle);

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
