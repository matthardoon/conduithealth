"use client";

import { useMemo, useState } from "react";
import { SuppliesGrid } from "./SuppliesGrid";
import {
  RELATIONSHIPS,
  SEX_OPTIONS,
  CONTACT_METHODS,
  type SupplyId,
  type RelationshipId,
} from "@/lib/types";

type Step = 1 | 2 | 3 | 4;

type FormState = {
  supplies: SupplyId[];
  relationship: RelationshipId | "";
  patient: {
    firstName: string;
    lastName: string;
    dob: string;
    sex: (typeof SEX_OPTIONS)[number] | "";
    zip: string;
    medicaidId: string;
    phone: string;
    email: string;
    preferredContact: (typeof CONTACT_METHODS)[number];
  };
  submitter: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    relationshipNote: string;
  };
  notes: string;
  consent: boolean;
};

const emptyState: FormState = {
  supplies: [],
  relationship: "",
  patient: {
    firstName: "",
    lastName: "",
    dob: "",
    sex: "",
    zip: "",
    medicaidId: "",
    phone: "",
    email: "",
    preferredContact: "Phone call",
  },
  submitter: {
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    relationshipNote: "",
  },
  notes: "",
  consent: false,
};

function Stepper({ step }: { step: Step }) {
  const steps = ["Supplies", "Patient", "Contact", "Review"];
  return (
    <ol className="flex items-center gap-2 mb-8">
      {steps.map((label, i) => {
        const n = (i + 1) as Step;
        const active = n === step;
        const done = n < step;
        return (
          <li key={label} className="flex items-center gap-2">
            <span
              className={[
                "flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition",
                done
                  ? "bg-primary text-primary-foreground"
                  : active
                  ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                  : "bg-white/10 text-foreground/70",
              ].join(" ")}
            >
              {done ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                n
              )}
            </span>
            <span className={active ? "text-foreground" : "text-foreground/60"}>{label}</span>
            {i < steps.length - 1 && <span aria-hidden className="mx-1 h-px w-4 bg-foreground/20" />}
          </li>
        );
      })}
    </ol>
  );
}

