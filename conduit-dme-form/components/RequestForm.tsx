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
    if (!/^\d{5}$/.test(state.zip)) e.zip = "5-digit ZIP";
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
      <section className="max-w-xl mx-auto text-center py-12">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="text-3xl font-semibold text-foreground mb-3">You're all set.</h1>
        <p className="text-muted-foreground mb-8">
          Thanks — we've received your request. A Conduit Health care coordinator will call within one business day to confirm details and verify your insurance.
        </p>
        <p className="text-sm text-muted-foreground">
          If your need is urgent, call us directly at{" "}
          <a className="underline hover:text-foreground" href="tel:+19174232712">
            (917) 423-2712
          </a>
          .
        </p>
      </section>
    );
  }

  return (
    <section className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-semibold text-foreground mb-3 tracking-tight">
          Insurance-covered medical supplies, delivered to your door
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Tell us what you need. A care coordinator will call within one business day to verify your insurance — no out-of-pocket cost in most cases — and ship to your home.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="bg-card text-card-foreground rounded-2xl shadow-card p-6 sm:p-8 space-y-8"
      >
        <section id="field-supplies">
          <h2 className="text-lg font-semibold mb-1">What do you need?</h2>
          <p className="text-sm text-muted-foreground mb-5">
            Pick everything that applies. Not sure? Choose "Something Else" and tell us in your own words.
          </p>
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

        <hr className="border-border" />

        <section>
          <h2 className="text-lg font-semibold mb-1">How can we reach you?</h2>
          <p className="text-sm text-muted-foreground mb-5">
            We'll call within one business day to confirm details.
          </p>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field id="field-firstName" label="First name" error={errors.firstName}>
              <input
                className="input-base"
                value={state.firstName}
                onChange={(e) => update("firstName", e.target.value)}
                autoComplete="given-name"
              />
            </Field>
            <Field id="field-lastName" label="Last name" error={errors.lastName}>
              <input
                className="input-base"
                value={state.lastName}
                onChange={(e) => update("lastName", e.target.value)}
                autoComplete="family-name"
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
                />
              </Field>
            </div>
          </div>
        </section>

        <Field label="Anything else we should know? (optional)">
          <textarea
            className="input-base min-h-[80px]"
            maxLength={2000}
            placeholder="Insurance carrier, doctor's name, best time to call, etc."
            value={state.notes}
            onChange={(e) => update("notes", e.target.value)}
          />
        </Field>

        <div id="field-consent">
          <label className="flex gap-3 items-start p-4 rounded-lg bg-secondary/50 cursor-pointer">
            <input
              type="checkbox"
              checked={state.consent}
              onChange={(e) => update("consent", e.target.checked)}
              className="mt-1 accent-primary h-4 w-4"
            />
            <span className="text-sm">
              I agree to be contacted by Conduit Health about this request and to verify my insurance coverage. This form is for intake only and does not guarantee coverage.
            </span>
          </label>
          {errors.consent && <p className="mt-1 text-xs text-destructive">{errors.consent}</p>}
        </div>

        {submitError && (
          <div className="rounded-lg bg-destructive/10 text-destructive text-sm p-3">{submitError}</div>
        )}

        <div className="flex justify-end pt-2">
          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Sending…" : "Submit request →"}
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
