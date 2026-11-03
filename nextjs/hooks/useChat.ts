"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { ChatMessage, DataSummary } from "@/lib/types";
import { buildSystemPrompt } from "@/lib/buildSystemPrompt";
import { formatSummaryString } from "@/lib/buildDataSummary";
import { extractChartSpec, stripChartSpec } from "@/lib/extractChartSpec";
import { DEMO_CHATS, DEMO_FILE_NAME, matchDemoChat } from "@/lib/demo/demo";

const MAX_REQUESTS = 30;
const SESSION_KEY = "datasense_session";

interface SessionData {
  id: string;
  count: number;
}

function getSession(): SessionData {
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) return JSON.parse(stored) as SessionData;
  } catch {
    // ignore
  }
  const newSession: SessionData = { id: uuidv4(), count: 0 };
  localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
  return newSession;
}

function incrementSession(session: SessionData): SessionData {
  const updated = { ...session, count: session.count + 1 };
  localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  return updated;
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useChat(summary: DataSummary | null, demo = false) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [requestCount, setRequestCount] = useState(0);
  const sessionRef = useRef<SessionData | null>(null);

  useEffect(() => {
    const session = getSession();
    sessionRef.current = session;
    setRequestCount(session.count);
  }, []);

  const sendMessage = useCallback(
    async (userText: string) => {
      if (!summary || isStreaming) return;

      // Demo mode: replay a recorded answer. No network call, no AI.
      if (demo) {
        const userMsg: ChatMessage = { id: uuidv4(), role: "user", content: userText, timestamp: new Date() };
        const assistantId = uuidv4();
        setMessages((prev) => [
          ...prev,
          userMsg,
          { id: assistantId, role: "assistant", content: "", timestamp: new Date(), isStreaming: true },
        ]);
        setIsStreaming(true);
        await sleep(600);

        let text: string;
        let chartSpec: ChatMessage["chartSpec"];
        const chat = summary.fileName === DEMO_FILE_NAME ? matchDemoChat(userText) : null;
        if (chat) {
          text = chat.answer;
          chartSpec = chat.chartSpec;
        } else if (summary.fileName !== DEMO_FILE_NAME) {
          text = "Live AI is switched off in this demo, so I can only answer questions about the **sample dataset**. Remove this file and load the sample dataset to see recorded example chats.";
        } else {
          text = "This is a recorded demo, so I can only replay the example questions:\n\n" +
            DEMO_CHATS.map((c) => `* ${c.question}`).join("\n");
        }

        const step = Math.max(2, Math.ceil(text.length / 90));
        for (let i = step; i < text.length; i += step) {
          setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: text.slice(0, i) } : m)));
          await sleep(18);
        }
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: text, chartSpec, isStreaming: false } : m))
        );
        setIsStreaming(false);
        return;
      }

      const session = sessionRef.current!;
      if (session.count >= MAX_REQUESTS) return;

      // Display the raw user text in UI
      const userMsg: ChatMessage = {
        id: uuidv4(),
        role: "user",
        content: userText,
        timestamp: new Date(),
      };

      const assistantId = uuidv4();
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: new Date(),
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setIsStreaming(true);

      const updatedSession = incrementSession(session);
      sessionRef.current = updatedSession;
      setRequestCount(updatedSession.count);

      // Match reference pattern exactly:
      // Send a single message with dataset summary prepended to the question.
      // No conversation history — each question gets full fresh data context.
      const dataSummary = formatSummaryString(summary);
      const apiMessages = [
        {
          role: "user",
          content: `Dataset summary:\n${dataSummary}\n\nQuestion: ${userText}`,
        },
      ];

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: apiMessages,
            systemPrompt: buildSystemPrompt(),
            sessionId: session.id,
          }),
        });

        if (!res.ok || !res.body) {
          const errData = await res.json().catch(() => ({}));
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? {
                    ...m,
                    content: errData.error ?? "Error getting response.",
                    isStreaming: false,
                  }
                : m
            )
          );
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId
                ? { ...m, content: stripChartSpec(accumulated) }
                : m
            )
          );
        }

        const chartSpec = extractChartSpec(accumulated);
        const finalContent = stripChartSpec(accumulated);

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: finalContent,
                  chartSpec: chartSpec ?? undefined,
                  isStreaming: false,
                }
              : m
          )
        );
      } catch {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: "Connection error. Please try again.",
                  isStreaming: false,
                }
              : m
          )
        );
      } finally {
        setIsStreaming(false);
      }
    },
    [summary, isStreaming, demo]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isStreaming,
    requestCount,
    maxRequests: MAX_REQUESTS,
    sendMessage,
    clearChat,
  };
}
