import { z } from "zod";
import { SUPPLIES, RELATIONSHIPS, SEX_OPTIONS, CONTACT_METHODS } from "./types";

const supplyIds = SUPPLIES.map((s) => s.id) as [string, ...string[]];
const relationshipIds = RELATIONSHIPS.map((r) => r.id) as [string, ...string[]];
const phoneRegex = /^[+]?[0-9().\-\s]{10,20}$/;

export const requestSchema = z
  .object({
    supplies: z.array(z.enum(supplyIds)).min(1, "Please choose at least one item."),
    relationship: z.enum(relationshipIds),
    patient: z.object({
      firstName: z.string().trim().min(1, "Required").max(80),
      lastName: z.string().trim().min(1, "Required").max(80),
      dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Enter a valid date"),
      sex: z.enum(SEX_OPTIONS),
      zip: z.string().regex(/^\d{5}$/, "5-digit ZIP code"),
      medicaidId: z.string().trim().max(40).optional().or(z.literal("")),
      phone: z.string().regex(phoneRegex, "Enter a valid phone number"),
      email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
      preferredContact: z.enum(CONTACT_METHODS).default("Phone call"),
    }),
    submitter: z
      .object({
        firstName: z.string().trim().min(1).max(80),
        lastName: z.string().trim().min(1).max(80),
        phone: z.string().regex(phoneRegex, "Enter a valid phone number"),
        email: z.string().trim().email("Enter a valid email"),
        relationshipNote: z.string().trim().max(120).optional().or(z.literal("")),
      })
      .optional(),
    notes: z.string().trim().max(2000).optional().or(z.literal("")),
    consent: z.literal(true, {
      errorMap: () => ({ message: "Consent is required to submit this request." }),
    }),
  })
  .refine(
    (data) => data.relationship === "patient" || data.submitter !== undefined,
    { path: ["submitter"], message: "Your contact info is required." },
  );

export type RequestInput = z.infer<typeof requestSchema>;
