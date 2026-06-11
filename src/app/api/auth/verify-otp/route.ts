import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyOtp } from "@/lib/otp";
import { setAuthCookie } from "@/lib/auth";
import { upsertUserFromLogin, userToSession } from "@/lib/users";

const schema = z.object({
    email: z.string().email(),
    otp: z.string().length(6),
});

export async function POST(request: Request) {
    try {
        const { email, otp } = schema.parse(await request.json());

        const valid = await verifyOtp(email, otp);
        if (!valid) {
            return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 });
        }

        const user = await upsertUserFromLogin({
            email,
            provider: "email",
        });

        const session = userToSession(user, "email");
        const response = NextResponse.json({ success: true, user: session });
        setAuthCookie(response, session);

        return response;
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        if (error instanceof Error && error.message === "OTP_MAX_ATTEMPTS_EXCEEDED") {
            return NextResponse.json(
                { error: "Too many failed attempts. Request a new code." },
                { status: 429 }
            );
        }
        return NextResponse.json({ error: "Verification failed" }, { status: 500 });
    }
}
