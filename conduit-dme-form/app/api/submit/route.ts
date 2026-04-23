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
  const patient = data.patient;
  const submitter = data.submitter;

  const row = (label: string, value?: string) =>
    value
      ? `<tr><td style="padding:6px 12px;color:#64748b;white-space:nowrap;">${label}</td><td style="padding:6px 12px;color:#0f172a;">${escapeHtml(value)}</td></tr>`
      : "";

  return `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Inter','Segoe UI',sans-serif;max-width:640px;margin:0 auto;padding:24px;background:#f8fafc;">
  <div style="background:white;border-radius:12px;padding:24px;border:1px solid #e2e8f0;">
    <h2 style="margin:0 0 4px;color:#0f172a;">New DME Request</h2>
    <p style="margin:0 0 20px;color:#64748b;font-size:14px;">Submitted ${new Date().toLocaleString("en-US", { timeZone: "America/New_York" })} ET</p>

    <h3 style="margin:16px 0 8px;color:#0f172a;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;">Supplies requested</h3>
    <div style="padding:12px;background:#f1f5f9;border-radius:8px;color:#0f172a;">${supplies}</div>

    <h3 style="margin:20px 0 8px;color:#0f172a;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;">Patient</h3>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      ${row("Name", `${patient.firstName} ${patient.lastName}`)}
      ${row("DOB", patient.dob)}
      ${row("Sex", patient.sex)}
      ${row("ZIP", patient.zip)}
      ${row("Medicaid ID", patient.medicaidId || undefined)}
      ${row("Phone", patient.phone)}
      ${row("Email", patient.email || undefined)}
      ${row("Preferred contact", patient.preferredContact)}
    </table>

    ${
      submitter
        ? `<h3 style="margin:20px 0 8px;color:#0f172a;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;">Submitter</h3>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      ${row("Relationship", data.relationship)}
      ${row("Name", `${submitter.firstName} ${submitter.lastName}`)}
      ${row("Phone", submitter.phone)}
      ${row("Email", submitter.email)}
      ${row("Note", submitter.relationshipNote || undefined)}
    </table>`
        : ""
    }

    ${
      data.notes
        ? `<h3 style="margin:20px 0 8px;color:#0f172a;font-size:14px;text-transform:uppercase;letter-spacing:0.05em;">Notes</h3>
    <div style="padding:12px;background:#f1f5f9;border-radius:8px;color:#0f172a;white-space:pre-wrap;">${escapeHtml(data.notes)}</div>`
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
  lines.push("");
  lines.push("PATIENT:");
  lines.push(`  Name: ${data.patient.firstName} ${data.patient.lastName}`);
  lines.push(`  DOB: ${data.patient.dob}`);
  lines.push(`  Sex: ${data.patient.sex}`);
  lines.push(`  ZIP: ${data.patient.zip}`);
  if (data.patient.medicaidId) lines.push(`  Medicaid ID: ${data.patient.medicaidId}`);
  lines.push(`  Phone: ${data.patient.phone}`);
  if (data.patient.email) lines.push(`  Email: ${data.patient.email}`);
  lines.push(`  Preferred contact: ${data.patient.preferredContact}`);
  if (data.submitter) {
    lines.push("");
    lines.push(`SUBMITTER (${data.relationship}):`);
    lines.push(`  Name: ${data.submitter.firstName} ${data.submitter.lastName}`);
    lines.push(`  Phone: ${data.submitter.phone}`);
    lines.push(`  Email: ${data.submitter.email}`);
    if (data.submitter.relationshipNote) lines.push(`  Note: ${data.submitter.relationshipNote}`);
  }
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

  const patientName = `${data.patient.firstName} ${data.patient.lastName}`;

  try {
    await transporter.sendMail({
      from,
      to,
      replyTo: data.submitter?.email || data.patient.email || undefined,
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
