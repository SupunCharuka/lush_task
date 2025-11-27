import nodemailer from 'nodemailer';

const host = process.env.SMTP_HOST;
const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.FROM_EMAIL || (user || 'no-reply@example.com');

if (!host || !port || !user || !pass) {
  console.warn('SMTP not fully configured. Falling back to Ethereal (dev-only) for email previews. To send real emails set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS in environment.');
}

// Create transporter only when SMTP is configured. We'll lazily create an Ethereal transporter when needed.
let transporter = null
if (host && port && user && pass) {
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: {
      user,
      pass,
    },
  })
}

export async function sendMail(mailParams = {}) {
  const { to, subject, text, html, attachments } = mailParams || {}

  if (!to) throw new Error('Missing "to" address for sendMail')

  // Ensure we have a transporter. If real SMTP isn't configured, create an Ethereal test account (dev-only)
  let usedTransporter = transporter
  let etherealAccount = null
  if (!usedTransporter) {
    // create a test account and transporter
    etherealAccount = await nodemailer.createTestAccount()
    usedTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: etherealAccount.user,
        pass: etherealAccount.pass,
      },
    })
  }

  const mailOptions = {
    from,
    to,
    subject,
    text,
    html,
    attachments,
  }

  const info = await usedTransporter.sendMail(mailOptions)

  // If we used Ethereal, attach the preview URL so callers can inspect the email
  if (etherealAccount) {
    const preview = nodemailer.getTestMessageUrl(info)
    return { info, preview }
  }

  return info
}
