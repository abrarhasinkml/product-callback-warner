"use client";

import { useState } from "react";
import { Match, Product } from "@/lib/types";

interface ResultsViewProps {
  matches: Match[];
  products: Product[];
}

const URGENCY_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-800 border-red-300",
  high: "bg-orange-100 text-orange-800 border-orange-300",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
  low: "bg-blue-100 text-blue-800 border-blue-300",
  info: "bg-gray-100 text-gray-800 border-gray-300",
};

const URGENCY_LABELS: Record<string, string> = {
  critical: "CRITICAL",
  high: "HIGH",
  medium: "MEDIUM",
  low: "LOW",
  info: "INFO",
};

export default function ResultsView({ matches, products }: ResultsViewProps) {
  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);

  const getProductName = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    return product?.name || "Unknown Product";
  };

  const toggleExpand = (key: string) => {
    setExpandedMatch(expandedMatch === key ? null : key);
  };

  if (matches.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <h2 className="text-xl font-semibold text-green-800 mb-2">
          No Recalls Found
        </h2>
        <p className="text-green-700">
          None of your products match current recall warnings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">Recall Matches Found</h2>
      <p className="text-gray-600">
        {matches.length} of your product{matches.length !== 1 ? "s" : ""} match
        current recall warnings.
      </p>

      {matches.map((match, idx) => {
        const key = `${match.product_id}-${idx}`;
        return (
          <div
            key={key}
            className={`border rounded-lg p-4 ${
              URGENCY_COLORS[match.urgency_tier] || URGENCY_COLORS.info
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">
                  {match.warning.product_name}
                </h3>
                <p className="text-sm opacity-80">
                  Your product: {getProductName(match.product_id)}
                </p>
                {match.warning.manufacturer && (
                  <p className="text-sm opacity-80">
                    Manufacturer: {match.warning.manufacturer}
                  </p>
                )}
              </div>
              <span className="px-2 py-1 text-xs font-bold rounded border">
                {URGENCY_LABELS[match.urgency_tier] || match.urgency_tier}
              </span>
            </div>

            <div className="mt-3">
              <p className="text-sm font-medium">
                Reason: {match.warning.grund}
              </p>
              <p className="text-sm mt-1">{match.risk_text}</p>
            </div>

            {match.warning.lot_numbers &&
              match.warning.lot_numbers.length > 0 && (
                <div className="mt-2 text-sm">
                  <span className="font-medium">Affected lots: </span>
                  {match.warning.lot_numbers.join(", ")}
                </div>
              )}

            {match.warning.affected_states &&
              match.warning.affected_states.length > 0 && (
                <div className="mt-1 text-sm">
                  <span className="font-medium">Affected states: </span>
                  {match.warning.affected_states.join(", ")}
                </div>
              )}

            <div className="mt-3 flex items-center gap-4">
              <div className="text-sm">
                Match confidence: {Math.round(match.match_score * 100)}%
              </div>
              <button
                onClick={() => toggleExpand(key)}
                className="text-sm underline hover:no-underline"
              >
                {expandedMatch === key ? "Show less" : "Show more"}
              </button>
            </div>

            {expandedMatch === key && (
              <div className="mt-3 pt-3 border-t border-current opacity-80">
                <a
                  href={match.warning.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm underline hover:no-underline"
                >
                  View official warning →
                </a>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
