"use client";

import * as React from "react";
import Link from "next/link";
import StockDashboard, { StockDashboardProps } from "@/components/StockDashboard";
import { Toaster } from "sonner";

type View = "dashboard" | "analysis" | "portfolio" | "news" | "settings";

export default function Page() {
  const [view, setView] = React.useState<View>("dashboard");
  const [lastRun, setLastRun] = React.useState<
    | {
        ticker: StockDashboardProps["initialTicker"];
        period: StockDashboardProps["defaultPeriod"];
        interval: StockDashboardProps["defaultInterval"];
        showIndicators: boolean;
        at: number;
      }
    | null
  >(null);

  const handleRunAnalysis = React.useCallback(
    (params: {
      ticker: NonNullable<StockDashboardProps["initialTicker"]>;
      period: NonNullable<StockDashboardProps["defaultPeriod"]>;
      interval: NonNullable<StockDashboardProps["defaultInterval"]>;
      showIndicators: boolean;
    }) => {
      setLastRun({ ...params, at: Date.now() });
    },
    []
  );

  return (
    <div className="min-h-dvh w-full bg-background text-foreground">
      <Toaster richColors theme="dark" />

      {/* App Header */}
      <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/50">
        <div className="mx-auto flex max-w-[120rem] items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary ring-1 ring-border shadow-[inset_0_1px_0_rgba(255,255,255,0.04),0_8px_24px_rgba(0,0,0,0.4)]">
              <span className="text-sm font-semibold text-primary">PB</span>
            </div>
            <div className="leading-tight">
              <p className="font-heading text-base tracking-wide">Point Blank</p>
              <p className="text-xs text-muted-foreground">Market Intelligence</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="#"
              className="hidden sm:block text-xs text-muted-foreground hover:text-foreground transition"
            >
              Help
            </Link>
          </div>
        </div>

        {lastRun && (
          <div className="border-t border-border/60 bg-secondary/60 px-4 py-2 text-xs sm:px-6">
            <div className="mx-auto flex max-w-[120rem] flex-wrap items-center justify-between gap-2">
              <p className="truncate">
                Last analysis: {lastRun.ticker} • {lastRun.period} • {lastRun.interval} •{" "}
                {lastRun.showIndicators ? "Indicators ON" : "Indicators OFF"} •{" "}
                {new Date(lastRun.at).toLocaleTimeString()}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLastRun(null)}
                  className="rounded-lg px-2 py-1 text-muted-foreground ring-1 ring-border hover:bg-card/60 hover:text-foreground transition"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* App Content */}
      <main className="mx-auto w-full max-w-[120rem] px-4 py-6 sm:px-6 sm:py-8">
        <div className="grid grid-cols-1 gap-6 lg:gap-8">
          {/* Primary workspace area swaps based on app-level view */}
          {view === "dashboard" && (
            <StockDashboard
              className="shadow-[0_40px_120px_rgba(0,0,0,0.5)]"
              initialTicker="AAPL"
              defaultPeriod="3mo"
              defaultInterval="1d"
              onRunAnalysis={handleRunAnalysis}
            />
          )}

          {view === "analysis" && (
            <StockDashboard
              className="shadow-[0_40px_120px_rgba(0,0,0,0.5)]"
              initialTicker="NVDA"
              defaultPeriod="6mo"
              defaultInterval="1d"
              onRunAnalysis={handleRunAnalysis}
            />
          )}

          {view === "portfolio" && (
            <div className="rounded-2xl ring-1 ring-border bg-card/60 backdrop-blur p-6 text-sm text-muted-foreground">
              <p className="mb-3 text-foreground">Portfolio coming soon</p>
              <p>
                This area will include holdings, P/L, allocation charts, and risk metrics. Use the
                Dashboard or Analysis views meanwhile.
              </p>
            </div>
          )}

          {view === "news" && (
            <div className="rounded-2xl ring-1 ring-border bg-card/60 backdrop-blur p-6 text-sm text-muted-foreground">
              <p className="mb-3 text-foreground">News hub coming soon</p>
              <p>Aggregate headlines, watchlist filters, and sentiment will appear here.</p>
            </div>
          )}

          {view === "settings" && (
            <div className="rounded-2xl ring-1 ring-border bg-card/60 backdrop-blur p-6 text-sm text-muted-foreground">
              <p className="mb-3 text-foreground">Settings</p>
              <ul className="list-disc pl-5">
                <li>Theme: Dark</li>
                <li>Data refresh: Manual</li>
                <li>Exports: CSV</li>
              </ul>
            </div>
          )}
        </div>
      </main>

      {/* App Footer */}
      <footer className="border-t border-border/60 bg-background/60 px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-[120rem] flex-col items-center justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Point Blank Analytics. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-foreground transition">
              Privacy
            </Link>
            <Link href="#" className="hover:text-foreground transition">
              Terms
            </Link>
            <Link href="#" className="hover:text-foreground transition">
              Status
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}