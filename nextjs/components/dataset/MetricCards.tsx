"use client";

import { DataSummary } from "@/lib/types";

interface MetricCardProps {
  value: string | number;
  label: string;
  icon: React.ReactNode;
}

function MetricCard({ value, label, icon }: MetricCardProps) {
  return (
    <div className="metric-card">
      <div className="flex items-center justify-center mb-2 text-crimson/60">{icon}</div>
      <div className="metric-value">{value}</div>
      <div className="metric-label">{label}</div>
    </div>
  );
}

interface MetricCardsProps {
  summary: DataSummary;
}

export function MetricCards({ summary }: MetricCardsProps) {
  const totalMissing = Object.values(summary.missingValues).reduce((a, b) => a + b, 0);
  const numericCount = summary.columns.filter((c) => c.dtype === "number").length;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        value={summary.rowCount.toLocaleString()}
        label="Total Rows"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
        }
      />
      <MetricCard
        value={summary.columnCount}
        label="Columns"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
          </svg>
        }
      />
      <MetricCard
        value={totalMissing.toLocaleString()}
        label="Missing Values"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        }
      />
      <MetricCard
        value={numericCount}
        label="Numeric Columns"
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
        }
      />
    </div>
  );
}
