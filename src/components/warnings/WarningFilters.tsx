"use client";

interface WarningFiltersProps {
  urgencyFilter: string;
  onUrgencyChange: (urgency: string) => void;
  selectedState: string | null;
  onStateClear: () => void;
  states: string[];
}

const URGENCY_OPTIONS = [
  { value: "all", label: "Alle" },
  { value: "critical", label: "Kritisch" },
  { value: "high", label: "Hoch" },
  { value: "medium", label: "Mittel" },
  { value: "low", label: "Niedrig" },
];

export default function WarningFilters({
  urgencyFilter,
  onUrgencyChange,
  selectedState,
  onStateClear,
  states,
}: WarningFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex flex-wrap gap-1">
        {URGENCY_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onUrgencyChange(opt.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              urgencyFilter === opt.value
                ? "bg-amber-500 text-surface-900"
                : "bg-surface-700 text-slate-400 hover:text-slate-200 hover:bg-surface-600"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {selectedState && (
        <div className="flex items-center gap-2 bg-surface-700 rounded-lg px-3 py-1.5">
          <span className="text-xs text-slate-300">{selectedState}</span>
          <button
            onClick={onStateClear}
            className="text-slate-500 hover:text-slate-300 text-sm leading-none"
            aria-label="Filter entfernen"
          >
            &times;
          </button>
        </div>
      )}

      {states.length > 0 && !selectedState && (
        <select
          value=""
          onChange={(e) => {
            if (e.target.value) {
              onStateClear();
            }
          }}
          className="bg-surface-700 text-slate-400 text-xs rounded-lg px-3 py-1.5 border border-surface-600 focus:outline-none focus:border-amber-500"
        >
          <option value="">Bundesland filtern...</option>
          {states.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
