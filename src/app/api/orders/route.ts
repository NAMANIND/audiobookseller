import { NextResponse } from "next/server";
import { z } from "zod";
import Razorpay from "razorpay";
import { getBookById, createPurchase, createEmailRecord } from "@/lib/db";
import { normalizeEmail } from "@/lib/users";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "",
  key_secret: process.env.RAZORPAY_SECRET_KEY || "",
});

const orderSchema = z.object({
  bookId: z.string(),
  email: z.string().email(),
  price: z.number(),
});

export async function POST(request: Request) {
  try {
    const { bookId, email, price } = orderSchema.parse(await request.json());
    const book = await getBookById(bookId);

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(price * 100),
      currency: "INR",
      receipt: `ord_${bookId.slice(0, 8)}_${Date.now().toString().slice(-6)}`,
      notes: { bookId, email: normalizeEmail(email) },
    });

    const purchase = await createPurchase({
      bookId,
      email: normalizeEmail(email),
      orderId: order.id,
      amount: price,
      currency: "INR",
      status: "PENDING",
    });

    await createEmailRecord({
      purchaseId: purchase.id,
      type: "PURCHASE_CONFIRMATION",
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Order creation error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}