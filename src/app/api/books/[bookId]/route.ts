import { NextResponse } from "next/server";
import { getBookById } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ bookId: string }> }
) {
  try {
    const { bookId } = await params;
    const book = await getBookById(bookId);

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const { storagePath: _, fallbackUrl: __, ...publicBook } = book;
    return NextResponse.json(publicBook);
  } catch (error) {
    console.error("Error fetching book:", error);
    return NextResponse.json({ error: "Failed to fetch book details" }, { status: 500 });
  }
}