"use client";

import { STATES, normalizeState } from "./germany-states";
import { useI18n } from "@/lib/i18n/context";

interface GermanyMapProps {
  stateCounts: Record<string, number>;
  selectedState: string | null;
  onStateClick: (state: string) => void;
}

export default function GermanyMap({
  stateCounts,
  selectedState,
  onStateClick,
}: GermanyMapProps) {
  const { t } = useI18n();
  const maxCount = Math.max(...Object.values(stateCounts), 1);

  const getColor = (stateId: string) => {
    const normalized = normalizeState(stateId);
    const count = stateCounts[normalized] ?? 0;
    if (count === 0) return "#1e2d4a";
    const intensity = count / maxCount;
    if (intensity < 0.33) return "#d97706";
    if (intensity < 0.66) return "#f59e0b";
    return "#fb923c";
  };

  const getStroke = (stateId: string) => {
    return selectedState === normalizeState(stateId) ? "#fbbf24" : "#0f1729";
  };

  const getStrokeWidth = (stateId: string) => {
    return selectedState === normalizeState(stateId) ? 3 : 1.5;
  };

  return (
    <div className="bg-surface-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-slate-400 mb-3">{t.mapTitle}</h3>
      <svg viewBox="0 0 580 720" className="w-full max-w-sm mx-auto">
        {STATES.map((state) => {
          const normalized = normalizeState(state.id);
          const count = stateCounts[normalized] ?? 0;
          return (
            <g key={state.id}>
              <path
                d={state.path}
                fill={getColor(state.id)}
                stroke={getStroke(state.id)}
                strokeWidth={getStrokeWidth(state.id)}
                className="cursor-pointer transition-all duration-200 hover:opacity-80"
                onClick={() => onStateClick(normalized)}
              >
                <title>
                  {state.label}: {count} {count === 1 ? t.warning : t.warnings}
                </title>
              </path>
            </g>
          );
        })}
      </svg>
      <div className="flex items-center justify-center gap-3 mt-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: "#1e2d4a" }} />
          {t.mapLegend0}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: "#d97706" }} />
          {t.mapLegendLow}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: "#f59e0b" }} />
          {t.mapLegendMid}
        </span>
        <span className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: "#fb923c" }} />
          {t.mapLegendHigh}
        </span>
      </div>
    </div>
  );
}
