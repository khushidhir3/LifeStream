const nodemailer = require('nodemailer');
const config = require('../config');

let transporter = null;
if (config.smtp.host) {
  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: config.smtp.user ? { user: config.smtp.user, pass: config.smtp.pass } : undefined,
  });
}

const isConfigured = () => Boolean(transporter);

// Sends an email. Without SMTP settings the message is printed to the server log instead,
// so the app keeps working in development.
async function sendMail({ to, subject, text, html }) {
  if (!transporter) {
    console.log(`\n[mail:not-configured] To: ${to}\nSubject: ${subject}\n${text}\n`);
    return { delivered: false };
  }
  try {
    await transporter.sendMail({ from: config.smtp.from, to, subject, text, html: html || undefined });
    return { delivered: true };
  } catch (err) {
    console.error('[mail] failed to send:', err.message);
    return { delivered: false, error: err.message };
  }
}

module.exports = { sendMail, isConfigured };
