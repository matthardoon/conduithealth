"use client";

import { SUPPLIES, type SupplyId } from "@/lib/types";

type Props = {
  value: SupplyId[];
  onChange: (next: SupplyId[]) => void;
  customDetails: string;
  onCustomChange: (next: string) => void;
  customError?: string;
  error?: string;
};

const CATEGORY_ORDER = ["Incontinence", "Mobility", "Bathroom Safety", "Other"] as const;

function Icon({ id }: { id: SupplyId }) {
  const common = "h-6 w-6";
  switch (id) {
    case "disposable_underwear":
    case "disposable_briefs":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 6h16l-2 10a3 3 0 0 1-3 2.5H9A3 3 0 0 1 6 16L4 6Z" />
          <path d="M8 10h8" />
        </svg>
      );
    case "underpads":
    case "incontinence_accessories":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
          <path d="M7 9h10M7 12h10M7 15h6" />
        </svg>
      );
    case "wheelchair":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="17" r="4" />
          <path d="M11 5v6h6l2 4" />
          <circle cx="14" cy="5" r="1.4" fill="currentColor" stroke="none" />
        </svg>
      );
    case "rollator":
    case "walker":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 4v14M18 4v14M6 10h12" />
          <circle cx="6" cy="19.5" r="1.5" />
          <circle cx="18" cy="19.5" r="1.5" />
        </svg>
      );
    case "cane":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 4a4 4 0 0 0-4 4v12" />
        </svg>
      );
    case "shower_chair":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14v3H5zM7 15v5M17 15v5M9 12V7a3 3 0 0 1 6 0v5" />
        </svg>
      );
    case "transfer_bench":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 13h18v2H3zM6 15v5M18 15v5M9 13V9M15 13V9" />
        </svg>
      );
    case "commode":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 10h12v2a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4v-2Z" />
          <path d="M8 10V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4M9 20h6" />
        </svg>
      );
    case "grab_bar":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12h16" />
          <circle cx="4" cy="12" r="1.5" />
          <circle cx="20" cy="12" r="1.5" />
          <path d="M7 9v6M17 9v6" />
        </svg>
      );
    case "something_else":
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      );
    default:
      return null;
  }
}

export function SuppliesGrid({ value, onChange, customDetails, onCustomChange, customError, error }: Props) {
  const toggle = (id: SupplyId) => {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  };

  const showCustom = value.includes("something_else");

  return (
    <div>
      <div className="space-y-6">
        {CATEGORY_ORDER.map((category) => {
          const items = SUPPLIES.filter((s) => s.category === category);
          if (items.length === 0) return null;
          return (
            <div key={category}>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                {category}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {items.map((item) => {
                  const selected = value.includes(item.id);
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => toggle(item.id)}
                      aria-pressed={selected}
                      className={[
                        "group relative flex flex-col items-center justify-center gap-2 rounded-xl border bg-white p-4 text-center transition",
                        "hover:border-primary/60 hover:shadow-card",
                        selected
                          ? "border-primary ring-2 ring-primary/30 bg-primary/[0.04]"
                          : "border-border",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "flex h-12 w-12 items-center justify-center rounded-full transition",
                          selected ? "bg-primary text-primary-foreground" : "bg-muted text-card-foreground",
                        ].join(" ")}
                      >
                        <Icon id={item.id} />
                      </span>
                      <span className="text-sm font-medium text-card-foreground leading-tight">
                        {item.label}
                      </span>
                      {selected && (
                        <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {showCustom && (
        <div className="mt-4 rounded-xl border border-border bg-secondary/40 p-4">
          <label className="block text-sm font-medium text-card-foreground mb-1.5">
            Tell us what else you need
          </label>
          <textarea
            className="w-full rounded-md border border-input bg-white px-3.5 py-2.5 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition min-h-[80px]"
            placeholder="e.g. CPAP supplies, hospital bed, oxygen concentrator"
            value={customDetails}
            onChange={(e) => onCustomChange(e.target.value)}
            maxLength={500}
          />
          {customError && <p className="mt-1 text-xs text-destructive">{customError}</p>}
        </div>
      )}

      {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
    </div>
  );
}
