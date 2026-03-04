import { NextRequest, NextResponse } from "next/server";
import { parseCsv, parseExcel } from "@/lib/parseDataset";
import { buildDataSummary } from "@/lib/buildDataSummary";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const fileName = file.name;
    const ext = fileName.split(".").pop()?.toLowerCase();

    let rows: Record<string, unknown>[];
    if (ext === "csv") {
      rows = await parseCsv(buffer);
    } else if (ext === "xlsx" || ext === "xls") {
      rows = parseExcel(buffer);
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload CSV or Excel files." },
        { status: 400 }
      );
    }

    const summary = buildDataSummary(fileName, rows);
    return NextResponse.json({ summary });
  } catch (error) {
    console.error("Parse error:", error);
    return NextResponse.json(
      { error: "Failed to parse file. Please check the file format." },
      { status: 500 }
    );
  }
}
