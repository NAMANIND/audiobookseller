import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { getCompletedPurchasesByEmail } from "@/lib/db";

export async function POST() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const purchases = await getCompletedPurchasesByEmail(session.email);
  if (purchases.length === 0) {
    return NextResponse.json({ error: "No purchases found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    message: `You have ${purchases.length} audiobook(s). Download them from My Purchases.`,
    redirectTo: "/purchases",
  });
}
