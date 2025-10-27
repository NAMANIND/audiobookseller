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
  bookTitle: string,
  driveLink: string
) => {
  try {
    const { data, error } = await resend.emails.send({
      from: "Audiobook Seller <onboarding@resend.dev>",
      to: email,
      subject: `Your Audiobook: ${bookTitle}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background: linear-gradient(to right, #10b981, #059669); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 300; letter-spacing: -0.5px;">Your Audiobook is Ready!</h1>
          </div>
          
          <div style="background-color: white; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <div style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 3px; border-radius: 12px; margin-bottom: 20px;">
                <div style="background-color: white; padding: 20px 30px; border-radius: 10px;">
                  <h2 style="margin: 0; color: #059669; font-size: 24px; font-weight: 500;">${bookTitle}</h2>
                </div>
              </div>
            </div>
            
            <p style="font-size: 16px; color: #4b5563; margin-bottom: 30px; text-align: center;">
              Thank you for your purchase!
            </p>
            
            <div style="text-align: center; margin: 35px 0;">
              <a href="${driveLink || downloadUrl}" 
                 style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); transition: all 0.3s;">
                Access Your Audiobook
              </a>
            </div>
            
            <div style="margin-top: 30px; padding-top: 25px; border-top: 2px solid #e5e7eb; text-align: center;">
              <p style="font-size: 13px; color: #9ca3af; margin: 0; line-height: 1.6;">
                Having trouble accessing your audiobook?<br>
                Make sure you're logged into Google with <strong>${email}</strong>
              </p>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p style="margin: 0;">© ${new Date().getFullYear()} Audiobook Seller. All rights reserved.</p>
          </div>
        </body>
        </html>
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

interface Audiobook {
  title: string;
  author: string;
  driveLink: string;
}

export const sendPurchasesEmail = async (
  email: string,
  audiobooks: Audiobook[]
) => {
  try {
    // Generate HTML for audiobook list
    const audiobookListHtml = audiobooks
      .map(
        (book) => `
        <div style="margin-bottom: 20px; padding: 20px; background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 10px; border-left: 4px solid #10b981; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
          <h3 style="margin: 0 0 8px 0; color: #047857; font-size: 20px; font-weight: 600;">${book.title}</h3>
          <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 15px;">by ${book.author}</p>
          <a href="${book.driveLink}" 
             style="display: inline-block; padding: 12px 28px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; text-decoration: none; border-radius: 50px; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
            Access your audiobook
          </a>
        </div>
      `
      )
      .join("");

    const { data, error } = await resend.emails.send({
      from: "Audiobook Seller <onboarding@resend.dev>",
      to: email,
      subject: `Your Audiobook Library (${audiobooks.length} ${audiobooks.length === 1 ? 'Book' : 'Books'})`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
          <div style="background: linear-gradient(to right, #10b981, #059669); padding: 40px 30px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 300; letter-spacing: -0.5px;">Your Audiobook Library</h1>
          </div>
          
          <div style="background-color: white; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="font-size: 16px; color: #4b5563; margin-bottom: 30px; text-align: center;">
              Welcome back! Here are all ${audiobooks.length} audiobook${audiobooks.length === 1 ? '' : 's'} you've purchased.
            </p>
            
            <h2 style="color: #059669; font-size: 22px; font-weight: 600; margin-bottom: 25px; text-align: center;">
              Your Collection (${audiobooks.length})
            </h2>
            
            ${audiobookListHtml}
            
          
          <div style="text-align: center; margin-top: 30px; padding: 20px; color: #9ca3af; font-size: 12px;">
            <p style="margin: 0;">© ${new Date().getFullYear()} Audiobook Seller. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error("Failed to send purchases email:", error);
      throw error;
    }

    console.log(`✓ Sent ${audiobooks.length} audiobook(s) to ${email}`);
    return data;
  } catch (error) {
    console.error("Error in sendPurchasesEmail:", error);
    throw error;
  }
};
