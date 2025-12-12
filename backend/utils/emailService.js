import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  // secure: true, // Use default security settings for Gmail service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
  logger: true,
  debug: true,
  connectionTimeout: 5000, // 5 seconds timeout
});

export const sendVerificationEmail = async (to, token) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: "Verify your email address - OTP Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color: #8b5cf6; margin-bottom: 20px;">Welcome to Social Media Dashboard!</h2>
          
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
            Thank you for registering! Please use the following OTP code to verify your email address:
          </p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
            <p style="font-size: 14px; color: #666; margin-bottom: 10px;">Your Verification Code:</p>
            <h1 style="font-size: 42px; color: #8b5cf6; letter-spacing: 8px; margin: 10px 0; font-family: 'Courier New', monospace;">
              ${token}
            </h1>
          </div>
          
          <p style="font-size: 14px; color: #666; margin-top: 20px;">
            <strong>⏰ This code will expire in 24 hours.</strong>
          </p>
          
          <p style="font-size: 14px; color: #666; margin-top: 10px;">
            If you didn't create an account, please ignore this email.
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="font-size: 12px; color: #999; text-align: center;">
            Social Media Dashboard - Your Social Connection Platform
          </p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Error sending verification email:", error);
    // Don't throw error to prevent blocking registration, just log it
  }
};
