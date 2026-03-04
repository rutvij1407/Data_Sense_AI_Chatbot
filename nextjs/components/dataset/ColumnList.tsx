"use client";

import { ParsedColumn } from "@/lib/types";

const DTYPE_COLORS: Record<string, string> = {
  number: "text-blue-400 bg-blue-900/20 border-blue-500/30",
  string: "text-green-400 bg-green-900/20 border-green-500/30",
  date: "text-purple-400 bg-purple-900/20 border-purple-500/30",
  boolean: "text-yellow-400 bg-yellow-900/20 border-yellow-500/30",
  unknown: "text-gray-400 bg-gray-800/40 border-gray-600/30",
};

interface ColumnListProps {
  columns: ParsedColumn[];
  missingValues: Record<string, number>;
}

export function ColumnList({ columns, missingValues }: ColumnListProps) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Columns ({columns.length})
      </h3>
      <ul className="space-y-1.5">
        {columns.map((col) => {
          const missing = missingValues[col.name] ?? 0;
          return (
            <li key={col.name} className="flex items-center justify-between gap-2 group">
              <span
                className="text-sm text-gray-300 truncate flex-1 group-hover:text-white transition-colors"
                title={col.name}
              >
                {col.name}
              </span>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {missing > 0 && (
                  <span className="text-xs text-orange-400" title={`${missing} missing values`}>
                    ●
                  </span>
                )}
                <span
                  className={`text-xs border px-1.5 py-0.5 rounded font-mono ${DTYPE_COLORS[col.dtype]}`}
                >
                  {col.dtype}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
