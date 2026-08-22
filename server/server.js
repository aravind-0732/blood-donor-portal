const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendLoginAlert = async (recipientEmail) => {
  const mailOptions = {
    from: `"Life Drop Portal" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: '🚨 Security Alert: Account Login Detected',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; max-width: 500px;">
        <h2 style="color: #c9182b; margin-top: 0;">Life Drop Portal</h2>
        <p>Hello,</p>
        <p>A new <strong>Sign-In</strong> was just completed on your account.</p>
        <p><strong>Timestamp:</strong> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
        <hr style="border: none; border-top: 1px solid #cbd5e1; margin: 15px 0;">
        <p style="color: #64748b; font-size: 12px; margin-bottom: 0;">If you did not perform this login, please secure your credentials immediately.</p>
      </div>
    `
  };

  return transporter.sendMail(mailOptions);
};

module.exports = { sendLoginAlert };1