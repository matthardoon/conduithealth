# Conduit DME Request Form

Patient-facing durable medical equipment (DME) request intake form. Single-page Next.js app. Submissions are emailed to `partners@conduithealth.com` via Google Workspace SMTP (BAA-covered).

## Stack
- Next.js 14 (App Router, TypeScript)
- Tailwind CSS with shadcn-style CSS variables
- Zod for validation
- Nodemailer → Gmail SMTP

## Local dev

```bash
npm install
cp .env.example .env.local   # fill in real values
npm run dev
```

Open http://localhost:3000.

## Environment variables

| Name | Required | Notes |
|---|---|---|
| `SMTP_HOST` | yes | `smtp.gmail.com` for Workspace |
| `SMTP_PORT` | yes | `465` (SSL) |
| `SMTP_USER` | yes | Workspace mailbox that sends (e.g. `forms@conduithealth.com`) |
| `SMTP_PASS` | yes | Google **App Password**, not the account password |
| `FROM_EMAIL` | yes | Usually same as `SMTP_USER` |
| `TO_EMAIL` | no | Defaults to `partners@conduithealth.com` |

**App Password setup**: in the `forms@conduithealth.com` Workspace account, enable 2FA → Google Account → Security → App Passwords → generate one for "Mail / Other (Conduit DME form)". Paste the 16-char password into `SMTP_PASS`.

## Deploy to Vercel

1. Push this directory to a GitHub repo under the Conduit org.
2. In Vercel: **New Project → Import** the repo.
3. Add the environment variables above under **Project → Settings → Environment Variables** (Production + Preview).
4. Deploy. Point `dme.conduithealth.com` (or similar) at the deployment.

No build-time secrets are required; variables are only read server-side in `/api/submit`.

## HIPAA notes

- All PHI is handled inside Google Workspace (Conduit has a signed BAA). The form POSTs to a Node runtime API route that sends email via SMTP — no third-party processors are involved.
- `/api/submit` enforces `runtime = "nodejs"` and `dynamic = "force-dynamic"`. No request bodies are logged; validation errors log only field names.
- Responses are delivered to a shared inbox. If that inbox is accessed outside Workspace (forwarding to personal Gmail, IMAP to Outlook, etc.), the BAA coverage breaks — keep it Workspace-native.
- Security headers (frame-ancestors, no-sniff, strict referrer) are set in `next.config.mjs`.

## Design tokens

Palette and type are sourced from the **shadcn/ui - CH** Figma library (file `Smg1tu7yH4Wn09KHIxAojJ`). Current values in `app/globals.css` are approximations of the purple + teal mockup; final hex values should be pulled from node `178:1642` via the Figma MCP `get_variable_defs` tool and written directly into the `:root` block.

## File layout

```
app/
  layout.tsx         # page shell (header, footer, fonts)
  page.tsx           # entry point — renders <RequestForm />
  globals.css        # design tokens + base styles
  api/submit/route.ts  # POST endpoint, Nodemailer send
components/
  RequestForm.tsx    # 4-step stepper form (supplies → patient → contact → review)
  SuppliesGrid.tsx   # icon-grid multi-select
lib/
  types.ts           # supply list, relationship options, constants
  validation.ts      # Zod schema shared with API route
```
