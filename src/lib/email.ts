import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  console.error("RESEND_API_KEY is not set in environment variables");
}

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendMagicLink = async (email: string, token: string) => {
  try {
    const magicLink = `${process.env.NEXT_PUBLIC_BASE_URL}/api/verify?token=${token}`;

    const { data, error } = await resend.emails.send({
      from: "Audiobook Seller <onboarding@resend.dev>",
      to: email,
      subject: "Access Your Audiobook Purchases",
      html: `
        <h1>Access Your Audiobook Purchases</h1>
        <p>Click the link below to access your audiobook purchases:</p>
        <a href="${magicLink}">Access My Purchases</a>
        <p>This link will expire in 24 hours.</p>
      `,
    });

    if (error) {
      console.error("Failed to send magic link email:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in sendMagicLink:", error);
    throw error;
  }
};

export const sendDownloadLink = async (
  email: string,
  downloadUrl: string,
  bookTitle: string
) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Audiobook Seller <onboarding@resend.dev>",
      to: email,
      subject: `Your Audiobook Download: ${bookTitle}`,
      html: `
        <h1>Your Audiobook is Ready!</h1>
        <p>Thank you for purchasing "${bookTitle}". Click the link below to download your audiobook:</p>
        <a href="${downloadUrl}">Download Audiobook</a>
        <p>This download link will expire in 24 hours.</p>
      `,
    });

    if (error) {
      console.error("Failed to send download link email:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in sendDownloadLink:", error);
    throw error;
  }
};
