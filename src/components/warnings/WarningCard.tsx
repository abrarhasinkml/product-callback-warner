"use client";

import { useState } from "react";
import { Warning } from "@/lib/db/warnings";

interface WarningCardProps {
  warning: Warning;
}

const URGENCY_STYLES: Record<
  string,
  { border: string; badge: string; badgeText: string }
> = {
  critical: {
    border: "border-l-red-500",
    badge: "bg-red-500/20",
    badgeText: "text-red-400",
  },
  high: {
    border: "border-l-orange-400",
    badge: "bg-orange-400/20",
    badgeText: "text-orange-400",
  },
  medium: {
    border: "border-l-amber-500",
    badge: "bg-amber-500/20",
    badgeText: "text-amber-400",
  },
  low: {
    border: "border-l-slate-500",
    badge: "bg-slate-500/20",
    badgeText: "text-slate-400",
  },
  info: {
    border: "border-l-slate-600",
    badge: "bg-slate-600/20",
    badgeText: "text-slate-500",
  },
};

const URGENCY_LABELS: Record<string, string> = {
  critical: "KRITISCH",
  high: "HOCH",
  medium: "MITTEL",
  low: "NIEDRIG",
  info: "INFO",
};

function relativeDate(date: Date | null): string {
  if (!date) return "";
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Heute";
  if (diffDays === 1) return "Gestern";
  if (diffDays < 7) return `vor ${diffDays} Tagen`;
  if (diffDays < 30) return `vor ${Math.floor(diffDays / 7)} Wochen`;
  return `vor ${Math.floor(diffDays / 30)} Monaten`;
}

export default function WarningCard({ warning }: WarningCardProps) {
  const [expanded, setExpanded] = useState(false);
  const tier = warning.urgency_tier ?? "info";
  const style = URGENCY_STYLES[tier] ?? URGENCY_STYLES.info;

  return (
    <div
      className={`bg-surface-800 rounded-xl border-l-4 ${style.border} p-4 transition-all hover:bg-surface-700/50`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded ${style.badge} ${style.badgeText}`}
            >
              {URGENCY_LABELS[tier] ?? tier}
            </span>
            <span className="text-xs text-slate-500">
              {relativeDate(warning.published_at)}
            </span>
          </div>
          <h3 className="text-slate-100 font-semibold truncate">
            {warning.product_name}
          </h3>
          {warning.manufacturer && (
            <p className="text-sm text-slate-400 truncate">
              {warning.manufacturer}
            </p>
          )}
        </div>
      </div>

      <p className="text-sm text-slate-400 mt-2">
        <span className="text-slate-500">Grund:</span> {warning.grund}
      </p>

      {warning.affected_states && warning.affected_states.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {warning.affected_states.map((state) => (
            <span
              key={state}
              className="text-xs bg-surface-600 text-slate-300 px-2 py-0.5 rounded-full"
            >
              {state}
            </span>
          ))}
        </div>
      )}

      <button
        onClick={() => setExpanded(!expanded)}
        className="text-xs text-amber-400 hover:text-amber-300 mt-3 transition-colors"
      >
        {expanded ? "Weniger anzeigen \u25B2" : "Details anzeigen \u25BC"}
      </button>

      {expanded && (
        <div className="mt-3 pt-3 border-t border-surface-600 space-y-2 text-sm">
          {warning.risk_description && (
            <p className="text-slate-300">{warning.risk_description}</p>
          )}
          {warning.lot_numbers && warning.lot_numbers.length > 0 && (
            <p className="text-slate-400">
              <span className="text-slate-500">Chargen: </span>
              {warning.lot_numbers.join(", ")}
            </p>
          )}
          {warning.source_url && (
            <a
              href={warning.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-amber-400 hover:text-amber-300 underline text-xs"
            >
              Offizielle Warnung anzeigen \u2192
            </a>
          )}
        </div>
      )}
    </div>
  );
}
