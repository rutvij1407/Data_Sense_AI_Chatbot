"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChatMessage as ChatMessageType } from "@/lib/types";
import { CodeBlock } from "./CodeBlock";
import { ChartRenderer } from "@/components/charts/ChartRenderer";

interface ChatMessageProps {
  message: ChatMessageType;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold
        ${isUser ? "bg-crimson text-white" : "bg-surface-overlay border border-crimson/40 text-crimson"}`}
      >
        {isUser ? "You" : "AI"}
      </div>

      {/* Bubble */}
      <div className={`flex-1 max-w-[85%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-2`}>
        <div className={isUser ? "message-user ml-auto" : "message-assistant"}>
          {isUser ? (
            <p className="text-sm text-gray-200 whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none
              prose-headings:text-gray-100 prose-headings:font-semibold
              prose-p:text-gray-300 prose-p:leading-relaxed
              prose-strong:text-white prose-strong:font-semibold
              prose-li:text-gray-300
              prose-table:text-sm prose-th:text-crimson prose-th:font-semibold
              prose-td:text-gray-300 prose-td:border-border-subtle
              prose-a:text-crimson prose-a:no-underline hover:prose-a:underline"
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  code({ className, children, ...props }) {
                    const match = /language-(\w+)/.exec(className || "");
                    const isBlock = !props.ref && String(children).includes("\n");
                    if (isBlock || match) {
                      return (
                        <CodeBlock
                          language={match?.[1] ?? "text"}
                          code={String(children).replace(/\n$/, "")}
                        />
                      );
                    }
                    return (
                      <code className="bg-surface-raised px-1.5 py-0.5 rounded text-crimson-pale font-mono text-xs" {...props}>
                        {children}
                      </code>
                    );
                  },
                }}
              >
                {message.content || (message.isStreaming ? "▋" : "")}
              </ReactMarkdown>
            </div>
          )}

          {/* Streaming cursor */}
          {message.isStreaming && message.content && (
            <span className="inline-block w-2 h-4 bg-crimson ml-1 animate-pulse-crimson align-middle" />
          )}
        </div>

        {/* Chart */}
        {message.chartSpec && <ChartRenderer chartSpec={message.chartSpec} />}

        {/* Timestamp */}
        <p className="text-xs text-gray-600 px-1">
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}
