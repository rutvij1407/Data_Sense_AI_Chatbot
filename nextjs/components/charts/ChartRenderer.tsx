"use client";

import { ChartSpec } from "@/lib/types";
import { PlotlyChart } from "./PlotlyChart";

interface ChartRendererProps {
  chartSpec: ChartSpec;
}

export function ChartRenderer({ chartSpec }: ChartRendererProps) {
  return (
    <div className="w-full bg-surface-overlay/50 border border-crimson/20 rounded-xl overflow-hidden mt-2">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-border-subtle">
        <svg className="w-3.5 h-3.5 text-crimson" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span className="text-xs text-gray-400">Interactive Chart</span>
      </div>
      <div className="p-2">
        <PlotlyChart chartSpec={chartSpec} />
      </div>
    </div>
  );
}
