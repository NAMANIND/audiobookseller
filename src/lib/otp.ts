import crypto from "crypto";
import { db } from "@/lib/firebase-admin";
import { normalizeEmail } from "@/lib/users";

const OTP_EXPIRY_MINUTES = Number(process.env.OTP_EXPIRY_MINUTES ?? 10);
const OTP_MAX_ATTEMPTS = Number(process.env.OTP_MAX_ATTEMPTS ?? 5);
const RATE_WINDOW_MIN = Number(process.env.OTP_RATE_LIMIT_WINDOW_MINUTES ?? 15);
const RATE_MAX = Number(process.env.OTP_RATE_LIMIT_MAX_REQUESTS ?? 3);

function otpDocId(email: string) {
    return crypto.createHash("sha256").update(normalizeEmail(email)).digest("hex");
}

function hashOtp(email: string, otp: string) {
    const secret = process.env.JWT_SECRET ?? "otp-secret";
    return crypto.createHmac("sha256", secret).update(`${normalizeEmail(email)}:${otp}`).digest("hex");
}

function generateOtp(): string {
    return crypto.randomInt(100000, 999999).toString();
}

export async function createAndStoreOtp(email: string): Promise<string> {
    const normalized = normalizeEmail(email);
    const ref = db.collection("otp_requests").doc(otpDocId(normalized));
    const now = Date.now();
    const existing = await ref.get();

    if (existing.exists) {
        const data = existing.data()!;
        const windowStart = data.windowStartAt ? new Date(data.windowStartAt).getTime() : now;
        const withinWindow = now - windowStart < RATE_WINDOW_MIN * 60 * 1000;
        const sendCount = withinWindow ? (data.sendCount ?? 0) : 0;

        if (withinWindow && sendCount >= RATE_MAX) {
            throw new Error("RATE_LIMIT_EXCEEDED");
        }

        await ref.set({
            email: normalized,
            otpHash: hashOtp(normalized, generateOtp()), // placeholder, overwritten below
            expiresAt: new Date(now + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString(),
            attempts: 0,
            lastSentAt: new Date(now).toISOString(),
            sendCount: withinWindow ? sendCount + 1 : 1,
            windowStartAt: withinWindow
                ? data.windowStartAt
                : new Date(now).toISOString(),
        });
    }

    const otp = generateOtp();

    await ref.set({
        email: normalized,
        otpHash: hashOtp(normalized, otp),
        expiresAt: new Date(now + OTP_EXPIRY_MINUTES * 60 * 1000).toISOString(),
        attempts: 0,
        lastSentAt: new Date(now).toISOString(),
        sendCount: existing.exists
            ? ((existing.data()?.sendCount ?? 0) + 1)
            : 1,
        windowStartAt: existing.exists
            ? existing.data()?.windowStartAt ?? new Date(now).toISOString()
            : new Date(now).toISOString(),
    });

    return otp;
}

export async function verifyOtp(email: string, otp: string): Promise<boolean> {
    const normalized = normalizeEmail(email);
    const ref = db.collection("otp_requests").doc(otpDocId(normalized));
    const doc = await ref.get();

    if (!doc.exists) return false;

    const data = doc.data()!;
    const expiresAt = new Date(data.expiresAt).getTime();

    if (Date.now() > expiresAt) {
        await ref.delete();
        return false;
    }

    const attempts = (data.attempts ?? 0) + 1;

    if (attempts > OTP_MAX_ATTEMPTS) {
        await ref.delete();
        throw new Error("OTP_MAX_ATTEMPTS_EXCEEDED");
    }

    const valid = data.otpHash === hashOtp(normalized, otp);

    if (!valid) {
        await ref.update({ attempts });
        return false;
    }

    await ref.delete();
    return true;
}