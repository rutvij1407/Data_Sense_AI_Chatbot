"use client";

import { useEffect, useState } from "react";

// null while loading. Falls back to demo mode if the config call fails, so no AI call is ever made by accident.
export function useDemoMode(): boolean | null {
  const [demo, setDemo] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => setDemo(Boolean(d.demo)))
      .catch(() => setDemo(true));
  }, []);

  return demo;
}
