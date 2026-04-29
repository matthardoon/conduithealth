"use client";

import { useState } from "react";
import { SuppliesGrid } from "./SuppliesGrid";
import { type SupplyId } from "@/lib/types";

type FormState = {
  supplies: SupplyId[];
  customSupplyDetails: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  zip: string;
  notes: string;
  consent: boolean;
};

const emptyState: FormState = {
  supplies: [],
  customSupplyDetails: "",
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  zip: "",
  notes: "",
  consent: false,
};

const TRUST_BADGES = [
  { label: "Most insurance accepted", icon: "shield" as const },
  { label: "No upfront cost in most cases", icon: "card" as const },
  { label: "Delivered to your door", icon: "package" as const },
];

function TrustIcon({ kind }: { kind: "shield" | "card" | "package" }) {
  const c = "h-3.5 w-3.5 text-primary";
  switch (kind) {
    case "shield":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "card":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="6" width="18" height="13" rx="2" />
          <path d="M3 11h18M7 16h3" />
        </svg>
      );
    case "package":
      return (
        <svg className={c} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 8 12 3 3 8v8l9 5 9-5V8Z" />
          <path d="M3 8l9 5 9-5M12 13v9" />
        </svg>
      );
  }
}

export function RequestForm() {
  const [state, setState] = useState<FormState>(emptyState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setState((s) => ({ ...s, [key]: value }));

  const validate = (): { ok: boolean; firstErrorId?: string } => {
    const e: Record<string, string> = {};
    if (state.supplies.length === 0) e.supplies = "Please choose at least one item.";
    if (state.supplies.includes("something_else") && !state.customSupplyDetails.trim()) {
      e.customSupplyDetails = "Please tell us what else you need.";
    }
    if (!state.firstName.trim()) e.firstName = "Required";
    if (!state.lastName.trim()) e.lastName = "Required";
    if (!/^[+]?[0-9().\-\s]{10,20}$/.test(state.phone)) e.phone = "Enter a valid phone number";
    if (state.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) e.email = "Enter a valid email";
    if (!/^\d{5}$/.test(state.zip)) e.zip = "Enter your 5-digit ZIP";
    if (!state.consent) e.consent = "Please agree to be contacted before submitting.";
    setErrors(e);
    const order = ["supplies", "customSupplyDetails", "firstName", "lastName", "phone", "zip", "email", "consent"];
    const firstErrorKey = order.find((k) => k in e);
    return { ok: Object.keys(e).length === 0, firstErrorId: firstErrorKey };
  };

  const submit = async () => {
    const { ok, firstErrorId } = validate();
    if (!ok) {
      if (firstErrorId) {
        const el = document.getElementById(`field-${firstErrorId}`);
        el?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const body = {
        supplies: state.supplies,
        customSupplyDetails: state.customSupplyDetails || undefined,
        firstName: state.firstName,
        lastName: state.lastName,
        phone: state.phone,
        email: state.email || undefined,
        zip: state.zip,
        notes: state.notes || undefined,
        consent: true,
      };
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const payload = await res.json().catch(() => ({}));
        throw new Error(payload.error || "Submission failed");
      }
      setDone(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <section className="max-w-xl mx-auto text-center py-16">
        <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-[0_8px_24px_-6px_rgba(20,127,77,0.5)]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-9 w-9">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="text-3xl sm:text-4xl font-semibold text-foreground mb-4 tracking-tight">
          Thanks — we've got it.
        </h1>
        <p className="text-muted-foreground text-lg mb-8 max-w-md mx-auto">
          A Conduit Health care coordinator will call within one business day to confirm details and verify your insurance.
        </p>
        <p className="text-sm text-muted-foreground">
          Need to talk sooner? Call{" "}
          <a className="font-medium text-foreground underline underline-offset-4 hover:text-primary" href="tel:+19174232712">
            (917) 423-2712
          </a>
          .
        </p>
      </section>
    );
  }

  return (
    <section className="max-w-3xl mx-auto">
      {/* Hero */}
      <div className="mb-10 sm:mb-12">
        <h1 className="text-4xl sm:text-5xl font-semibold text-foreground mb-4 tracking-tight leading-[1.1]">
          Insurance-covered medical supplies, delivered to your door.
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
          Tell us what you need. A care coordinator will call within one business day to verify your insurance and confirm shipping details.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          {TRUST_BADGES.map((b) => (
            <span key={b.label} className="trust-pill">
              <TrustIcon kind={b.icon} />
              {b.label}
            </span>
          ))}
        </div>
      </div>

      {/* Form card */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="bg-card text-card-foreground rounded-2xl shadow-card p-6 sm:p-10 space-y-10"
      >
        <section id="field-supplies">
          <header className="mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">What do you need?</h2>
            <p className="text-sm text-muted-foreground">
              Select everything that applies. Not on the list? Choose <span className="font-medium text-foreground">Something Else</span> and tell us in your own words.
            </p>
          </header>
          <div id="field-customSupplyDetails">
            <SuppliesGrid
              value={state.supplies}
              onChange={(v) => update("supplies", v)}
              customDetails={state.customSupplyDetails}
              onCustomChange={(v) => update("customSupplyDetails", v)}
              customError={errors.customSupplyDetails}
              error={errors.supplies}
            />
          </div>
        </section>

        <hr className="border-border/70" />

        <section>
          <header className="mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold mb-2">How can we reach you?</h2>
            <p className="text-sm text-muted-foreground">
              We'll call within one business day to confirm details and verify your insurance.
            </p>
          </header>

          <div className="grid sm:grid-cols-2 gap-x-5 gap-y-4">
            <Field id="field-firstName" label="First name" error={errors.firstName}>
              <input
                className="input-base"
                value={state.firstName}
                onChange={(e) => update("firstName", e.target.value)}
                autoComplete="given-name"
                placeholder="Jane"
              />
            </Field>
            <Field id="field-lastName" label="Last name" error={errors.lastName}>
              <input
                className="input-base"
                value={state.lastName}
                onChange={(e) => update("lastName", e.target.value)}
                autoComplete="family-name"
                placeholder="Smith"
              />
            </Field>
            <Field id="field-phone" label="Phone number" error={errors.phone}>
              <input
                type="tel"
                className="input-base"
                value={state.phone}
                onChange={(e) => update("phone", e.target.value)}
                autoComplete="tel"
                placeholder="(555) 123-4567"
              />
            </Field>
            <Field id="field-zip" label="ZIP code" error={errors.zip}>
              <input
                inputMode="numeric"
                maxLength={5}
                className="input-base"
                value={state.zip}
                onChange={(e) => update("zip", e.target.value.replace(/\D/g, ""))}
                autoComplete="postal-code"
                placeholder="10001"
              />
            </Field>
            <div className="sm:col-span-2">
              <Field id="field-email" label="Email (optional)" error={errors.email}>
                <input
                  type="email"
                  className="input-base"
                  value={state.email}
                  onChange={(e) => update("email", e.target.value)}
                  autoComplete="email"
                  placeholder="jane@example.com"
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Anything else we should know? (optional)">
                <textarea
                  className="input-base min-h-[88px] resize-y"
                  maxLength={2000}
                  placeholder="Insurance carrier, doctor's name, best time to call, etc."
                  value={state.notes}
                  onChange={(e) => update("notes", e.target.value)}
                />
              </Field>
            </div>
          </div>
        </section>

        <div id="field-consent">
          <label className="flex gap-3 items-start p-4 rounded-xl bg-secondary/40 border border-border/60 cursor-pointer hover:bg-secondary/60 transition">
            <input
              type="checkbox"
              checked={state.consent}
              onChange={(e) => update("consent", e.target.checked)}
              className="mt-0.5 accent-primary h-4 w-4 shrink-0"
            />
            <span className="text-[13px] leading-relaxed text-card-foreground">
              I agree to be contacted by Conduit Health about this request and to verify my insurance coverage. This form is for intake only and does not guarantee coverage.
            </span>
          </label>
          {errors.consent && <p className="mt-2 text-xs text-destructive">{errors.consent}</p>}
        </div>

        {submitError && (
          <div className="rounded-xl bg-destructive/10 text-destructive text-sm p-4 border border-destructive/20">
            {submitError}
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Your information stays private. We never share or sell it.
          </p>
          <button type="submit" className="btn-primary w-full sm:w-auto" disabled={submitting}>
            {submitting ? "Sending…" : "Submit request"}
            {!submitting && (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}

function Field({
  label,
  error,
  children,
  id,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  id?: string;
}) {
  return (
    <div id={id}>
      <label className="field-label">{label}</label>
      {children}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}
