"use client";

import { useDataset } from "@/hooks/useDataset";
import { useChat } from "@/hooks/useChat";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MetricCards } from "@/components/dataset/MetricCards";
import { DataPreviewTable } from "@/components/dataset/DataPreviewTable";
import { ChatPanel } from "@/components/chat/ChatPanel";

export default function Home() {
  const { summary, isLoading, error, uploadFile, clearDataset } = useDataset();
  const { messages, isStreaming, requestCount, maxRequests, sendMessage, clearChat } = useChat(summary);

  const handleClearDataset = () => {
    clearDataset();
    clearChat();
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        summary={summary}
        isLoading={isLoading}
        error={error}
        onFileAccepted={uploadFile}
        onClearDataset={handleClearDataset}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header requestCount={requestCount} maxRequests={maxRequests} />

        <main className="flex-1 overflow-y-auto">
          {summary ? (
            <div className="p-6 space-y-6">
              {/* Metric cards */}
              <MetricCards summary={summary} />

              {/* Two-column layout: data preview left, chat right */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
                <DataPreviewTable summary={summary} />
                <div className="h-[650px]">
                  <ChatPanel
                    messages={messages}
                    isStreaming={isStreaming}
                    requestCount={requestCount}
                    maxRequests={maxRequests}
                    summary={summary}
                    onSend={sendMessage}
                  />
                </div>
              </div>
            </div>
          ) : (
            /* Welcome / landing state */
            <div className="flex flex-col items-center justify-center h-full px-6 py-16 text-center">
              <div className="max-w-2xl w-full space-y-8">
                {/* Hero */}
                <div className="space-y-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-crimson mx-auto flex items-center justify-center shadow-crimson-lg">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h1 className="text-4xl font-bold text-white">
                    DataSense <span className="text-crimson">AI</span>
                  </h1>
                  <p className="text-lg text-gray-400 max-w-lg mx-auto">
                    Upload your dataset and chat with AI to get instant insights, statistics, and interactive visualizations.
                  </p>
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {
                      icon: (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                      ),
                      title: "Drag & Drop Upload",
                      desc: "CSV, XLSX, and XLS files supported",
                    },
                    {
                      icon: (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                      ),
                      title: "AI-Powered Chat",
                      desc: "Ask questions in plain English",
                    },
                    {
                      icon: (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                      ),
                      title: "Interactive Charts",
                      desc: "Auto-generated Plotly visualizations",
                    },
                  ].map((f) => (
                    <div key={f.title} className="bg-gradient-card border border-crimson/20 rounded-2xl p-5 text-left shadow-card">
                      <div className="text-crimson mb-3">{f.icon}</div>
                      <h3 className="font-semibold text-gray-200 text-sm">{f.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">{f.desc}</p>
                    </div>
                  ))}
                </div>

                <p className="text-sm text-gray-600">
                  Get started by uploading a file using the sidebar →
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
