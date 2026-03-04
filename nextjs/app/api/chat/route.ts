import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";

const MAX_REQUESTS = 30;
const sessionCounts = new Map<string, number>();

export async function POST(req: NextRequest) {
  try {
    // Check API key first — before initializing the client
    if (!process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY is not configured. Add it in Vercel → Settings → Environment Variables." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const { messages, systemPrompt, sessionId } = await req.json();

    // Session limit
    const count = sessionCounts.get(sessionId) ?? 0;
    if (count >= MAX_REQUESTS) {
      return new Response(
        JSON.stringify({ error: "Session request limit reached (30/30)" }),
        { status: 429, headers: { "Content-Type": "application/json" } }
      );
    }
    sessionCounts.set(sessionId, count + 1);

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const stream = await client.messages.stream({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              controller.enqueue(encoder.encode(chunk.delta.text));
            }
          }
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error) {
    console.error("Chat error:", error);
    const message = error instanceof Error ? error.message : "Failed to get AI response";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
