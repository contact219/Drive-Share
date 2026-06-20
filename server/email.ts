import * as nodemailer from "nodemailer";
import * as fs from "node:fs";
import * as path from "node:path";

const CONFIG_PATH = path.join(process.cwd(), "platform-config.json");

function getSmtpConfig() {
  try {
    const cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
    if (cfg.smtpHost && cfg.smtpUser && cfg.smtpPass) return cfg;
  } catch {}
  return null;
}

async function send(to: string, subject: string, html: string) {
  const cfg = getSmtpConfig();
  if (!cfg) {
    console.log(`[EMAIL STUB] To: ${to} | Subject: ${subject}`);
    return;
  }
  const transporter = nodemailer.createTransport({
    host: cfg.smtpHost,
    port: cfg.smtpPort || 587,
    secure: (cfg.smtpPort || 587) === 465,
    auth: { user: cfg.smtpUser, pass: cfg.smtpPass },
  });
  await transporter.sendMail({
    from: cfg.smtpFrom || cfg.smtpUser,
    to,
    subject,
    html,
  });
}

function bookingCard(fields: { label: string; value: string }[]) {
  return fields.map((f) => `<tr><td style="padding:6px 12px;color:#94a3b8;font-size:13px;">${f.label}</td><td style="padding:6px 12px;font-size:13px;font-weight:600;">${f.value}</td></tr>`).join("");
}

