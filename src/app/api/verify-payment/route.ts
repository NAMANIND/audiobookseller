import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { generateDownloadToken } from "@/lib/auth";
import { sendDownloadLink } from "@/lib/email";
import { prisma } from "@/lib/prisma";

const RAZORPAY_SECRET = process.env.RAZORPAY_SECRET_KEY || "";

// In a real app, this would be in a database
const purchases = new Map<string, { email: string; bookTitle: string }>();

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
    const body = await request.json();
    const { orderId, paymentId, signature, bookId, bookTitle, email } =
      verifySchema.parse(body);

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

    // Update purchase status
    const purchase = await prisma.purchase.update({
      where: { orderId },
      data: {
        status: "COMPLETED",
        paymentId,
      },
      include: {
        book: true,
      },
    });

    // Generate download token
    const token = generateDownloadToken(email, purchase.id);

    // Create download URL
    const downloadUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/download/${bookId}?token=${token}`;

    // Create email record
    const emailRecord = await prisma.email.create({
      data: {
        purchaseId: purchase.id,
        type: "DOWNLOAD_LINK",
        status: "PENDING",
      },
    });

    // Send download link via email
    try {
      await sendDownloadLink(email, downloadUrl, bookTitle);

      // Update email status
      await prisma.email.update({
        where: { id: emailRecord.id },
        data: {
          status: "SENT",
          sentAt: new Date(),
        },
      });
    } catch (error) {
      console.error("Failed to send download link email:", error);

      // Update email status
      await prisma.email.update({
        where: { id: emailRecord.id },
        data: {
          status: "FAILED",
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Payment verification error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
