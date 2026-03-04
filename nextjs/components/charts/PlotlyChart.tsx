"use client";

import dynamic from "next/dynamic";
import { ChartSpec } from "@/lib/types";

const Plot = dynamic(() => import("react-plotly.js"), {
  ssr: false,
  loading: () => (
    <div className="h-64 flex items-center justify-center bg-surface-overlay/50 rounded-xl border border-border-subtle">
      <div className="flex flex-col items-center gap-2">
        <div className="w-6 h-6 border-2 border-crimson border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-gray-500">Rendering chart...</span>
      </div>
    </div>
  ),
});

// Enforce dark theme defaults on all charts
const DARK_LAYOUT_DEFAULTS: Partial<Record<string, unknown>> = {
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(0,0,0,0)",
  font: { color: "#ffffff", family: "Inter, system-ui, sans-serif" },
  xaxis: { gridcolor: "#2a2a2a", linecolor: "#444", zerolinecolor: "#444" },
  yaxis: { gridcolor: "#2a2a2a", linecolor: "#444", zerolinecolor: "#444" },
  margin: { t: 60, r: 20, b: 60, l: 60 },
};

interface PlotlyChartProps {
  chartSpec: ChartSpec;
}

export function PlotlyChart({ chartSpec }: PlotlyChartProps) {
  const mergedLayout = {
    ...DARK_LAYOUT_DEFAULTS,
    ...chartSpec.layout,
    // Always keep these overrides
    paper_bgcolor: "rgba(0,0,0,0)",
    plot_bgcolor: "rgba(0,0,0,0)",
    font: { color: "#ffffff", family: "Inter, system-ui, sans-serif" },
  };

  return (
    <Plot
      data={chartSpec.data as Plotly.Data[]}
      layout={mergedLayout as Partial<Plotly.Layout>}
      style={{ width: "100%" }}
      useResizeHandler
      config={{
        responsive: true,
        displayModeBar: true,
        displaylogo: false,
        modeBarButtonsToRemove: ["toImage", "sendDataToCloud"],
      }}
    />
  );
}
