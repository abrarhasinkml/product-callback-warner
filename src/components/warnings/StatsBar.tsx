"use client";

import { Warning } from "@/lib/db/warnings";
import { useI18n } from "@/lib/i18n/context";

interface StatsBarProps {
  warnings: Warning[];
  stateCount: number;
}

function relativeDate(date: Date | null, t: ReturnType<typeof useI18n>["t"]): string {
  if (!date) return "\u2013";
  const now = new Date();
  const d = new Date(date);
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return t.today;
  if (diffDays === 1) return t.yesterday;
  if (diffDays < 7) return t.daysAgo.replace("{n}", String(diffDays));
  if (diffDays < 30) return t.weeksAgo.replace("{n}", String(Math.floor(diffDays / 7)));
  return t.monthsAgo.replace("{n}", String(Math.floor(diffDays / 30)));
}

export default function StatsBar({ warnings, stateCount }: StatsBarProps) {
  const { t } = useI18n();

  const criticalCount = warnings.filter((w) => w.urgency_tier === "critical").length;
  const latestDate = warnings.length > 0 ? relativeDate(warnings[0].published_at, t) : "\u2013";

  const stats = [
    { label: t.statsWarnings, value: warnings.length, sub: t.statsWarningsSub, accent: "border-amber-500" },
    { label: t.statsCritical, value: criticalCount, sub: t.statsCriticalSub, accent: "border-red-500" },
    { label: t.statsStates, value: stateCount, sub: t.statsStatesSub, accent: "border-orange-400" },
    { label: t.statsLatest, value: latestDate, sub: t.statsLatestSub, accent: "border-emerald-500" },
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
