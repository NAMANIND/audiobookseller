import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getCompletedPurchasesByEmail } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Not signed in" }, { status: 401 });
    }

    const rows = await getCompletedPurchasesByEmail(session.email);

    const purchases = rows.map(({ purchase, book }) => ({
      id: purchase.id,
      bookId: book.id,
      title: book.title,
      author: book.author,
      coverImage: book.coverImage,
      amount: purchase.amount,
      currency: purchase.currency,
      purchasedAt: purchase.createdAt,
    }));

    return NextResponse.json({ purchases, user: session });
  } catch (error) {
    console.error("GET /api/purchases error:", error);
    return NextResponse.json({ error: "Failed to load purchases" }, { status: 500 });
  }
}
