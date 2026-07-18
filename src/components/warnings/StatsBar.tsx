import { Warning } from "@/lib/db/warnings";

interface StatsBarProps {
  warnings: Warning[];
  stateCount: number;
}

function relativeDate(date: Date | null): string {
  if (!date) return "–";
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

export default function StatsBar({ warnings, stateCount }: StatsBarProps) {
  const criticalCount = warnings.filter(
    (w) => w.urgency_tier === "critical"
  ).length;

  const latestDate =
    warnings.length > 0
      ? relativeDate(warnings[0].published_at)
      : "\u2013";

  const stats = [
    {
      label: "Warnungen",
      value: warnings.length,
      sub: "letzte 2 Monate",
      accent: "border-amber-500",
    },
    {
      label: "Kritisch",
      value: criticalCount,
      sub: "sofort handeln",
      accent: "border-red-500",
    },
    {
      label: "Bundesl\u00e4nder",
      value: stateCount,
      sub: "betroffen",
      accent: "border-orange-400",
    },
    {
      label: "Neueste",
      value: latestDate,
      sub: "Meldung",
      accent: "border-emerald-500",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`bg-surface-800 rounded-xl border-l-4 ${stat.accent} p-4`}
        >
          <p className="text-2xl font-bold text-slate-100">{stat.value}</p>
          <p className="text-sm font-medium text-slate-400">{stat.label}</p>
          <p className="text-xs text-slate-500 mt-1">{stat.sub}</p>
        </div>
      ))}
    </div>
  );
}
