import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifyToken, generateDownloadToken } from "@/lib/auth";
import { getCompletedPurchasesByEmail } from "@/lib/db";
import { sendPurchasesEmail } from "@/lib/email";

const schema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  try {
    const { email } = schema.parse(await request.json());
    const normalizedEmail = email.toLowerCase();

    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;
    const session = authToken ? await verifyToken(authToken) : null;

    if (!session?.email || session.email !== normalizedEmail) {
      return NextResponse.json(
        { error: "Email not verified. Complete OTP verification first." },
        { status: 401 }
      );
    }

    const purchases = await getCompletedPurchasesByEmail(normalizedEmail);

    if (purchases.length === 0) {
      return NextResponse.json(
        { error: "No purchases found for this email" },
        { status: 404 }
      );
    }

    const audiobooks = purchases.map(({ purchase, book }) => ({
      title: book.title,
      author: book.author,
      downloadUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/download/${book.id}?token=${generateDownloadToken(normalizedEmail, purchase.id)}`,
    }));

    await sendPurchasesEmail(normalizedEmail, audiobooks);

    return NextResponse.json({
      success: true,
      count: audiobooks.length,
      message: `Sent ${audiobooks.length} audiobook(s) to your email`,
    });
  } catch (error) {
    console.error("Error sending purchases:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Failed to send purchases" },
      { status: 500 }
    );
  }
}
