"use client";

import { useState } from "react";
import { DataSummary } from "@/lib/types";

interface DataPreviewTableProps {
  summary: DataSummary;
}

export function DataPreviewTable({ summary }: DataPreviewTableProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-gradient-card border border-crimson/20 rounded-2xl overflow-hidden">
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-overlay/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-crimson" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M10 3v18M14 3v18" />
          </svg>
          <span className="text-sm font-semibold text-gray-200">Data Preview</span>
          <span className="text-xs text-gray-500">(first {Math.min(summary.sample.length, 10)} rows)</span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="overflow-x-auto border-t border-border-subtle">
          <table className="data-table">
            <thead>
              <tr>
                <th className="text-gray-500 font-normal">#</th>
                {summary.columns.map((col) => (
                  <th key={col.name}>{col.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {summary.sample.map((row, i) => (
                <tr key={i}>
                  <td className="text-gray-600 text-xs">{i + 1}</td>
                  {summary.columns.map((col) => (
                    <td key={col.name}>
                      {row[col.name] == null ? (
                        <span className="text-orange-400/60 text-xs italic">null</span>
                      ) : (
                        String(row[col.name])
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {summary.rowCount > summary.sample.length && (
            <p className="text-xs text-gray-600 px-4 py-2">
              Showing {summary.sample.length} of {summary.rowCount.toLocaleString()} rows
            </p>
          )}
        </div>
      )}
    </div>
  );
}
