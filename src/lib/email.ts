/**
 * Email dispatching service for Dooz authentication and notifications.
 * Supports:
 *  1. Resend API (via RESEND_API_KEY)
 *  2. Brevo API (via BREVO_API_KEY)
 *  3. Console logging fallback (when no API key is provided)
 */

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendEmailResult {
  success: boolean;
  provider: "resend" | "brevo" | "console";
  messageId?: string;
  error?: string;
}

/**
 * Renders an RTL Persian email template for Dooz OTP verification.
 */
export function renderOtpEmailHtml(code: string): string {
  return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8">
  <title>کد ورود به سامانه دوز</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      margin: 0;
      padding: 30px 15px;
      direction: rtl;
      text-align: right;
    }
    .container {
      max-width: 520px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 20px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 12px rgba(0,0,0,0.03);
      padding: 36px 30px;
    }
    .header {
      text-align: center;
      margin-bottom: 28px;
    }
    .brand-badge {
      display: inline-block;
      background: linear-gradient(135deg, #0d9488 0%, #10b981 100%);
      color: #ffffff;
      width: 48px;
      height: 48px;
      line-height: 48px;
      border-radius: 14px;
      font-size: 24px;
      font-weight: 900;
      margin-bottom: 12px;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 900;
      color: #0f172a;
      margin: 0;
    }
    .brand-subtitle {
      font-size: 12px;
      color: #64748b;
      margin-top: 4px;
    }
    .code-box {
      background: #f0fdfa;
      border: 2px dashed #0d9488;
      border-radius: 16px;
      padding: 20px;
      text-align: center;
      margin: 28px 0;
    }
    .code-digits {
      font-family: 'Courier New', Courier, monospace;
      font-size: 36px;
      font-weight: 900;
      letter-spacing: 10px;
      color: #0f766e;
      margin: 0;
    }
    .info-text {
      font-size: 14px;
      line-height: 1.7;
      color: #334155;
      margin: 12px 0;
    }
    .warning-box {
      font-size: 12px;
      color: #64748b;
      background-color: #f1f5f9;
      border-radius: 12px;
      padding: 12px 16px;
      margin-top: 24px;
      line-height: 1.6;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #f1f5f9;
      font-size: 11px;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand-badge">✂</div>
      <h1 class="brand-title">دوز (Dooz)</h1>
      <p class="brand-subtitle">استودیو الگوسازی پارامتریک و مارکت‌پلیس تخصصی الگو</p>
    </div>

    <p class="info-text">سلام،</p>
    <p class="info-text">کد تایید یکبار مصرف شما برای ورود به حساب کاربری در سامانه دوز آماده است:</p>

    <div class="code-box">
      <p class="code-digits">${code}</p>
    </div>

    <p class="info-text" style="font-weight: bold; color: #0d9488;">
      ⏳ این کد به مدت ۳ دقیقه معتبر است.
    </p>

    <div class="warning-box">
      ⚠️ این کد محرمانه است؛ آن را در اختیار افراد دیگر قرار ندهید. اگر شما این درخواست را نداده‌اید، نیازی به انجام کاری نیست و این ایمیل را نادیده بگیرید.
    </div>

    <div class="footer">
      © ۲۰۲۶ دوز (Dooz) • تمامی حقوق محفوظ است.
    </div>
  </div>
</body>
</html>`;
}

/**
 * Sends an email using configured cloud provider (Resend or Brevo)
 * or falls back to server console in development.
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
}: SendEmailOptions): Promise<SendEmailResult> {
  const fromEmail = process.env.EMAIL_FROM || "Dooz <onboarding@resend.dev>";

  // 1. Resend API
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [to],
          subject,
          html,
          text: text || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Resend API error:", data);
        return {
          success: false,
          provider: "resend",
          error: data.message || "خطا در ارسال ایمیل از طریق Resend",
        };
      }

      return {
        success: true,
        provider: "resend",
        messageId: data.id,
      };
    } catch (err: any) {
      console.error("Failed to connect to Resend API:", err);
      return {
        success: false,
        provider: "resend",
        error: err.message,
      };
    }
  }

  // 2. Brevo (Sendinblue) API
  if (process.env.BREVO_API_KEY) {
    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
          "api-key": process.env.BREVO_API_KEY,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          sender: { name: "دوز", email: process.env.BREVO_SENDER || "noreply@dooz.ir" },
          to: [{ email: to }],
          subject,
          htmlContent: html,
          textContent: text || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        console.error("Brevo API error:", data);
        return {
          success: false,
          provider: "brevo",
          error: data.message || "خطا در ارسال ایمیل از طریق Brevo",
        };
      }

      return {
        success: true,
        provider: "brevo",
        messageId: data.messageId,
      };
    } catch (err: any) {
      console.error("Failed to connect to Brevo API:", err);
      return {
        success: false,
        provider: "brevo",
        error: err.message,
      };
    }
  }

  // 3. Fallback: Log to Server Console
  console.log("\n========================================================");
  console.log("📨 [DOOZ EMAIL OTP SERVICE - CONSOLE FALLBACK]");
  console.log(`➡️  To: ${to}`);
  console.log(`📝 Subject: ${subject}`);
  console.log("⚠️  Note: RESEND_API_KEY or BREVO_API_KEY is not configured in .env.");
  console.log("========================================================\n");

  return {
    success: true,
    provider: "console",
  };
}

/**
 * High-level helper to send the OTP email.
 */
export async function sendOtpEmail(
  email: string,
  code: string
): Promise<SendEmailResult> {
  const subject = `کد تایید ورود به دوز: ${code}`;
  const html = renderOtpEmailHtml(code);
  const text = `کد ورود شما به سامانه دوز: ${code}\nاین کد تا ۳ دقیقه معتبر است.`;

  return sendEmail({
    to: email,
    subject,
    html,
    text,
  });
}
