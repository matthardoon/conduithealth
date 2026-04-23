export const SUPPLIES = [
  { id: "disposable_underwear", label: "Disposable Underwear", category: "Incontinence" },
  { id: "disposable_briefs", label: "Disposable Briefs", category: "Incontinence" },
  { id: "underpads", label: "Underpads", category: "Incontinence" },
  { id: "incontinence_accessories", label: "Incontinence Accessories", category: "Incontinence" },
  { id: "wheelchair", label: "Wheelchair", category: "Mobility" },
  { id: "rollator", label: "Rollator", category: "Mobility" },
  { id: "walker", label: "Walker", category: "Mobility" },
  { id: "cane", label: "Cane", category: "Mobility" },
  { id: "shower_chair", label: "Shower Chair", category: "Bathroom Safety" },
  { id: "transfer_bench", label: "Transfer Bench", category: "Bathroom Safety" },
  { id: "commode", label: "Commode", category: "Bathroom Safety" },
  { id: "grab_bar", label: "Grab Bar", category: "Bathroom Safety" },
] as const;

export type SupplyId = (typeof SUPPLIES)[number]["id"];

export const RELATIONSHIPS = [
  { id: "patient", label: "I'm the patient" },
  { id: "caregiver", label: "I'm a caregiver or family member" },
  { id: "provider", label: "I'm a healthcare provider" },
  { id: "partner", label: "I'm a partner team member" },
] as const;

export type RelationshipId = (typeof RELATIONSHIPS)[number]["id"];

export const SEX_OPTIONS = ["Female", "Male", "Prefer not to say"] as const;
export const CONTACT_METHODS = ["Phone call", "Text message", "Either"] as const;
