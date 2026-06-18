import express from "express";
import path from "path";
import nodemailer from "nodemailer";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// API routing for secure, backend-initiated SMTP verification mails
app.post("/api/send-code", async (req, res) => {
  const { email, code, type } = req.body;

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

    console.log(`[SMTP Service] Attempting primary SMTP dispatch to ${email} (Type: ${type || 'auth'}) via ${user} on ${host}:${port}...`);

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
      <div style="font-family: sans-serif; max-width: 450px; margin: 0 auto; color: #333333; line-height: 1.6; font-size: 14px;">
        <p style="font-size: 16px; font-weight: bold; color: #10b981; margin-bottom: 20px;">Journaly Security</p>
        
        <p>Hello,</p>
        
        <p>
          ${isReset 
            ? "We received a request to reset your password. Use the following code to authorize this action:" 
            : "We received a request to access your account. Please use the following code to log in safely:"
          }
        </p>
        
        <div style="background-color: #f4f4f5; border-radius: 6px; padding: 15px; margin: 20px 0; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #111111;">
          ${code}
        </div>
        
        <p style="color: #666666; font-size: 12px; margin-top: 30px; border-top: 1px solid #eeeeee; padding-top: 15px;">
          This code is temporary and secure. If you did not make this request, you can safely ignore this message. Do not reply directly to this email.
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
    console.log(`[SMTP Service] Email dispatched successfully to ${email}`);
    return res.json({ success: true, isCustomSmtp: true });
  } catch (error: any) {
    console.error("[SMTP Service] Error sending email via primary SMTP, trying fallback:", error);
    
    // secondary backup route via FormSubmit to guarantee delivery if 587 port of some hosting providers is blocked
    try {
      console.log(`[SMTP Service] Routing fallback email to ${email} via FormSubmit...`);
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
        console.log(`[SMTP Service] Fallback email routed successfully. FormSubmit Response:`, resJson);
        return res.json({ success: true, isFormSubmit: true });
      } else {
        const errText = await response.text();
        console.error(`[SMTP Service] Fallback delivery failed:`, errText);
        throw new Error(errText);
      }
    } catch (err: any) {
      console.error("FormSubmit integration error:", err);
      return res.status(500).json({ success: false, error: `Connection failed: ${error.message}` });
    }
  }
});

// Configure Vite integration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
