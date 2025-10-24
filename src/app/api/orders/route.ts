import { NextResponse } from "next/server";
import { z } from "zod";
import Razorpay from "razorpay";
import { prisma } from "@/lib/prisma";

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
    const body = await request.json();
    const { bookId, email, price } = orderSchema.parse(body);

    // Get book details
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    // Create a Razorpay order
    const order = await razorpay.orders.create({
      amount: Math.round(price * 100), // Convert to smallest currency unit (paise)
      currency: "INR",
      receipt: `ord_${bookId.slice(0, 8)}_${Date.now().toString().slice(-6)}`,
      notes: {
        bookId,
        email,
      },
    });

    // Create purchase record
    const purchase = await prisma.purchase.create({
      data: {
        bookId,
        email,
        orderId: order.id,
        amount: price,
        currency: "INR",
        status: "PENDING",
      },
    });

    // Create email record
    await prisma.email.create({
      data: {
        purchaseId: purchase.id,
        type: "PURCHASE_CONFIRMATION",
        status: "PENDING",
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Order creation error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
