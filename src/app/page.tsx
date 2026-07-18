"use client";

import { useState } from "react";
import Link from "next/link";
import ReceiptUpload from "@/components/ReceiptUpload";
import ManualEntry from "@/components/ManualEntry";
import ResultsView from "@/components/ResultsView";
import HowToUse from "@/components/HowToUse";
import { CheckResult, Match, Product } from "@/lib/types";
import { useI18n } from "@/lib/i18n/context";

export default function Home() {
  const { t } = useI18n();
  const [matches, setMatches] = useState<Match[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<"upload" | "manual">("upload");
  const [hasSearched, setHasSearched] = useState(false);

  const handleResults = (data: CheckResult) => {
    setProducts(data.products);
    setMatches(data.matches);
    setHasSearched(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
      <header className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-3">
          {t.homeTitle}
        </h1>
        <p className="text-slate-400 max-w-lg mx-auto">{t.homeSubtitle}</p>
        <Link
          href="/warnings"
          className="inline-block mt-4 text-sm text-amber-400 hover:text-amber-300 transition-colors"
        >
          {t.homeViewWarnings}
        </Link>
      </header>

      {!hasSearched ? (
        <>
          <div className="bg-surface-800 border border-surface-700 rounded-2xl p-6 sm:p-8">
            <div className="flex gap-1 bg-surface-900 rounded-xl p-1 mb-6">
              <button
                onClick={() => setActiveTab("upload")}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "upload"
                    ? "bg-surface-700 text-amber-400 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {t.tabUpload}
              </button>
              <button
                onClick={() => setActiveTab("manual")}
                className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "manual"
                    ? "bg-surface-700 text-amber-400 shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {t.tabManual}
              </button>
            </div>

            {activeTab === "upload" ? (
              <div className="space-y-4">
                <p className="text-slate-400 text-sm">{t.uploadDesc}</p>
                <ReceiptUpload onUploadComplete={handleResults} />
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-slate-400 text-sm">{t.manualDesc}</p>
                <ManualEntry onSubmit={handleResults} />
              </div>
            )}
          </div>

          <HowToUse />
        </>
      ) : (
        <div className="space-y-6">
          <button
            onClick={() => {
              setHasSearched(false);
              setMatches([]);
              setProducts([]);
            }}
            className="text-amber-400 hover:text-amber-300 text-sm transition-colors"
          >
            {t.backToCheck}
          </button>
          <ResultsView matches={matches} products={products} />
        </div>
      )}
    </div>
  );
}