export function RequestForm() {
  const [step, setStep] = useState<Step>(1);
  const [state, setState] = useState<FormState>(emptyState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const isPatient = state.relationship === "patient";

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setState((s) => ({ ...s, [key]: value }));
  const updatePatient = <K extends keyof FormState["patient"]>(key: K, value: FormState["patient"][K]) =>
    setState((s) => ({ ...s, patient: { ...s.patient, [key]: value } }));
  const updateSubmitter = <K extends keyof FormState["submitter"]>(key: K, value: FormState["submitter"][K]) =>
    setState((s) => ({ ...s, submitter: { ...s.submitter, [key]: value } }));

  const validateStep = (target: Step): boolean => {
    const e: Record<string, string> = {};
    if (target >= 1) {
      if (state.supplies.length === 0) e.supplies = "Please choose at least one item.";
    }
    if (target >= 2) {
      if (!state.relationship) e.relationship = "Please tell us who's filling this out.";
      if (!state.patient.firstName.trim()) e["patient.firstName"] = "Required";
      if (!state.patient.lastName.trim()) e["patient.lastName"] = "Required";
      if (!/^\d{4}-\d{2}-\d{2}$/.test(state.patient.dob)) e["patient.dob"] = "Enter a valid date";
      if (!state.patient.sex) e["patient.sex"] = "Required";
      if (!/^\d{5}$/.test(state.patient.zip)) e["patient.zip"] = "5-digit ZIP";
    }
    if (target >= 3) {
      if (!/^[+]?[0-9().\-\s]{10,20}$/.test(state.patient.phone))
        e["patient.phone"] = "Enter a valid phone number";
      if (state.patient.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.patient.email))
        e["patient.email"] = "Enter a valid email";
      if (!isPatient) {
        if (!state.submitter.firstName.trim()) e["submitter.firstName"] = "Required";
        if (!state.submitter.lastName.trim()) e["submitter.lastName"] = "Required";
        if (!/^[+]?[0-9().\-\s]{10,20}$/.test(state.submitter.phone))
          e["submitter.phone"] = "Enter a valid phone number";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.submitter.email))
          e["submitter.email"] = "Enter a valid email";
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (validateStep(step)) setStep((s) => Math.min(4, s + 1) as Step);
  };
  const back = () => setStep((s) => Math.max(1, s - 1) as Step);

  const submit = async () => {
    if (!state.consent) {
      setErrors((e) => ({ ...e, consent: "Consent is required to submit this request." }));
      return;
    }
    if (!validateStep(3)) {
      setStep(3);
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const body = {
        supplies: state.supplies,
        relationship: state.relationship,
        patient: state.patient,
        submitter: isPatient ? undefined : state.submitter,
        notes: state.notes,
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

  const selectedLabels = useMemo(
    () =>
      state.supplies
        .map((id) => id.replaceAll("_", " "))
        .map((s) => s.replace(/^\w/, (c) => c.toUpperCase()))
        .join(", "),
    [state.supplies],
  );

  if (done) {
    return (
      <section className="max-w-xl mx-auto text-center py-12">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <h1 className="text-3xl font-semibold text-foreground mb-3">You're all set.</h1>
        <p className="text-foreground/80 mb-8">
          Thanks — we've received your request. A Conduit Health care coordinator will reach out within one business day to confirm details and insurance.
        </p>
        <p className="text-sm text-foreground/60">
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
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-semibold text-foreground mb-2 tracking-tight">
          Request medical supplies
        </h1>
        <p className="text-foreground/70 max-w-xl">
          Tell us what you need. A care coordinator will call within one business day to confirm your request and verify insurance.
        </p>
      </div>

      <Stepper step={step} />

      <div className="bg-card text-card-foreground rounded-2xl shadow-card p-6 sm:p-8">
        {step === 1 && (
          <div>
            <h2 className="text-xl font-semibold mb-1">What do you need?</h2>
            <p className="text-sm text-muted-foreground mb-6">Select everything that applies.</p>
            <SuppliesGrid
              value={state.supplies}
              onChange={(v) => update("supplies", v)}
              error={errors.supplies}
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">Who's filling this out?</h2>
              <p className="text-sm text-muted-foreground mb-4">This helps us know who to call.</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {RELATIONSHIPS.map((r) => (
                  <label
                    key={r.id}
                    className={[
                      "flex items-center gap-3 rounded-lg border p-3 cursor-pointer transition",
                      state.relationship === r.id
                        ? "border-primary ring-2 ring-primary/20 bg-primary/[0.04]"
                        : "border-border hover:border-primary/50",
                    ].join(" ")}
                  >
                    <input
                      type="radio"
                      name="relationship"
                      value={r.id}
                      checked={state.relationship === r.id}
                      onChange={() => update("relationship", r.id)}
                      className="accent-primary"
                    />
                    <span className="text-sm">{r.label}</span>
                  </label>
                ))}
              </div>
              {errors.relationship && <p className="field-error">{errors.relationship}</p>}
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Patient information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Patient first name" error={errors["patient.firstName"]}>
                  <input
                    className="input-base"
                    value={state.patient.firstName}
                    onChange={(e) => updatePatient("firstName", e.target.value)}
                    autoComplete="given-name"
                  />
                </Field>
                <Field label="Patient last name" error={errors["patient.lastName"]}>
                  <input
                    className="input-base"
                    value={state.patient.lastName}
                    onChange={(e) => updatePatient("lastName", e.target.value)}
                    autoComplete="family-name"
                  />
                </Field>
                <Field label="Date of birth" error={errors["patient.dob"]}>
                  <input
                    type="date"
                    className="input-base"
                    value={state.patient.dob}
                    onChange={(e) => updatePatient("dob", e.target.value)}
                  />
                </Field>
                <Field label="Sex assigned at birth" error={errors["patient.sex"]}>
                  <select
                    className="input-base"
                    value={state.patient.sex}
                    onChange={(e) => updatePatient("sex", e.target.value as FormState["patient"]["sex"])}
                  >
                    <option value="">Select…</option>
                    {SEX_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="ZIP code" error={errors["patient.zip"]}>
                  <input
                    inputMode="numeric"
                    maxLength={5}
                    className="input-base"
                    value={state.patient.zip}
                    onChange={(e) => updatePatient("zip", e.target.value.replace(/\D/g, ""))}
                    autoComplete="postal-code"
                  />
                </Field>
                <Field label="Medicaid ID (optional)" error={errors["patient.medicaidId"]}>
                  <input
                    className="input-base"
                    value={state.patient.medicaidId}
                    onChange={(e) => updatePatient("medicaidId", e.target.value)}
                  />
                </Field>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">How should we reach the patient?</h2>
              <p className="text-sm text-muted-foreground mb-4">We'll call to confirm details and insurance.</p>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Patient phone number" error={errors["patient.phone"]}>
                  <input
                    type="tel"
                    className="input-base"
                    value={state.patient.phone}
                    onChange={(e) => updatePatient("phone", e.target.value)}
                    autoComplete="tel"
                    placeholder="(555) 123-4567"
                  />
                </Field>
                <Field label="Patient email (optional)" error={errors["patient.email"]}>
                  <input
                    type="email"
                    className="input-base"
                    value={state.patient.email}
                    onChange={(e) => updatePatient("email", e.target.value)}
                    autoComplete="email"
                  />
                </Field>
                <Field label="Preferred contact method">
                  <div className="flex flex-wrap gap-2">
                    {CONTACT_METHODS.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => updatePatient("preferredContact", m)}
                        className={[
                          "rounded-full border px-4 py-2 text-sm transition",
                          state.patient.preferredContact === m
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border hover:border-primary/60",
                        ].join(" ")}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
            </div>

            {!isPatient && (
              <div>
                <h2 className="text-xl font-semibold mb-1">Your contact info</h2>
                <p className="text-sm text-muted-foreground mb-4">So we can follow up with you if needed.</p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field label="Your first name" error={errors["submitter.firstName"]}>
                    <input
                      className="input-base"
                      value={state.submitter.firstName}
                      onChange={(e) => updateSubmitter("firstName", e.target.value)}
                    />
                  </Field>
                  <Field label="Your last name" error={errors["submitter.lastName"]}>
                    <input
                      className="input-base"
                      value={state.submitter.lastName}
                      onChange={(e) => updateSubmitter("lastName", e.target.value)}
                    />
                  </Field>
                  <Field label="Your phone" error={errors["submitter.phone"]}>
                    <input
                      type="tel"
                      className="input-base"
                      value={state.submitter.phone}
                      onChange={(e) => updateSubmitter("phone", e.target.value)}
                    />
                  </Field>
                  <Field label="Your email" error={errors["submitter.email"]}>
                    <input
                      type="email"
                      className="input-base"
                      value={state.submitter.email}
                      onChange={(e) => updateSubmitter("email", e.target.value)}
                    />
                  </Field>
                  <Field label="Relationship to patient (optional)">
                    <input
                      className="input-base"
                      placeholder="Daughter, case worker, etc."
                      value={state.submitter.relationshipNote}
                      onChange={(e) => updateSubmitter("relationshipNote", e.target.value)}
                    />
                  </Field>
                </div>
              </div>
            )}

            <Field label="Anything else we should know? (optional)">
              <textarea
                className="input-base min-h-[100px]"
                maxLength={2000}
                value={state.notes}
                onChange={(e) => update("notes", e.target.value)}
              />
            </Field>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-1">Review and submit</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Take a quick look before submitting. You can go back to edit anything.
              </p>
            </div>
            <ReviewBlock title="Supplies" onEdit={() => setStep(1)}>
              <p className="text-sm">{selectedLabels}</p>
            </ReviewBlock>
            <ReviewBlock title="Patient" onEdit={() => setStep(2)}>
              <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                <Info k="Name" v={`${state.patient.firstName} ${state.patient.lastName}`} />
                <Info k="DOB" v={state.patient.dob} />
                <Info k="Sex" v={state.patient.sex} />
                <Info k="ZIP" v={state.patient.zip} />
                {state.patient.medicaidId && <Info k="Medicaid ID" v={state.patient.medicaidId} />}
              </dl>
            </ReviewBlock>
            <ReviewBlock title="Contact" onEdit={() => setStep(3)}>
              <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-1 text-sm">
                <Info k="Patient phone" v={state.patient.phone} />
                {state.patient.email && <Info k="Patient email" v={state.patient.email} />}
                <Info k="Preferred" v={state.patient.preferredContact} />
                {!isPatient && (
                  <>
                    <Info k="Your name" v={`${state.submitter.firstName} ${state.submitter.lastName}`} />
                    <Info k="Your phone" v={state.submitter.phone} />
                    <Info k="Your email" v={state.submitter.email} />
                  </>
                )}
              </dl>
              {state.notes && <p className="text-sm mt-2 whitespace-pre-wrap text-muted-foreground">{state.notes}</p>}
            </ReviewBlock>

            <label className="flex gap-3 items-start p-4 rounded-lg bg-muted">
              <input
                type="checkbox"
                checked={state.consent}
                onChange={(e) => update("consent", e.target.checked)}
                className="mt-1 accent-primary h-4 w-4"
              />
              <span className="text-sm">
                I authorize Conduit Health to contact me about this request and to verify insurance coverage. I understand this form is for intake only and is not a guarantee of coverage.
              </span>
            </label>
            {errors.consent && <p className="field-error">{errors.consent}</p>}
            {submitError && (
              <div className="rounded-lg bg-destructive/10 text-destructive text-sm p-3">{submitError}</div>
            )}
          </div>
        )}

        <div className="mt-8 flex items-center justify-between gap-3">
          {step > 1 ? (
            <button type="button" className="btn-ghost" onClick={back} disabled={submitting}>
              ← Back
            </button>
          ) : (
            <span />
          )}
          {step < 4 ? (
            <button type="button" className="btn-primary" onClick={next}>
              Continue →
            </button>
          ) : (
            <button type="button" className="btn-primary" onClick={submit} disabled={submitting}>
              {submitting ? "Sending…" : "Submit request"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="field-label">{label}</label>
      {children}
      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

function ReviewBlock({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
        <button type="button" onClick={onEdit} className="text-xs font-medium text-primary hover:underline">
          Edit
        </button>
      </div>
      {children}
    </div>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-2">
      <dt className="text-muted-foreground w-28 shrink-0">{k}</dt>
      <dd className="text-card-foreground">{v}</dd>
    </div>
  );
}
