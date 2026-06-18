import nodemailer from "nodemailer";

export default async function handler(req: any, res: any) {
  // Support standard CORS headers to allow Vercel and local requests with no issues
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  // Handle OPTIONS preflight request
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, error: "Method not allowed. Use POST." });
  }

  const { email, code, type } = req.body || {};

  if (!email || !code) {
    return res.status(400).json({ success: false, error: "Email and code are required" });
  }

  const isReset = type === "reset";

  try {
    const host = process.env.SMTP_HOST || "smtp.gmail.com";
    const port = parseInt(process.env.SMTP_PORT || "587", 10);
    const user = process.env.SMTP_USER || "toolaoilqbi@gmail.com";
    const pass = process.env.SMTP_PASS || "zjzh milx advx ymom";
    
    // Crucial: to prevent SPF, DKIM, and spoofing flags, fromEmail MUST match the authenticated SMTP user!
    const fromEmail = user;
    const fromName = process.env.SMTP_FROM_NAME || "Journaly";

    console.log(`[SMTP Service Vercel] Attempting SMTP dispatch to ${email} (Type: ${type || 'auth'}) via ${user} on ${host}:${port}...`);

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    const subject = isReset 
      ? `Journaly Password Reset Code: ${code}` 
      : `Journaly login verification details: ${code}`;

    const textContent = isReset
      ? `Hello,

We received a request to reset your password on your Journaly account. 

Your verification code is: ${code}

Please enter this verification code back on the password reset screen to select a new secure passcode.

If you didn't request this reset, you can safely ignore this email.

Best regards,
Journaly Team`
      : `Hello,

You requested a secure login verification code to sign in or register with your Journaly account.

Your verification code is: ${code}

Please enter this verification code on the authentication screen to complete your sign-in.

If you didn't request this code, you can safely ignore this email.

Best regards,
Journaly Team`;

    const htmlContent = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 450px; margin: 0 auto; color: #333333; line-height: 1.6; font-size: 14px; border: 1px solid #e4e4e7; border-radius: 12px; padding: 24px; background-color: #ffffff;">
        <!-- Header with stylized J display picture -->
        <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
          <tr>
            <td style="vertical-align: middle; padding-right: 12px;">
              <div style="width: 40px; height: 40px; line-height: 40px; border-radius: 20px; background-color: #10b981; text-align: center; color: #ffffff; font-weight: 800; font-size: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                J
              </div>
            </td>
            <td style="vertical-align: middle;">
              <span style="font-size: 16px; font-weight: 800; color: #18181b; letter-spacing: -0.01em;">Journaly</span>
              <span style="display: block; font-size: 11px; color: #71717a; font-weight: 500; margin-top: 1px;">Security Team</span>
            </td>
          </tr>
        </table>
        
        <p style="margin-top: 0; color: #3f3f46;">Hello,</p>
        
        <p style="color: #3f3f46;">
          ${isReset 
            ? "We received a request to reset your password. Use the following code to authorize this action:" 
            : "We received a request to access your account. Please use the following code to log in safely:"
          }
        </p>
        
        <div style="background-color: #f4f4f5; border-radius: 8px; padding: 18px; margin: 24px 0; text-align: center; font-size: 26px; font-weight: 800; letter-spacing: 6px; color: #10b981; border: 1px solid #e4e4e7; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">
          ${code}
        </div>
        
        <p style="color: #71717a; font-size: 12px; margin-top: 32px; border-top: 1px solid #e4e4e7; padding-top: 16px; line-height: 1.5;">
          This temporary security code is valid for single use. If you did not make this request, you can safely ignore this message. Do not reply to this automated transmission.
        </p>
      </div>
    `;

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject,
      text: textContent,
      html: htmlContent,
      headers: {
        "X-Entity-Ref-ID": `${Date.now()}_ref`
      }
    };

    await transporter.sendMail(mailOptions);
    console.log(`[SMTP Service Vercel] Email dispatched successfully to ${email}`);
    return res.status(200).json({ success: true, isCustomSmtp: true });
  } catch (error: any) {
    console.error("[SMTP Service Vercel] Error sending email via primary SMTP, trying fallback:", error);
    
    // secondary backup route via FormSubmit to guarantee delivery if 587 port of some hosting providers is blocked
    try {
      console.log(`[SMTP Service Vercel] Routing fallback email to ${email} via FormSubmit...`);
      const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(email.toLowerCase().trim())}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({
          _subject: isReset ? `Journaly Password Reset Code` : `Journaly Verification Code`,
          "Code": code,
          "Type": type || "auth",
          "Message": isReset
            ? `We received a request to reset your password on Journaly. Your password reset verification code is: ${code}. Enter this code on the password reset screen to select a new secure login passcode.`
            : `We received a request to sign in or register on Journaly. Your verification code is: ${code}. Enter it on the authentication page to authorize access.`,
          _captcha: "false"
        })
      });

      if (response.ok) {
        const resJson = await response.json();
        console.log(`[SMTP Service Vercel] Fallback email routed successfully. FormSubmit Response:`, resJson);
        return res.status(200).json({ success: true, isFormSubmit: true });
      } else {
        const errText = await response.text();
        console.error(`[SMTP Service Vercel] Fallback delivery failed:`, errText);
        throw new Error(errText);
      }
    } catch (err: any) {
      console.error("FormSubmit integration error:", err);
      return res.status(500).json({ success: false, error: `Connection failed: ${error.message}` });
    }
  }
}
