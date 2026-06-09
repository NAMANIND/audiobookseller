import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOtpEmail = async (email: string, otp: string) => {
  const expiry = process.env.OTP_EXPIRY_MINUTES ?? "10";

  const { error } = await resend.emails.send({
    from: "Audiobook Seller <onboarding@resend.dev>",
    to: email,
    subject: "Your verification code",
    html: `
      <h1>Verify your email</h1>
      <p>Your one-time code is:</p>
      <h2 style="font-size: 32px; letter-spacing: 8px;">${otp}</h2>
      <p>This code expires in ${expiry} minutes. Do not share it with anyone.</p>
    `,
  });

  if (error) throw error;
};

export const sendDownloadLink = async (
  email: string,
  downloadUrl: string,
  bookTitle: string
) => {
  const expiry = process.env.SIGNED_URL_EXPIRY_MINUTES ?? "5";
  const maxDownloads = process.env.MAX_DOWNLOADS ?? "2";

  const { error } = await resend.emails.send({
    from: "Audiobook Seller <onboarding@resend.dev>",
    to: email,
    subject: `Your Audiobook: ${bookTitle}`,
    html: `
      <h1>Your Audiobook is Ready!</h1>
      <h2>${bookTitle}</h2>
      <p>Thank you for your purchase.</p>
      <a href="${downloadUrl}" style="display:inline-block;padding:12px 24px;background:#059669;color:white;text-decoration:none;border-radius:8px;">
        Download Audiobook
      </a>
      <p style="color:#666;font-size:13px;margin-top:20px;">
        Link allows up to ${maxDownloads} downloads. Each download link is valid for ${expiry} minutes.
      </p>
    `,
  });

  if (error) throw error;
};

interface AudiobookLink {
  title: string;
  author: string;
  downloadUrl: string;
}

export const sendPurchasesEmail = async (
  email: string,
  audiobooks: AudiobookLink[]
) => {
  const listHtml = audiobooks
    .map(
      (book) => `
      <div style="margin-bottom:16px;padding:16px;border:1px solid #e5e7eb;border-radius:8px;">
        <h3 style="margin:0 0 4px">${book.title}</h3>
        <p style="margin:0 0 12px;color:#666">by ${book.author}</p>
        <a href="${book.downloadUrl}">Download</a>
      </div>
    `
    )
    .join("");

  const { error } = await resend.emails.send({
    from: "Audiobook Seller <onboarding@resend.dev>",
    to: email,
    subject: `Your Audiobook Library (${audiobooks.length})`,
    html: `
      <h1>Your Audiobook Library</h1>
      <p>Here are your purchased audiobooks:</p>
      ${listHtml}
    `,
  });

  if (error) throw error;
};