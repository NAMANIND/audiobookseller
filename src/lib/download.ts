import { getPurchaseByIdAndEmail } from "@/lib/db";
import { getDownloadUrl } from "@/lib/storage";

function safeFilename(title: string) {
  const base = title.replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");
  return base || "audiobook";
}

export async function streamPurchaseDownload(purchaseId: string, email: string) {
  const purchase = await getPurchaseByIdAndEmail(purchaseId, email);
  if (!purchase) {
    return new Response("Purchase not found", { status: 404 });
  }

  const signedUrl = await getDownloadUrl(
    purchase.book.storagePath,
    purchase.book.fallbackUrl,
  );

  const upstream = await fetch(signedUrl);
  if (!upstream.ok || !upstream.body) {
    return new Response("File unavailable", { status: 502 });
  }

  const filename = `${safeFilename(purchase.book.title)}.mp3`;
  const contentType =
    upstream.headers.get("Content-Type") ?? "application/octet-stream";

  return new Response(upstream.body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      ...(upstream.headers.get("Content-Length")
        ? { "Content-Length": upstream.headers.get("Content-Length")! }
        : {}),
    },
  });
}
