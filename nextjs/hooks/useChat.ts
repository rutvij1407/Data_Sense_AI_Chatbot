"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { ChatMessage, DataSummary } from "@/lib/types";
import { buildSystemPrompt } from "@/lib/buildSystemPrompt";
import { formatSummaryString } from "@/lib/buildDataSummary";
import { extractChartSpec, stripChartSpec } from "@/lib/extractChartSpec";

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

export function useChat(summary: DataSummary | null) {
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
    [summary, isStreaming]
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