function fmt(iso: string) {
  return new Date(iso).toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function wrap(title: string, body: string) {
  return `<!DOCTYPE html><html><body style="margin:0;background:#07090f;font-family:'Outfit',sans-serif;color:#f8fafc;">
<div style="max-width:540px;margin:32px auto;background:#0d1117;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.1);">
<div style="background:linear-gradient(135deg,#22d3ee,#fbbf24);padding:24px;text-align:center;">
<div style="font-size:22px;font-weight:900;color:#07090f;letter-spacing:-0.5px;">Rush</div>
</div>
<div style="padding:28px 32px;">
<h2 style="margin:0 0 16px;font-size:18px;font-weight:800;">${title}</h2>
${body}
</div>
<div style="padding:16px 32px;border-top:1px solid rgba(255,255,255,0.07);font-size:12px;color:#475569;text-align:center;">
© ${new Date().getFullYear()} Rush Car Sharing · <a href="https://rush-enterprise.com" style="color:#22d3ee;">rush-enterprise.com</a>
</div>
</div></body></html>`;
}

export async function sendBookingConfirmationEmail(
  to: string, name: string, vehicleName: string,
  startDate: string, endDate: string, totalCost: number
) {
  await send(to, `Booking confirmed — ${vehicleName}`, wrap(
    "Your booking is confirmed!",
    `<p style="color:#94a3b8;margin:0 0 16px;">Hi ${name}, your reservation has been confirmed.</p>
<table style="width:100%;border-collapse:collapse;background:rgba(255,255,255,0.03);border-radius:12px;overflow:hidden;margin-bottom:16px;">
${bookingCard([
  { label: "Vehicle", value: vehicleName },
  { label: "Pick-up", value: fmt(startDate) },
  { label: "Return",  value: fmt(endDate) },
  { label: "Total",   value: `$${totalCost.toFixed(2)}` },
])}</table>
<p style="color:#94a3b8;font-size:13px;margin:0;">Questions? Reply to this email or visit your <a href="https://rush-enterprise.com/trips" style="color:#22d3ee;">trips dashboard</a>.</p>`
  ));
}

export async function sendNewBookingNotificationToOwner(
  to: string, ownerName: string, vehicleName: string,
  renterName: string, startDate: string, endDate: string, totalCost: number
) {
  await send(to, `New booking — ${vehicleName}`, wrap(
    "You have a new booking!",
    `<p style="color:#94a3b8;margin:0 0 16px;">Hi ${ownerName}, ${renterName} just booked your ${vehicleName}.</p>
<table style="width:100%;border-collapse:collapse;background:rgba(255,255,255,0.03);border-radius:12px;overflow:hidden;margin-bottom:16px;">
${bookingCard([
  { label: "Renter",  value: renterName },
  { label: "Pick-up", value: fmt(startDate) },
  { label: "Return",  value: fmt(endDate) },
  { label: "Payout",  value: `$${(totalCost * 0.88).toFixed(2)}` },
])}</table>
<p style="color:#94a3b8;font-size:13px;">Manage bookings in your <a href="https://rush-enterprise.com/host/dashboard" style="color:#22d3ee;">host dashboard</a>.</p>`
  ));
}

export async function sendVehicleVerificationApprovedEmail(
  to: string, ownerName: string, vehicleName: string
) {
  await send(to, `Vehicle approved — ${vehicleName}`, wrap(
    "Your vehicle is live!",
    `<p style="color:#94a3b8;margin:0 0 16px;">Hi ${ownerName}, <strong style="color:#f8fafc;">${vehicleName}</strong> has been approved and is now live on Rush.</p>
<p style="color:#94a3b8;font-size:13px;">View your listing in your <a href="https://rush-enterprise.com/host/dashboard" style="color:#22d3ee;">host dashboard</a>.</p>`
  ));
}

export async function sendVehicleVerificationRejectedEmail(
  to: string, ownerName: string, vehicleName: string, reason?: string
) {
  await send(to, `Vehicle update required — ${vehicleName}`, wrap(
    "Action required on your listing",
    `<p style="color:#94a3b8;margin:0 0 16px;">Hi ${ownerName}, your vehicle <strong style="color:#f8fafc;">${vehicleName}</strong> requires attention.</p>
${reason ? `<div style="background:rgba(239,68,68,0.1);border-left:3px solid #ef4444;padding:12px 16px;border-radius:8px;margin-bottom:16px;font-size:13px;">${reason}</div>` : ""}
<p style="color:#94a3b8;font-size:13px;">Update your listing in your <a href="https://rush-enterprise.com/host/dashboard" style="color:#22d3ee;">host dashboard</a> and resubmit.</p>`
  ));
}

export async function sendTripCompletedEmail(
  to: string, name: string, vehicleName: string, totalCost: number
) {
  await send(to, `Trip complete — ${vehicleName}`, wrap(
    "Thanks for riding with Rush!",
    `<p style="color:#94a3b8;margin:0 0 16px;">Hi ${name}, your trip in the <strong style="color:#f8fafc;">${vehicleName}</strong> is complete.</p>
<p style="color:#94a3b8;margin:0 0 16px;">Total charged: <strong style="color:#22d3ee;">$${totalCost.toFixed(2)}</strong></p>
<p style="color:#94a3b8;font-size:13px;">Leave a review in your <a href="https://rush-enterprise.com/trips" style="color:#22d3ee;">trips dashboard</a>.</p>`
  ));
}

export async function sendPasswordResetEmail(to: string, name: string, resetUrl: string) {
  await send(to, "Reset your Rush password", wrap(
    "Password reset request",
    `<p style="color:#94a3b8;margin:0 0 16px;">Hi ${name}, we received a request to reset your password.</p>
<div style="text-align:center;margin:24px 0;">
<a href="${resetUrl}" style="background:#22d3ee;color:#07090f;font-weight:700;padding:12px 28px;border-radius:10px;text-decoration:none;display:inline-block;">Reset password</a>
</div>
<p style="color:#94a3b8;font-size:12px;text-align:center;">Link expires in 1 hour. If you didn't request this, ignore this email.</p>`
  ));
}

export async function sendSupportNotificationEmail(
  adminEmail: string, userName: string, userEmail: string, message: string
) {
  await send(adminEmail, `Support message from ${userName}`, wrap(
    "New support message",
    `<p style="color:#94a3b8;margin:0 0 16px;">A user has sent a support message.</p>
<table style="width:100%;border-collapse:collapse;background:rgba(255,255,255,0.03);border-radius:12px;overflow:hidden;margin-bottom:16px;">
${bookingCard([
  { label: "From",  value: userName },
  { label: "Email", value: userEmail },
])}</table>
<div style="background:rgba(255,255,255,0.05);border-radius:12px;padding:16px;margin-bottom:16px;">
  <p style="color:#f8fafc;font-size:14px;margin:0;white-space:pre-wrap;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</p>
</div>
<p style="color:#94a3b8;font-size:13px;">Reply via the <a href="https://rush-enterprise.com/messages" style="color:#22d3ee;">messages inbox</a> or reply to this email.</p>`
  ));
}
