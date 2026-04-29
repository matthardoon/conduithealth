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
  { id: "something_else", label: "Something Else", category: "Other" },
] as const;

export type SupplyId = (typeof SUPPLIES)[number]["id"];
