// Optional email alert for new requests. Works only when SMTP_* and NOTIFY_EMAIL are set;
// otherwise requests are still saved to the dashboard and this just logs.
const nodemailer = require('nodemailer');

let transport = null;
if (process.env.SMTP_HOST && process.env.NOTIFY_EMAIL) {
  transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
}

async function notify(r) {
  const label = r.kind === 'cart' ? 'Cart / event request' : 'New message';
  if (!transport) {
    console.log(`[zephyr] ${label} from ${r.name} (email alerts off — set SMTP_HOST + NOTIFY_EMAIL)`);
    return;
  }
  const lines = [
    `Name: ${r.name}`,
    r.email && `Email: ${r.email}`,
    r.phone && `Phone: ${r.phone}`,
    r.event_date && `Date: ${r.event_date}`,
    r.guests && `Guests: ${r.guests}`,
    r.location && `Where: ${r.location}`,
    r.message && `\n${r.message}`,
  ].filter(Boolean);
  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.NOTIFY_EMAIL,
      replyTo: r.email || undefined,
      subject: `🍧 Zephyr Ice — ${label} from ${r.name}`,
      text: lines.join('\n') + '\n\nSee all requests: /admin',
    });
  } catch (err) {
    console.error('[zephyr] email alert failed:', err.message);
  }
}

module.exports = { notify };
