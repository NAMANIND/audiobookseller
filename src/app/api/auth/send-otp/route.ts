import { NextResponse } from "next/server";
import { z } from "zod";
import { createAndStoreOtp } from "@/lib/otp";
import { sendOtpEmail } from "@/lib/email";

const schema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
    try {
        const { email } = schema.parse(await request.json());
        const otp = await createAndStoreOtp(email);
        await sendOtpEmail(email, otp);
        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        if (error instanceof Error && error.message === "RATE_LIMIT_EXCEEDED") {
            return NextResponse.json(
                { error: "Too many OTP requests. Try again later." },
                { status: 429 }
            );
        }
        console.error("send-otp error:", error);
        return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
    }
}