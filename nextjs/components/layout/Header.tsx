"use client";

interface HeaderProps {
  requestCount: number;
  maxRequests: number;
}

export function Header({ requestCount, maxRequests }: HeaderProps) {
  const remaining = maxRequests - requestCount;
  const pct = (requestCount / maxRequests) * 100;

  return (
    <header className="h-16 border-b border-crimson/30 flex items-center justify-between px-6 bg-surface-raised/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="flex items-center gap-3">
        {/* Logo mark */}
        <div className="w-8 h-8 rounded-lg bg-gradient-crimson flex items-center justify-center shadow-crimson">
          <svg viewBox="0 0 24 24" className="w-5 h-5 text-white fill-current">
            <path d="M3 3h18v2H3V3zm0 4h12v2H3V7zm0 4h18v2H3v-2zm0 4h12v2H3v-2zm0 4h18v2H3v-2z" />
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-bold text-white leading-none">DataSense AI</h1>
          <p className="text-xs text-gray-400 leading-none mt-0.5">Intelligent Data Analysis</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Request counter */}
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-xs text-gray-400 leading-none">AI requests</p>
            <p className="text-sm font-semibold text-crimson leading-none mt-0.5">
              {requestCount}/{maxRequests}
            </p>
          </div>
          <div className="w-16 h-1.5 bg-surface-overlay rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-crimson rounded-full transition-all duration-500"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {remaining <= 5 && remaining > 0 && (
          <span className="text-xs text-crimson-pale bg-crimson/10 border border-crimson/30 px-2 py-0.5 rounded-full">
            {remaining} left
          </span>
        )}

        {remaining === 0 && (
          <span className="text-xs text-red-400 bg-red-900/20 border border-red-500/30 px-2 py-0.5 rounded-full">
            Limit reached
          </span>
        )}

        {/* Powered by badge */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 border border-border-subtle rounded-full px-3 py-1">
          <span>Powered by</span>
          <span className="text-crimson font-medium">Claude AI</span>
        </div>
      </div>
    </header>
  );
}
