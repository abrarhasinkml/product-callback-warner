"use client";

import { useState, useEffect, useMemo } from "react";
import { Warning } from "@/lib/db/warnings";
import StatsBar from "@/components/warnings/StatsBar";
import WarningFilters from "@/components/warnings/WarningFilters";
import WarningCard from "@/components/warnings/WarningCard";
import GermanyMap from "@/components/map/GermanyMap";
import StateDetailPanel from "@/components/map/StateDetailPanel";
import { normalizeState } from "@/components/map/germany-states";
import { useI18n } from "@/lib/i18n/context";

interface StateCountData {
  state: string;
  warning_count: number;
}

export default function WarningsPage() {
  const { t } = useI18n();
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [stateData, setStateData] = useState<StateCountData[]>([]);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [warningsRes, statesRes] = await Promise.all([
          fetch("/api/warnings?limit=200"),
          fetch("/api/warnings/states"),
        ]);
        if (warningsRes.ok) {
          const data = await warningsRes.json();
          setWarnings(data.warnings ?? []);
        }
        if (statesRes.ok) {
          const data = await statesRes.json();
          setStateData(data.states ?? []);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const stateCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    for (const s of stateData) map[normalizeState(s.state)] = s.warning_count;
    return map;
  }, [stateData]);

  const allStates = useMemo(
    () => stateData.map((s) => normalizeState(s.state)),
    [stateData]
  );

  const filteredWarnings = useMemo(() => {
    let result = warnings;
    if (urgencyFilter !== "all") result = result.filter((w) => w.urgency_tier === urgencyFilter);
    if (selectedState) result = result.filter((w) => w.affected_states?.some((s) => normalizeState(s) === selectedState));
    return result;
  }, [warnings, urgencyFilter, selectedState]);

  const stateWarnings = useMemo(() => {
    if (!selectedState) return [];
    return warnings.filter((w) => w.affected_states?.some((s) => normalizeState(s) === selectedState));
  }, [warnings, selectedState]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-pulse">
        <div className="h-8 bg-surface-800 rounded w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <div key={i} className="bg-surface-800 rounded-xl h-24" />)}
        </div>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="bg-surface-800 rounded-xl h-96" />
          <div className="bg-surface-800 rounded-xl h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">{t.warningsTitle}</h1>
        <p className="text-slate-400 mt-1">{t.warningsSubtitle}</p>
      </div>

      <StatsBar warnings={warnings} stateCount={allStates.length} />

      <div className="grid lg:grid-cols-2 gap-8">
        <GermanyMap
          stateCounts={stateCountMap}
          selectedState={selectedState}
          onStateClick={(state) => setSelectedState(selectedState === state ? null : state)}
        />
        {selectedState ? (
          <StateDetailPanel state={selectedState} warnings={stateWarnings} onClose={() => setSelectedState(null)} />
        ) : (
          <div className="bg-surface-800 rounded-xl p-6 flex items-center justify-center">
            <p className="text-slate-500 text-sm text-center whitespace-pre-line">{t.selectState}</p>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <WarningFilters
          urgencyFilter={urgencyFilter}
          onUrgencyChange={setUrgencyFilter}
          selectedState={selectedState}
          onStateClear={() => setSelectedState(null)}
          states={allStates}
        />

        {filteredWarnings.length === 0 ? (
          <div className="bg-surface-800 rounded-xl p-8 text-center">
            <p className="text-slate-500">{t.noFilterResults}</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredWarnings.map((warning) => <WarningCard key={warning.id} warning={warning} />)}
          </div>
        )}
      </div>
    </div>
  );
}
