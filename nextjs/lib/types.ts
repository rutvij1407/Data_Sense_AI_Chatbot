// Dataset types
export interface ParsedColumn {
  name: string;
  dtype: "number" | "string" | "boolean" | "date" | "unknown";
}

export interface NumericStats {
  min: number;
  max: number;
  mean: number;
  median: number;
  stddev: number;
  count: number;
}

export interface DataSummary {
  fileName: string;
  rowCount: number;
  columnCount: number;
  columns: ParsedColumn[];
  sample: Record<string, unknown>[];
  numericStats: Record<string, NumericStats>;
  missingValues: Record<string, number>;
  categoryValueCounts: Record<string, Record<string, number>>;
}

// Chart types
export interface ChartSpec {
  data: object[];
  layout: Record<string, unknown>;
}

// Chat types
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  chartSpec?: ChartSpec;
  timestamp: Date;
  isStreaming?: boolean;
}

// API types
export interface ChatRequest {
  messages: { role: string; content: string }[];
  systemPrompt: string;
  sessionId: string;
}

export interface ParseResponse {
  summary: DataSummary;
  error?: string;
}
