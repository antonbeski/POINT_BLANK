"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StockDashboard, { StockDashboardProps } from "@/components/StockDashboard";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Toaster } from "sonner";
import { toast } from "sonner";
import { authClient, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { User, LogOut, Crown } from "lucide-react";

type View = "dashboard" | "analysis" | "portfolio" | "news" | "settings";

export default function Page() {
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();
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

  const handleSignOut = async () => {
    const token = localStorage.getItem("bearer_token");
    const { error } = await authClient.signOut({
      fetchOptions: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });
    
    if (error?.code) {
      toast.error("Failed to sign out");
    } else {
      localStorage.removeItem("bearer_token");
      refetch();
      toast.success("Signed out successfully");
      router.push("/");
    }
  };

  return (
    <div className="min-h-dvh w-full bg-background text-foreground">
      <Toaster richColors theme="dark" />

      {/* Header with Auth */}
      <header className="border-b border-border/60 bg-background/60 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto max-w-[120rem] px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-heading font-bold">POINT BLANK</h1>
              <span className="text-xs text-muted-foreground">Market Intelligence</span>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/pricing")}
                className="gap-2"
              >
                <Crown className="h-4 w-4" />
                <span className="hidden sm:inline">Pricing</span>
              </Button>

              {isPending ? (
                <div className="h-9 w-20 animate-pulse rounded-md bg-muted" />
              ) : session?.user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="hidden sm:inline">{session.user.name}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSignOut}
                    className="gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden sm:inline">Sign out</span>
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push("/login")}
                  >
                    Sign in
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => router.push("/register")}
                  >
                    Get started
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
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