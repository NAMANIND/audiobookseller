import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { updatePurchaseByOrderId } from "@/lib/db";
import { normalizeEmail } from "@/lib/users";

const RAZORPAY_SECRET = process.env.RAZORPAY_SECRET_KEY || "";

const verifySchema = z.object({
  orderId: z.string(),
  paymentId: z.string(),
  signature: z.string(),
  bookId: z.string(),
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const body = verifySchema.parse(await request.json());
    const { orderId, paymentId, signature, email } = body;

    const text = `${orderId}|${paymentId}`;
    const generatedSignature = crypto
      .createHmac("sha256", RAZORPAY_SECRET)
      .update(text)
      .digest("hex");

    if (generatedSignature !== signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const purchase = await updatePurchaseByOrderId(orderId, {
      status: "COMPLETED",
      paymentId,
    });

    return NextResponse.json({
      success: true,
      purchaseId: purchase.id,
      bookId: purchase.bookId,
      email: normalizeEmail(email),
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}
