import Papa from "papaparse";
import * as XLSX from "xlsx";

export async function parseCsv(
  buffer: ArrayBuffer
): Promise<Record<string, unknown>[]> {
  const text = new TextDecoder().decode(buffer);
  const result = Papa.parse<Record<string, unknown>>(text, {
    header: true,
    dynamicTyping: true,
    skipEmptyLines: true,
  });
  return result.data;
}

export function parseExcel(buffer: ArrayBuffer): Record<string, unknown>[] {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: null,
  });
}
