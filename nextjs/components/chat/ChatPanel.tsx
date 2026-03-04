"use client";

import { useEffect, useRef } from "react";
import { ChatMessage as ChatMessageType, DataSummary } from "@/lib/types";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";

interface ChatPanelProps {
  messages: ChatMessageType[];
  isStreaming: boolean;
  requestCount: number;
  maxRequests: number;
  summary: DataSummary | null;
  onSend: (text: string) => void;
}

export function ChatPanel({
  messages,
  isStreaming,
  requestCount,
  maxRequests,
  summary,
  onSend,
}: ChatPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages or streaming updates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-gradient-card border border-crimson/20 rounded-2xl overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border-subtle">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-crimson" />
          <span className="text-sm font-semibold text-gray-200">AI Chat</span>
        </div>
        {summary && (
          <span className="text-xs text-gray-500">{summary.fileName}</span>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5 min-h-0">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center gap-4 py-12">
            <div className="w-16 h-16 rounded-2xl bg-surface-overlay border border-crimson/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-crimson/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            {summary ? (
              <>
                <div>
                  <p className="text-gray-300 font-medium">Ready to analyze {summary.fileName}</p>
                  <p className="text-sm text-gray-500 mt-1">Ask me anything about your dataset</p>
                </div>
                <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                  {[
                    "What are the key statistics?",
                    "Show a bar chart",
                    "Any missing values?",
                    "Summarize this dataset",
                  ].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => onSend(suggestion)}
                      disabled={isStreaming}
                      className="text-xs text-crimson border border-crimson/30 rounded-full px-3 py-1.5
                        hover:bg-crimson/10 transition-colors disabled:opacity-50"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-400">Upload a dataset to start chatting with AI</p>
                <p className="text-sm text-gray-600">Supports CSV, XLSX, and XLS files</p>
              </>
            )}
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSend={onSend}
        isStreaming={isStreaming}
        isDisabled={!summary}
        requestCount={requestCount}
        maxRequests={maxRequests}
      />
    </div>
  );
}
