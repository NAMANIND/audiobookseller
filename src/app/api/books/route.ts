import { NextResponse } from "next/server";
import { getBooks } from "@/lib/db";

export async function GET() {
  try {
    const books = await getBooks();
    return NextResponse.json(
      books.map(({ storagePath: _, fallbackUrl: __, ...book }) => book)
    );
  } catch (error) {
    console.error("Error fetching books:", error);
    return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 });
  }
}