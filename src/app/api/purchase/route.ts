import { NextResponse } from "next/server";
import { z } from "zod";
import { generateDownloadToken } from "@/lib/auth";
import { sendDownloadLink } from "@/lib/email";
import { addUserAccessToFile } from "@/lib/drive";
import { prisma } from "@/lib/prisma";
import { extractFileIdFromDriveUrl } from "@/lib/drive";

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

    // get the drive link of the book using the bookId
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }
    const driveLink = book.driveLink;
    if (!driveLink) {
      return NextResponse.json({ error: "Drive link not found" }, { status: 404 });
    }
    const fileId = extractFileIdFromDriveUrl(driveLink);
    if (!fileId) {
      return NextResponse.json({ error: "Invalid drive link" }, { status: 400 });
    }
    await addUserAccessToFile(fileId, email);

    // send email to the user with the download link
    await sendDownloadLink(email, downloadUrl, bookTitle, driveLink);

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

