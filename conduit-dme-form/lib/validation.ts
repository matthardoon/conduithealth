import { z } from "zod";
import { SUPPLIES } from "./types";

const supplyIds = SUPPLIES.map((s) => s.id) as [string, ...string[]];
const phoneRegex = /^[+]?[0-9().\-\s]{10,20}$/;

export const requestSchema = z
  .object({
    supplies: z.array(z.enum(supplyIds)).min(1, "Please choose at least one item."),
    customSupplyDetails: z.string().trim().max(500).optional().or(z.literal("")),
    firstName: z.string().trim().min(1, "Required").max(80),
    lastName: z.string().trim().min(1, "Required").max(80),
    phone: z.string().regex(phoneRegex, "Enter a valid phone number"),
    email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
    zip: z.string().regex(/^\d{5}$/, "5-digit ZIP code"),
    notes: z.string().trim().max(2000).optional().or(z.literal("")),
    consent: z.literal(true, {
      errorMap: () => ({ message: "Consent is required to submit this request." }),
    }),
  })
  .refine(
    (data) =>
      !data.supplies.includes("something_else") ||
      (data.customSupplyDetails && data.customSupplyDetails.trim().length > 0),
    {
      path: ["customSupplyDetails"],
      message: "Please tell us what else you need.",
    },
  );

export type RequestInput = z.infer<typeof requestSchema>;
