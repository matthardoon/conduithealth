import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { requestSchema } from "@/lib/validation";
import { SUPPLIES } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supplyLabel = (id: string) => SUPPLIES.find((s) => s.id === id)?.label ?? id;

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderEmail(data: ReturnType<typeof requestSchema.parse>) {
  const supplies = data.supplies.map(supplyLabel).map(escapeHtml).join(", ");

  const row = (label: string, value?: string) =>
    value
      ? `<tr><td style="padding:6px 12px;color:#64748b;white-space:nowrap;">${label}</td><td style="padding:6px 12px;color:#0a0a0a;">${escapeHtml(value)}</td></tr>`
      : "";

  return `
<div style="font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:640px;margin:0 auto;padding:24px;background:#FAFAF7;">
  <div style="background:white;border-radius:12px;padding:24px;border:1px solid #e7e5db;">
    <h2 style="margin:0 0 4px;color:#0a0a0a;">New DME Request</h2>
    <p style="margin:0 0 20px;color:#64748b;font-size:14px;">Submitted ${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })} ET</p>

    <h3 style="margin:16px 0 8px;color:#0a0a0a;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;">Supplies requested</h3>
    <div style="padding:12px;background:#f5f4ee;border-radius:8px;color:#0a0a0a;">${supplies}</div>

    ${
      data.customSupplyDetails
        ? `<h3 style="margin:20px 0 8px;color:#0a0a0a;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;">"Something else" details</h3>
    <div style="padding:12px;background:#f5f4ee;border-radius:8px;color:#0a0a0a;white-space:pre-wrap;">${escapeHtml(data.customSupplyDetails)}</div>`
        : ""
    }

    <h3 style="margin:20px 0 8px;color:#0a0a0a;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;">Patient</h3>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      ${row("Name", `${data.firstName} ${data.lastName}`)}
      ${row("DOB", data.dob)}
      ${row("Sex", data.sex)}
      ${row("ZIP", data.zip)}
    </table>

    <h3 style="margin:20px 0 8px;color:#0a0a0a;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;">Contact</h3>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      ${row("Phone", data.phone)}
      ${row("Email", data.email || undefined)}
      ${row("Preferred", data.preferredContact)}
    </table>

    <h3 style="margin:20px 0 8px;color:#0a0a0a;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;">Insurance</h3>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      ${row("Type", data.insuranceType)}
      ${row("Member ID", data.insuranceMemberId || undefined)}
    </table>

    ${
      data.notes
        ? `<h3 style="margin:20px 0 8px;color:#0a0a0a;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;">Notes</h3>
    <div style="padding:12px;background:#f5f4ee;border-radius:8px;color:#0a0a0a;white-space:pre-wrap;">${escapeHtml(data.notes)}</div>`
        : ""
    }
  </div>
</div>`;
}

function renderText(data: ReturnType<typeof requestSchema.parse>) {
  const lines: string[] = [];
  lines.push("NEW DME REQUEST");
  lines.push(`Submitted: ${new Date().toISOString()}`);
  lines.push("");
  lines.push("SUPPLIES:");
  lines.push(data.supplies.map(supplyLabel).join(", "));
  if (data.customSupplyDetails) {
    lines.push("");
    lines.push('"Something else" details:');
    lines.push(data.customSupplyDetails);
  }
  lines.push("");
  lines.push("PATIENT:");
  lines.push(`  Name: ${data.firstName} ${data.lastName}`);
  lines.push(`  DOB: ${data.dob}`);
  lines.push(`  Sex: ${data.sex}`);
  lines.push(`  ZIP: ${data.zip}`);
  lines.push("");
  lines.push("CONTACT:");
  lines.push(`  Phone: ${data.phone}`);
  if (data.email) lines.push(`  Email: ${data.email}`);
  lines.push(`  Preferred: ${data.preferredContact}`);
  lines.push("");
  lines.push("INSURANCE:");
  lines.push(`  Type: ${data.insuranceType}`);
  if (data.insuranceMemberId) lines.push(`  Member ID: ${data.insuranceMemberId}`);
  if (data.notes) {
    lines.push("");
    lines.push("NOTES:");
    lines.push(data.notes);
  }
  return lines.join("\n");
}

export async function POST(req: Request) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const to = process.env.TO_EMAIL ?? "partners@conduithealth.com";
  const from = process.env.FROM_EMAIL ?? user;

  if (!host || !user || !pass || !from) {
    console.error("Email not configured: missing SMTP_HOST / SMTP_USER / SMTP_PASS / FROM_EMAIL");
    return NextResponse.json(
      { error: "Email delivery is not configured on the server." },
      { status: 500 },
    );
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });

  const patientName = `${data.firstName} ${data.lastName}`;

  try {
    await transporter.sendMail({
      from,
      to,
      replyTo: data.email || undefined,
      subject: `New DME request — ${patientName}`,
      text: renderText(data),
      html: renderEmail(data),
    });
  } catch (err) {
    console.error("Email send failed", err);
    return NextResponse.json(
      { error: "We couldn't send your request. Please try again or call us." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true });
}
