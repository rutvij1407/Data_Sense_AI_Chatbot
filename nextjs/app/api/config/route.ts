export const runtime = "edge";
export const dynamic = "force-dynamic";

// Tells the browser whether to run in recorded demo mode.
// Demo mode is on when no API key is configured, or when DEMO_MODE is set to true.
export async function GET() {
  const demo = process.env.DEMO_MODE === "true" || !process.env.ANTHROPIC_API_KEY;
  return new Response(JSON.stringify({ demo }), {
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
