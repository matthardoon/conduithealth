export type Supply = {
  id: string;
  label: string;
  category: "Incontinence" | "Mobility" | "Home Accessibility" | "Other";
  /** Optional product photo URL. When set, renders instead of the SVG icon.
   *  Use a path under /public (e.g. "/supplies/wheelchair.jpg") or any HTTPS URL. */
  image?: string;
};

export const SUPPLIES = [
  // Incontinence
  { id: "disposable_diapers", label: "Disposable Diapers", category: "Incontinence" },
  { id: "disposable_pull_ups", label: "Disposable Pull-Ups", category: "Incontinence" },
  { id: "disposable_underpads", label: "Disposable Underpads", category: "Incontinence" },
  { id: "liner_pads", label: "Liner Pads", category: "Incontinence" },

  // Mobility
  { id: "wheelchair", label: "Wheelchair", category: "Mobility" },
  { id: "transport_chair", label: "Transport Chair", category: "Mobility" },
  { id: "walker", label: "Walker", category: "Mobility" },
  { id: "cane", label: "Cane", category: "Mobility" },

  // Home Accessibility
  { id: "grab_bar", label: "Grab Bar", category: "Home Accessibility" },
  { id: "shower_chair", label: "Shower Chair", category: "Home Accessibility" },
  { id: "bedside_commode", label: "Bedside Commode", category: "Home Accessibility" },
  { id: "hospital_bed", label: "Hospital Bed", category: "Home Accessibility" },

  // Other
  { id: "something_else", label: "Something Else", category: "Other" },
] as const satisfies readonly Supply[];

export type SupplyId = (typeof SUPPLIES)[number]["id"];
