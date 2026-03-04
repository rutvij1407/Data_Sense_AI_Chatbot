import { ChartSpec } from "./types";

export function extractChartSpec(text: string): ChartSpec | null {
  const match = text.match(/```chartspec\s*([\s\S]*?)```/);
  if (!match) return null;

  try {
    const parsed = JSON.parse(match[1].trim());
    if (!Array.isArray(parsed.data)) return null;
    return {
      data: parsed.data,
      layout: parsed.layout ?? {},
    };
  } catch {
    return null;
  }
}

export function stripChartSpec(text: string): string {
  return text.replace(/```chartspec[\s\S]*?```/g, "").trim();
}
