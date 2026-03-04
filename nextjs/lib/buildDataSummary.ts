import { DataSummary, ParsedColumn, NumericStats } from "./types";

export function buildDataSummary(
  fileName: string,
  rows: Record<string, unknown>[]
): DataSummary {
  if (rows.length === 0) {
    return {
      fileName,
      rowCount: 0,
      columnCount: 0,
      columns: [],
      sample: [],
      numericStats: {},
      missingValues: {},
      categoryValueCounts: {},
    };
  }

  const columnNames = Object.keys(rows[0]);

  // Infer dtype from first non-null value
  const columns: ParsedColumn[] = columnNames.map((name) => {
    const firstVal = rows.find((r) => r[name] != null)?.[name];
    let dtype: ParsedColumn["dtype"] = "unknown";
    if (typeof firstVal === "number") dtype = "number";
    else if (typeof firstVal === "boolean") dtype = "boolean";
    else if (typeof firstVal === "string") {
      if (!isNaN(Date.parse(firstVal as string)) && firstVal.includes("-"))
        dtype = "date";
      else dtype = "string";
    }
    return { name, dtype };
  });

  // Count missing values
  const missingValues: Record<string, number> = {};
  for (const col of columnNames) {
    missingValues[col] = rows.filter(
      (r) => r[col] == null || r[col] === ""
    ).length;
  }

  // Numeric stats
  const numericStats: Record<string, NumericStats> = {};
  for (const col of columns.filter((c) => c.dtype === "number")) {
    const vals = rows
      .map((r) => r[col.name] as number)
      .filter((v) => v != null && !isNaN(v))
      .sort((a, b) => a - b);

    if (vals.length === 0) continue;
    const sum = vals.reduce((a, b) => a + b, 0);
    const mean = sum / vals.length;
    const median = vals[Math.floor(vals.length / 2)];
    const variance =
      vals.reduce((acc, v) => acc + (v - mean) ** 2, 0) / vals.length;

    numericStats[col.name] = {
      min: vals[0],
      max: vals[vals.length - 1],
      mean: +mean.toFixed(4),
      median,
      stddev: +Math.sqrt(variance).toFixed(4),
      count: vals.length,
    };
  }

  // Category value counts
  const categoryValueCounts: Record<string, Record<string, number>> = {};
  for (const col of columns.filter(
    (c) => c.dtype === "string" || c.dtype === "date"
  )) {
    const counts: Record<string, number> = {};
    for (const row of rows) {
      const v = String(row[col.name] ?? "");
      counts[v] = (counts[v] ?? 0) + 1;
    }
    const uniqueCount = Object.keys(counts).length;
    if (uniqueCount <= 100) {
      const top20 = Object.entries(counts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20)
        .reduce((acc, [k, v]) => ({ ...acc, [k]: v }), {});
      categoryValueCounts[col.name] = top20;
    }
  }

  return {
    fileName,
    rowCount: rows.length,
    columnCount: columnNames.length,
    columns,
    sample: rows.slice(0, 10),
    numericStats,
    missingValues,
    categoryValueCounts,
  };
}

export function formatSummaryString(summary: DataSummary): string {
  return JSON.stringify({
    columns: summary.columns.map((c) => `${c.name} (${c.dtype})`),
    shape: { rows: summary.rowCount, columns: summary.columnCount },
    dtypes: Object.fromEntries(summary.columns.map((c) => [c.name, c.dtype])),
    sample: summary.sample,
    numeric_stats: summary.numericStats,
    missing: summary.missingValues,
    category_values: summary.categoryValueCounts,
  });
}
