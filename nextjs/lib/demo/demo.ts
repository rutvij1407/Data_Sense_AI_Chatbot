import demoData from "./demoData.json";
import { buildDataSummary } from "@/lib/buildDataSummary";
import { ChartSpec, DataSummary } from "@/lib/types";

export interface DemoChat {
  id: string;
  question: string;
  answer: string;
  chartSpec?: ChartSpec;
}

export const DEMO_FILE_NAME: string = demoData.fileName;
export const DEMO_CHATS = demoData.chats as DemoChat[];

export function getDemoSummary(): DataSummary {
  return buildDataSummary(demoData.fileName, demoData.rows as Record<string, unknown>[]);
}

const RULES: { id: string; test: RegExp }[] = [
  { id: "missing", test: /missing|null|empty|gaps|blank/ },
  { id: "ratings", test: /rating|satisf|review|score/ },
  { id: "summary", test: /summar|overview|describe|tell me about/ },
  { id: "stats", test: /statistic|stats|mean|median|average|distribution|min|max/ },
  { id: "monthly", test: /month|trend|over time|line|season|timeline/ },
  { id: "region", test: /region|north|south|east|west|revenue|bar|chart|top/ },
];

// Match free text to one of the recorded chats. Returns null when nothing fits.
export function matchDemoChat(text: string): DemoChat | null {
  const q = text.trim().toLowerCase();
  const exact = DEMO_CHATS.find((c) => c.question.toLowerCase() === q);
  if (exact) return exact;
  for (const rule of RULES) {
    if (rule.test.test(q)) return DEMO_CHATS.find((c) => c.id === rule.id) ?? null;
  }
  return null;
}
