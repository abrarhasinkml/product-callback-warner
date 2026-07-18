"use client";

import { STATES, normalizeState } from "./germany-states";

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
    const normalized = normalizeState(stateId);
    if (selectedState === normalized) return "#fbbf24";
    return "#0f1729";
  };

  const getStrokeWidth = (stateId: string) => {
    const normalized = normalizeState(stateId);
    return selectedState === normalized ? 3 : 1.5;
  };

  return (
    <div className="bg-surface-800 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-slate-400 mb-3">
        Warnungen nach Bundesland
      </h3>
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
                  {state.label}: {count} {count === 1 ? "Warnung" : "Warnungen"}
                </title>
              </path>
            </g>
          );
        })}
      </svg>
      <div className="flex items-center justify-center gap-3 mt-3 text-xs text-slate-500">
        <span className="flex items-center gap-1">
          <span
            className="w-3 h-3 rounded-sm inline-block"
            style={{ backgroundColor: "#1e2d4a" }}
          />
          0
        </span>
        <span className="flex items-center gap-1">
          <span
            className="w-3 h-3 rounded-sm inline-block"
            style={{ backgroundColor: "#d97706" }}
          />
          wenig
        </span>
        <span className="flex items-center gap-1">
          <span
            className="w-3 h-3 rounded-sm inline-block"
            style={{ backgroundColor: "#f59e0b" }}
          />
          mittel
        </span>
        <span className="flex items-center gap-1">
          <span
            className="w-3 h-3 rounded-sm inline-block"
            style={{ backgroundColor: "#fb923c" }}
          />
          viele
        </span>
      </div>
    </div>
  );
}
