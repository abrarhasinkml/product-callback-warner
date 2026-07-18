"use client";

import { Warning } from "@/lib/db/warnings";
import { useI18n } from "@/lib/i18n/context";

interface StateDetailPanelProps {
  state: string;
  warnings: Warning[];
  onClose: () => void;
}

const URGENCY_ORDER = ["critical", "high", "medium", "low", "info"] as const;

const TIER_COLORS: Record<string, string> = {
  critical: "bg-red-500/20 text-red-400",
  high: "bg-orange-400/20 text-orange-400",
  medium: "bg-amber-500/20 text-amber-400",
  low: "bg-slate-500/20 text-slate-400",
  info: "bg-slate-600/20 text-slate-500",
};

export default function StateDetailPanel({ state, warnings, onClose }: StateDetailPanelProps) {
  const { t } = useI18n();

  const tierCounts = URGENCY_ORDER.map((tier) => ({
    tier,
    count: warnings.filter((w) => w.urgency_tier === tier).length,
  })).filter((t) => t.count > 0);

  return (
    <div className="bg-surface-800 rounded-xl p-4 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-100">{state}</h3>
          <p className="text-sm text-slate-400">
            {warnings.length} {warnings.length === 1 ? t.warning : t.warnings}
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-500 hover:text-slate-300 text-lg leading-none p-1"
          aria-label="Close"
        >
          &times;
        </button>
      </div>

      {tierCounts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tierCounts.map(({ tier, count }) => (
            <span key={tier} className={`text-xs font-medium px-2 py-1 rounded ${TIER_COLORS[tier]}`}>
              {count} {tier}
            </span>
          ))}
        </div>
      )}

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {warnings.length === 0 ? (
          <p className="text-sm text-slate-500">{t.noStateWarnings}</p>
        ) : (
          warnings.map((w) => (
            <div key={w.id} className="bg-surface-700 rounded-lg p-3 text-sm">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${TIER_COLORS[w.urgency_tier ?? "info"]}`}>
                  {(w.urgency_tier ?? "info").toUpperCase()}
                </span>
                <span className="text-slate-100 font-medium truncate">{w.product_name}</span>
              </div>
              <p className="text-slate-400 text-xs">{w.grund}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
