import nodemailer from "nodemailer";
import pug from "pug";
import { htmlToText } from "html-to-text";
import path from "path";

// Interface for user object passed to Email class
interface UserForEmail {
  email: string;
  firstName: string;
  lastName?: string;
}

type TemplateType = "welcome" | "passwordReset" | "emailVerification";

export default class Email {
  to: string;
  firstName: string;
  otp: string | undefined;
  from: string;

  constructor(user: UserForEmail, otp: string) {
    this.to = user.email;
    this.firstName = user.firstName;
    this.otp = otp;
    this.from = `Green Shield <${process.env.EMAIL_FROM || "no-reply@greenshield.app"}>`;
  }

  private newTransport() {
    // Use Mailtrap or any SMTP in development
    // In production, you can switch based on NODE_ENV
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      // Optional: for better deliverability in production
      tls: {
        rejectUnauthorized: false,
      },
    });
  }

  // Send the actual email
  private async send(template: TemplateType, subject: string) {
    const templatePath = path.join(__dirname, "..", "views", "email", `${template}.pug`);

    // 1. Render HTML from Pug template
    const html = pug.renderFile(templatePath, {
      firstName: this.firstName,
      otp: this.otp,
      subject,
    });

    // 2. Email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      bcc: [process.env.BCC_EMAIL_1, process.env.BCC_EMAIL_2].filter(Boolean).join(", "),
      subject,
      html,
      text: htmlToText(html, { wordwrap: 130 }),
    };

    // 3. Send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to Green Shield Family!");
  }

  async sendPasswordReset() {
    await this.send("passwordReset", "Your Password Reset Code (Valid for 10 minutes)");
  }

  async sendEmailVerification() {
    await this.send(
      "emailVerification",
      "Verify Your Email (Code expires in 10 minutes)"
    );
  }
}