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

const CATEGORY_ORDER = ["Incontinence", "Mobility", "Home Accessibility", "Other"] as const;

function Icon({ id }: { id: SupplyId }) {
  const common = "h-10 w-10";
  const stroke = { strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (id) {
    case "disposable_diapers":
      return (
        <svg className={common} viewBox="0 0 48 48" fill="none" stroke="currentColor" {...stroke}>
          <path d="M8 14h32l-3 18a6 6 0 0 1-6 5H17a6 6 0 0 1-6-5L8 14Z" />
          <path d="M14 22h20M16 28h16" />
        </svg>
      );
    case "disposable_pull_ups":
      return (
        <svg className={common} viewBox="0 0 48 48" fill="none" stroke="currentColor" {...stroke}>
          <path d="M10 10h28v8a18 18 0 0 1-2 8l-3 6a3 3 0 0 1-3 2H18a3 3 0 0 1-3-2l-3-6a18 18 0 0 1-2-8v-8Z" />
          <path d="M10 14h28" />
        </svg>
      );
    case "disposable_underpads":
      return (
        <svg className={common} viewBox="0 0 48 48" fill="none" stroke="currentColor" {...stroke}>
          <rect x="6" y="10" width="36" height="28" rx="4" />
          <path d="M12 18h24M12 24h24M12 30h16" />
        </svg>
      );
    case "liner_pads":
      return (
        <svg className={common} viewBox="0 0 48 48" fill="none" stroke="currentColor" {...stroke}>
          <path d="M16 8h16l3 12-3 20H16l-3-20 3-12Z" />
          <path d="M19 18h10M19 24h10M19 30h10" />
        </svg>
      );
    case "wheelchair":
      return (
        <svg className={common} viewBox="0 0 48 48" fill="none" stroke="currentColor" {...stroke}>
          <circle cx="20" cy="34" r="8" />
          <path d="M20 8v16h12l4 8" />
          <circle cx="28" cy="8" r="2.5" fill="currentColor" stroke="none" />
        </svg>
      );
    case "transport_chair":
      return (
        <svg className={common} viewBox="0 0 48 48" fill="none" stroke="currentColor" {...stroke}>
          <path d="M14 10h14v18H14z" />
          <path d="M14 28l-2 8M28 28l2 8" />
          <circle cx="12" cy="38" r="3" />
          <circle cx="30" cy="38" r="3" />
          <path d="M28 16h6" />
        </svg>
      );
    case "walker":
      return (
        <svg className={common} viewBox="0 0 48 48" fill="none" stroke="currentColor" {...stroke}>
          <path d="M14 8v32M34 8v32" />
          <path d="M14 16h20M14 26h20" />
          <path d="M14 8c0-1 1-2 2-2h16c1 0 2 1 2 2" />
        </svg>
      );
    case "cane":
      return (
        <svg className={common} viewBox="0 0 48 48" fill="none" stroke="currentColor" {...stroke}>
          <path d="M28 6a8 8 0 0 0-8 8v28" />
        </svg>
      );
    case "grab_bar":
      return (
        <svg className={common} viewBox="0 0 48 48" fill="none" stroke="currentColor" {...stroke}>
          <path d="M8 24h32" />
          <circle cx="8" cy="24" r="3" />
          <circle cx="40" cy="24" r="3" />
          <path d="M14 18v12M34 18v12" />
        </svg>
      );
    case "shower_chair":
      return (
        <svg className={common} viewBox="0 0 48 48" fill="none" stroke="currentColor" {...stroke}>
          <path d="M10 24h28v6H10z" />
          <path d="M14 30v10M34 30v10" />
          <path d="M18 24V12a6 6 0 0 1 12 0v12" />
          <path d="M14 8l2 4M30 6h4l2 4" />
        </svg>
      );
    case "bedside_commode":
      return (
        <svg className={common} viewBox="0 0 48 48" fill="none" stroke="currentColor" {...stroke}>
          <path d="M12 16h24v6a8 8 0 0 1-8 8h-8a8 8 0 0 1-8-8v-6Z" />
          <path d="M16 16V10a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v6" />
          <path d="M14 30v10M34 30v10" />
        </svg>
      );
    case "hospital_bed":
      return (
        <svg className={common} viewBox="0 0 48 48" fill="none" stroke="currentColor" {...stroke}>
          <path d="M6 30h36v8H6z" />
          <path d="M6 30V18a4 4 0 0 1 4-4h8v16" />
          <path d="M30 30V14h8a4 4 0 0 1 4 4v12" />
          <path d="M10 38v4M38 38v4" />
        </svg>
      );
    case "something_else":
      return (
        <svg className={common} viewBox="0 0 48 48" fill="none" stroke="currentColor" {...stroke}>
          <circle cx="24" cy="24" r="14" />
          <path d="M24 16v16M16 24h16" />
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
      <div className="space-y-8">
        {CATEGORY_ORDER.map((category) => {
          const items = SUPPLIES.filter((s) => s.category === category);
          if (items.length === 0) return null;
          return (
            <div key={category}>
              <h3 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-3">
                {category}
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {items.map((item) => {
                  const selected = value.includes(item.id);
                  return (
                    <button
                      type="button"
                      key={item.id}
                      onClick={() => toggle(item.id)}
                      aria-pressed={selected}
                      className={[
                        "group relative flex flex-col items-stretch overflow-hidden rounded-xl border bg-white text-center",
                        "transition-all duration-200 ease-out",
                        "hover:-translate-y-0.5 hover:shadow-tile",
                        selected
                          ? "border-primary ring-2 ring-primary/25 shadow-tile"
                          : "border-border",
                      ].join(" ")}
                    >
                      <div
                        className={[
                          "flex items-center justify-center h-28 transition-colors",
                          selected
                            ? "bg-primary/[0.06] text-primary"
                            : "bg-secondary/50 text-card-foreground/70 group-hover:bg-secondary/70 group-hover:text-card-foreground",
                        ].join(" ")}
                      >
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.image} alt={item.label} className="h-full w-full object-cover" />
                        ) : (
                          <Icon id={item.id} />
                        )}
                      </div>
                      <div className="px-3 py-3">
                        <span className="text-[13px] sm:text-sm font-medium text-card-foreground leading-tight">
                          {item.label}
                        </span>
                      </div>
                      {selected && (
                        <span className="absolute top-2.5 right-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm ring-2 ring-white">
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
        <div className="mt-5 rounded-xl border border-primary/30 bg-primary/[0.03] p-5">
          <label className="block text-sm font-semibold text-card-foreground mb-2">
            Tell us what else you need
          </label>
          <textarea
            className="input-base min-h-[88px] resize-y"
            placeholder="e.g. CPAP supplies, oxygen concentrator, hospital-grade humidifier"
            value={customDetails}
            onChange={(e) => onCustomChange(e.target.value)}
            maxLength={500}
          />
          {customError && <p className="mt-2 text-xs text-destructive">{customError}</p>}
        </div>
      )}

      {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
    </div>
  );
}
