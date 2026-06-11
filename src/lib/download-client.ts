export async function downloadPurchaseFile(purchaseId: string, filename: string) {
  const response = await fetch(`/api/purchases/${purchaseId}/download`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    let message = "Download failed";
    try {
      const data = await response.json();
      message = data.error ?? message;
    } catch {
      message = (await response.text()) || message;
    }
    throw new Error(message);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = `${filename.replace(/[^\w\s-]/g, "").trim() || "audiobook"}.mp3`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(objectUrl);
}
