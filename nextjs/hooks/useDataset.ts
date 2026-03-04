"use client";

import { useState, useCallback } from "react";
import { DataSummary } from "@/lib/types";

export function useDataset() {
  const [summary, setSummary] = useState<DataSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/parse", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error ?? "Failed to parse file");
        return;
      }

      setSummary(data.summary);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearDataset = useCallback(() => {
    setSummary(null);
    setError(null);
  }, []);

  return { summary, isLoading, error, uploadFile, clearDataset };
}
