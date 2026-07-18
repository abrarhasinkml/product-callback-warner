"use client";

import { useI18n } from "@/lib/i18n/context";

const STEPS = [
  { icon: "\uD83D\uDCF7", key: "step1" as const },
  { icon: "\uD83D\uDD0D", key: "step2" as const },
  { icon: "\u2705", key: "step3" as const },
];

export default function HowToUse() {
  const { t } = useI18n();

  const steps = STEPS.map((s) => ({
    icon: s.icon,
    title: t[`${s.key}Title`],
    desc: t[`${s.key}Desc`],
  }));

  return (
    <section className="mt-12 mb-4">
      <h2 className="text-lg font-semibold text-slate-300 text-center mb-6">
        {t.howToTitle}
      </h2>

      <div className="grid sm:grid-cols-3 gap-4">
        {steps.map((step, i) => (
          <div
            key={i}
            className="bg-surface-800 border border-surface-700 rounded-xl p-5 text-center animate-fade-in-up"
            style={{ animationDelay: `${i * 150}ms` }}
          >
            <div className="text-3xl mb-3 animate-bounce-slow">{step.icon}</div>
            <h3 className="text-sm font-semibold text-slate-200 mb-1">
              {step.title}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {step.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-6">
        <div className="flex items-center gap-2 animate-pulse">
          <div className="w-2 h-2 rounded-full bg-amber-500" />
          <div className="w-8 h-0.5 bg-surface-600" />
          <div className="w-2 h-2 rounded-full bg-amber-500" style={{ animationDelay: "300ms" }} />
          <div className="w-8 h-0.5 bg-surface-600" />
          <div className="w-2 h-2 rounded-full bg-amber-500" style={{ animationDelay: "600ms" }} />
        </div>
      </div>
    </section>
  );
}
