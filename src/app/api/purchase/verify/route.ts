import { NextResponse } from "next/server";
import crypto from "crypto";

const RAZORPAY_SECRET = process.env.RAZORPAY_SECRET_KEY || "";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, paymentId, signature } = body;

    // Verify the payment signature
    const text = `${orderId}|${paymentId}`;
    const generatedSignature = crypto
      .createHmac("sha256", RAZORPAY_SECRET)
      .update(text)
      .digest("hex");

    if (generatedSignature !== signature) {
      return NextResponse.json(
        { error: "Invalid payment signature" },
        { status: 400 }
      );
    }

    // Payment is verified, you can now:
    // 1. Update the order status in your database
    // 2. Send the download link to the customer
    // 3. etc.

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
