import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { generateDownloadToken } from "@/lib/auth";
import { sendDownloadLink } from "@/lib/email";
import { updatePurchaseByOrderId, createEmailRecord, updateEmailRecord } from "@/lib/db";

const RAZORPAY_SECRET = process.env.RAZORPAY_SECRET_KEY || "";

const verifySchema = z.object({
  orderId: z.string(),
  paymentId: z.string(),
  signature: z.string(),
  bookId: z.string(),
  bookTitle: z.string(),
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const body = verifySchema.parse(await request.json());
    const { orderId, paymentId, signature, bookId, bookTitle, email } = body;

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

    const token = generateDownloadToken(email.toLowerCase(), purchase.id);
    const downloadUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/download/${bookId}?token=${token}`;

    const emailRecord = await createEmailRecord({
      purchaseId: purchase.id,
      type: "DOWNLOAD_LINK",
    });

    try {
      await sendDownloadLink(email, downloadUrl, bookTitle);
      await updateEmailRecord(emailRecord.id, {
        status: "SENT",
        sentAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Failed to send download email:", err);
      await updateEmailRecord(emailRecord.id, { status: "FAILED" });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payment verification error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}