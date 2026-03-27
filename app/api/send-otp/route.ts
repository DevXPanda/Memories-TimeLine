import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email, otp, type } = await req.json();

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    });

    const subject = type === "reset" ? "Reset your Memory PIN 🔑" : "Verify your Memory Account 💌";
    const title = type === "reset" ? "Reset PIN" : "Verification Code";

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #ec4899; text-align: center;">Our Memories</h2>
          <p>Hello,</p>
          <p>Your ${title} is:</p>
          <div style="background: #fff1f2; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; color: #881337; letter-spacing: 5px; border-radius: 8px;">
            ${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #a07080; text-align: center;">Made with ❤️ by Our Memories team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Email error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
