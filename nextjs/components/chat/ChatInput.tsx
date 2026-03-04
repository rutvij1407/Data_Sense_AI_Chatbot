"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";

interface ChatInputProps {
  onSend: (text: string) => void;
  isStreaming: boolean;
  isDisabled: boolean;
  requestCount: number;
  maxRequests: number;
}

export function ChatInput({
  onSend,
  isStreaming,
  isDisabled,
  requestCount,
  maxRequests,
}: ChatInputProps) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const remaining = maxRequests - requestCount;
  const canSend = !isStreaming && !isDisabled && value.trim().length > 0 && remaining > 0;

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
  }, [value]);

  const handleSend = () => {
    if (!canSend) return;
    onSend(value.trim());
    setValue("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border-subtle bg-surface-raised/50 backdrop-blur-sm p-4">
      {remaining === 0 && (
        <div className="mb-3 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-center">
          <p className="text-sm text-red-400">
            Session limit reached (30/30). Refresh the page to start a new session.
          </p>
        </div>
      )}

      <div className={`flex gap-3 items-end border rounded-2xl transition-all duration-200 p-3
        ${canSend ? "border-crimson/50 shadow-crimson" : "border-border-subtle"}
        ${isDisabled ? "opacity-50" : ""}
        bg-surface-overlay`}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isDisabled || remaining === 0}
          placeholder={
            !isDisabled
              ? remaining === 0
                ? "Session limit reached"
                : "Ask about your data... (Enter to send, Shift+Enter for newline)"
              : "Upload a dataset to start chatting..."
          }
          className="flex-1 bg-transparent text-sm text-gray-200 placeholder-gray-600 resize-none outline-none leading-relaxed min-h-[20px]"
          rows={1}
        />

        <div className="flex items-center gap-2 flex-shrink-0">
          {isStreaming ? (
            <div className="w-8 h-8 flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-crimson border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <button
              onClick={handleSend}
              disabled={!canSend}
              className="w-8 h-8 rounded-full bg-gradient-crimson flex items-center justify-center shadow-crimson
                transition-all duration-200 hover:shadow-crimson-lg hover:-translate-y-0.5
                disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center mt-2 px-1">
        <p className="text-xs text-gray-600">
          {isDisabled ? "Upload a file to enable chat" : "Shift+Enter for new line"}
        </p>
        <p className="text-xs text-gray-600">
          {remaining > 0 ? (
            <>{remaining} <span className="text-gray-700">requests remaining</span></>
          ) : (
            <span className="text-red-500">Limit reached</span>
          )}
        </p>
      </div>
    </div>
  );
}
