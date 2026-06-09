import { bucket } from "@/lib/firebase-admin";

const SIGNED_URL_EXPIRY_MINUTES = Number(
  process.env.SIGNED_URL_EXPIRY_MINUTES ?? 5
);

export async function getDownloadUrl(
  storagePath: string,
  fallbackUrl?: string
): Promise<string> {
  if (!storagePath) {
    if (fallbackUrl) return fallbackUrl;
    throw new Error("Missing storage path");
  }

  try {
    const file = bucket.file(storagePath);
    const [exists] = await file.exists();

    if (!exists) {
      if (fallbackUrl) return fallbackUrl;
      throw new Error(`File not found: ${storagePath}`);
    }

    const [url] = await file.getSignedUrl({
      version: "v4",
      action: "read",
      expires: Date.now() + SIGNED_URL_EXPIRY_MINUTES * 60 * 1000,
    });

    return url;
  } catch (error) {
    if (fallbackUrl) {
      console.warn("Storage unavailable, using fallback URL:", error);
      return fallbackUrl;
    }
    throw error;
  }
}
