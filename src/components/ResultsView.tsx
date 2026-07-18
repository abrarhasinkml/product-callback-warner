"use client";

import { useState } from "react";
import { Match, Product } from "@/lib/types";
import { useI18n } from "@/lib/i18n/context";

interface ResultsViewProps {
  matches: Match[];
  products: Product[];
}

const URGENCY_STYLE_KEYS = ["critical", "high", "medium", "low", "info"] as const;

const URGENCY_STYLES: Record<
  string,
  { border: string; badge: string; badgeText: string }
> = {
  critical: { border: "border-l-red-500", badge: "bg-red-500/20", badgeText: "text-red-400" },
  high: { border: "border-l-orange-400", badge: "bg-orange-400/20", badgeText: "text-orange-400" },
  medium: { border: "border-l-amber-500", badge: "bg-amber-500/20", badgeText: "text-amber-400" },
  low: { border: "border-l-slate-500", badge: "bg-slate-500/20", badgeText: "text-slate-400" },
  info: { border: "border-l-slate-600", badge: "bg-slate-600/20", badgeText: "text-slate-500" },
};

export default function ResultsView({ matches, products }: ResultsViewProps) {
  const { t } = useI18n();
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);

  const urgencyLabel = (tier: string) => {
    const map: Record<string, string> = {
      critical: t.urgencyCritical,
      high: t.urgencyHigh,
      medium: t.urgencyMedium,
      low: t.urgencyLow,
      info: t.urgencyInfo,
    };
    return map[tier] ?? tier;
  };

  const getProductName = (productId: string) => {
    return products.find((p) => p.id === productId)?.name || t.unknownProduct;
  };

  const toggleExpand = (key: string) => {
    setExpandedMatch(expandedMatch === key ? null : key);
  };

  if (matches.length === 0) {
    return (
      <div className="bg-surface-800 border border-emerald-500/20 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">&#x2705;</div>
        <h2 className="text-xl font-semibold text-emerald-400 mb-2">
          {t.noRecalls}
        </h2>
        <p className="text-slate-400 text-sm">{t.noRecallsDesc}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-slate-100">{t.recallsFound}</h2>
        <p className="text-sm text-slate-400 mt-1">
          {matches.length} {t.recallsFoundDesc}
        </p>
      </div>

      {matches.map((match, idx) => {
        const key = `${match.product_id}-${idx}`;
        const tier = match.urgency_tier || "info";
        const style = URGENCY_STYLES[tier] ?? URGENCY_STYLES.info;

        return (
          <div
            key={key}
            className={`bg-surface-800 rounded-xl border-l-4 ${style.border} p-4 sm:p-5`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-100 truncate">
                  {match.warning.product_name}
                </h3>
                <p className="text-sm text-slate-400 mt-0.5">
                  {t.yourProduct} {getProductName(match.product_id)}
                </p>
                {match.warning.manufacturer && (
                  <p className="text-sm text-slate-500">
                    {match.warning.manufacturer}
                  </p>
                )}
              </div>
              <span
                className={`text-xs font-bold px-2 py-1 rounded ${style.badge} ${style.badgeText} whitespace-nowrap`}
              >
                {urgencyLabel(tier)}
              </span>
            </div>

            <div className="mt-3 space-y-1">
              <p className="text-sm text-slate-300">
                <span className="text-slate-500">{t.reason} </span>
                {t.gruende[match.warning.grund] ?? match.warning.grund}
              </p>
              <p className="text-sm text-slate-400">{match.risk_text}</p>
            </div>

            {match.warning.lot_numbers && match.warning.lot_numbers.length > 0 && (
              <p className="text-xs text-slate-500 mt-2">
                <span className="text-slate-400">{t.affectedLots} </span>
                {match.warning.lot_numbers.join(", ")}
              </p>
            )}

            {match.warning.affected_states && match.warning.affected_states.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {match.warning.affected_states.map((state) => (
                  <span
                    key={state}
                    className="text-xs bg-surface-700 text-slate-400 px-2 py-0.5 rounded-full"
                  >
                    {state}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-3 flex items-center gap-4">
              <div className="text-xs text-slate-500">
                {t.matchConfidence} {Math.round(match.match_score * 100)}%
              </div>
              <button
                onClick={() => toggleExpand(key)}
                className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
              >
                {expandedMatch === key ? t.showLess : t.showMore}
              </button>
            </div>

            {expandedMatch === key && (
              <div className="mt-3 pt-3 border-t border-surface-700">
                <a
                  href={match.warning.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-amber-400 hover:text-amber-300 underline transition-colors"
                >
                  {t.viewOfficial}
                </a>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
