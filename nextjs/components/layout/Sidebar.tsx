"use client";

import { DataSummary } from "@/lib/types";
import { FileDropZone } from "@/components/upload/FileDropZone";
import { ColumnList } from "@/components/dataset/ColumnList";

interface SidebarProps {
  summary: DataSummary | null;
  isLoading: boolean;
  error: string | null;
  onFileAccepted: (file: File) => void;
  onClearDataset: () => void;
}

export function Sidebar({
  summary,
  isLoading,
  error,
  onFileAccepted,
  onClearDataset,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      {/* Branding */}
      <div className="px-5 py-5 border-b border-crimson/20">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-crimson animate-pulse-crimson" />
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">Dataset</span>
        </div>
        {summary ? (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white truncate max-w-[180px]" title={summary.fileName}>
                {summary.fileName}
              </p>
              <p className="text-xs text-gray-500">
                {summary.rowCount.toLocaleString()} rows · {summary.columnCount} columns
              </p>
            </div>
            <button
              onClick={onClearDataset}
              className="text-gray-500 hover:text-crimson transition-colors p-1 rounded"
              title="Remove dataset"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No dataset loaded</p>
        )}
      </div>

      {/* Upload zone */}
      <div className="px-4 py-4 border-b border-crimson/20">
        <FileDropZone onFileAccepted={onFileAccepted} isLoading={isLoading} />
        {error && (
          <div className="mt-3 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}
      </div>

      {/* Column list */}
      {summary && (
        <div className="flex-1 overflow-y-auto px-4 py-4">
          <ColumnList columns={summary.columns} missingValues={summary.missingValues} />
        </div>
      )}

      {/* Footer */}
      <div className="px-5 py-4 border-t border-crimson/20 mt-auto">
        <p className="text-xs text-gray-600 text-center">
          DataSense AI · Claude claude-sonnet-4-20250514
        </p>
      </div>
    </aside>
  );
}
