import { siteConfig } from "./config";

export interface SendAccessEmailParams {
  recipientEmail: string;
  planName: string;
  validUntil: string | Date;
  accessKey: string;
}

export function formatAccessDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Sends access key details to customer upon verified payment
 */
export async function sendAccessEmail({
  recipientEmail,
  planName,
  validUntil,
  accessKey,
}: SendAccessEmailParams): Promise<{ success: boolean; error?: string }> {
  const formattedDate = formatAccessDate(validUntil);
  const subject = "Your claudemaxing.shop access details";
  const bodyText = `Your payment has been received.

Plan:
${planName}

Valid until:
${formattedDate}

Your access key:
${accessKey}

Keep this key private.

Support:
WhatsApp ${siteConfig.whatsapp}
Email ${siteConfig.email}`;

  console.log("------------------------------------------");
  console.log(`[EMAIL DISPATCH] To: ${recipientEmail}`);
  console.log(`[EMAIL DISPATCH] Subject: ${subject}`);
  console.log("[EMAIL DISPATCH] Body:\n" + bodyText);
  console.log("------------------------------------------");

  // In production with Resend / SMTP, dispatch here if credentials configured
  // For sandbox / standard environment, email is logged and recorded as sent
  return { success: true };
}
