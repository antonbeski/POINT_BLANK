"use client";

import * as React from "react";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent } from
"@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
"@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription } from
"@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  LayoutDashboard,
  ChartCandlestick,
  ChartBarBig,
  ChartPie,
  ChartNoAxesCombined } from
"lucide-react";

type Interval = "1d" | "1wk" | "1mo";
type Period = "1mo" | "3mo" | "6mo" | "1y" | "2y";
type Ticker =
"AAPL" |
"MSFT" |
"GOOGL" |
"AMZN" |
"TSLA" |
"NVDA" |
"META" |
"BTC-USD" |
"ETH-USD";

interface OHLCV {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface NewsItem {
  id: string;
  title: string;
  publisher: string;
  time: string;
}

export interface StockDashboardProps {
  className?: string;
  initialTicker?: Ticker;
  defaultPeriod?: Period;
  defaultInterval?: Interval;
  onRunAnalysis?: (params: {
    ticker: Ticker;
    period: Period;
    interval: Interval;
    showIndicators: boolean;
  }) => void;
}

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

function seededRandom(seed: number) {
  let t = seed + 0x6d2b79f5;
  return function () {
    t += 0x6d2b79f5;
    let x = Math.imul(t ^ t >>> 15, 1 | t);
    x ^= x + Math.imul(x ^ x >>> 7, 61 | x);
    return ((x ^ x >>> 14) >>> 0) / 4294967296;
  };
}

function generateOHLCV(
seedKey: string,
points: number,
startPrice = 150)
: OHLCV[] {
  const rand = seededRandom(
    Array.from(seedKey).reduce((a, c) => a + c.charCodeAt(0), 0)
  );
  const data: OHLCV[] = [];
  let price = startPrice * (0.9 + rand() * 0.2);
  const start = Date.now() - points * 24 * 60 * 60 * 1000;
  for (let i = 0; i < points; i++) {
    const volBase = 5_000_000 + Math.floor(rand() * 10_000_000);
    const drift = (rand() - 0.5) * 2;
    const vol = 1 + (rand() - 0.5) * 0.05;
    price = Math.max(2, price * (1 + drift * 0.01)) * vol;
    const open = Math.max(2, price * (0.995 + rand() * 0.01));
    const close = Math.max(2, price * (0.995 + rand() * 0.01));
    const high = Math.max(open, close) * (1 + rand() * 0.01);
    const low = Math.min(open, close) * (1 - rand() * 0.01);
    data.push({
      date: new Date(start + i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
      volume: Math.floor(volBase * (0.8 + rand() * 0.4))
    });
  }
  return data;
}

function sma(values: number[], period: number): number[] {
  const out: number[] = [];
  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= period) sum -= values[i - period];
    out.push(i >= period - 1 ? Number((sum / period).toFixed(2)) : NaN);
  }
  return out;
}

function ema(values: number[], period: number): number[] {
  const k = 2 / (period + 1);
  const out: number[] = [];
  let prev = values[0];
  for (let i = 0; i < values.length; i++) {
    const val = values[i];
    prev = i === 0 ? val : val * k + prev * (1 - k);
    out.push(Number(prev.toFixed(2)));
  }
  return out;
}

function rsi(values: number[], period = 14): number[] {
  let gains = 0;
  let losses = 0;
  const out: number[] = Array(values.length).fill(NaN);
  for (let i = 1; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    if (i <= period) {
      if (diff >= 0) gains += diff;else
      losses -= diff;
      if (i === period) {
        const rs = losses === 0 ? 100 : gains / losses;
        out[i] = Number((100 - 100 / (1 + rs)).toFixed(2));
      }
    } else {
      const gain = diff > 0 ? diff : 0;
      const loss = diff < 0 ? -diff : 0;
      gains = (gains * (period - 1) + gain) / period;
      losses = (losses * (period - 1) + loss) / period;
      const rs = losses === 0 ? 100 : gains / losses;
      out[i] = Number((100 - 100 / (1 + rs)).toFixed(2));
    }
  }
  return out;
}

function bollingerBands(values: number[], period = 20, mult = 2) {
  const mid = sma(values, period);
  const up: number[] = [];
  const low: number[] = [];
  for (let i = 0; i < values.length; i++) {
    if (i < period - 1) {
      up.push(NaN);
      low.push(NaN);
      continue;
    }
    const window = values.slice(i - period + 1, i + 1);
    const mean = mid[i];
    const variance = window.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / period;
    const std = Math.sqrt(variance);
    up.push(Number((mean + mult * std).toFixed(2)));
    low.push(Number((mean - mult * std).toFixed(2)));
  }
  return { upper: up, middle: mid, lower: low };
}

function macd(values: number[], fast = 12, slow = 26, signalP = 9) {
  const fastE = ema(values, fast);
  const slowE = ema(values, slow);
  const macdLine = fastE.map((v, i) => Number((v - slowE[i]).toFixed(2)));
  const signal = ema(macdLine, signalP);
  const hist = macdLine.map((v, i) => Number((v - signal[i]).toFixed(2)));
  return { macdLine, signal, hist };
}

const NEWS: NewsItem[] = [
{
  id: "1",
  title: "Market opens higher as tech leads broad gains",
  publisher: "Point Blank Newswire",
  time: "2h ago"
},
{
  id: "2",
  title: "Analysts raise NVDA price target amid AI demand",
  publisher: "Equity Insights",
  time: "4h ago"
},
{
  id: "3",
  title: "BTC nears key resistance as volatility cools",
  publisher: "Crypto Daily",
  time: "6h ago"
},
{
  id: "4",
  title: "Fed minutes: inflation easing but risks remain",
  publisher: "MacroWatch",
  time: "8h ago"
}];


export default function StockDashboard({
  className,
  initialTicker = "AAPL",
  defaultPeriod = "3mo",
  defaultInterval = "1d",
  onRunAnalysis
}: StockDashboardProps) {
  const [activeNav, setActiveNav] = React.useState("dashboard");
  const [ticker, setTicker] = React.useState<Ticker>(initialTicker);
  const [period, setPeriod] = React.useState<Period>(defaultPeriod);
  const [interval, setInterval] = React.useState<Interval>(defaultInterval);
  const [showIndicators, setShowIndicators] = React.useState(true);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isTableOpen, setIsTableOpen] = React.useState(false);
  const [chartType, setChartType] = React.useState<"candles" | "line">("candles");
  const [logScale, setLogScale] = React.useState(false);

  const points = React.useMemo(() => {
    switch (period) {
      case "1mo":
        return 22;
      case "3mo":
        return 66;
      case "6mo":
        return 132;
      case "1y":
        return 264;
      case "2y":
        return 528;
      default:
        return 66;
    }
  }, [period]);

  const data = React.useMemo<OHLCV[]>(() => {
    const base =
    ticker === "BTC-USD" || ticker === "ETH-USD" ?
    ticker === "BTC-USD" ?
    45000 :
    2800 :
    150 + ticker.charCodeAt(0) % 50;
    return generateOHLCV(`${ticker}-${period}-${interval}`, points, base);
  }, [ticker, period, interval, points]);

  const closes = React.useMemo(() => data.map((d) => d.close), [data]);
  const ma20 = React.useMemo(() => sma(closes, 20), [closes]);
  const ma50 = React.useMemo(() => sma(closes, 50), [closes]);
  const ema12 = React.useMemo(() => ema(closes, 12), [closes]);
  const rsi14 = React.useMemo(() => rsi(closes, 14), [closes]);
  const bb = React.useMemo(() => bollingerBands(closes, 20, 2), [closes]);
  const macdCalc = React.useMemo(() => macd(closes), [closes]);

  const latest = data[data.length - 1];

  function handleRunAnalysis() {
    setIsLoading(true);
    onRunAnalysis?.({ ticker, period, interval, showIndicators });
    window.setTimeout(() => {
      setIsLoading(false);
      toast.success("Analysis completed", {
        description: `${ticker} • ${period} • ${interval}`
      });
    }, 1000 + Math.floor(Math.random() * 800));
  }

  function handleDownloadCSV() {
    try {
      const headers = ["date", "open", "high", "low", "close", "volume"];
      const csv =
      [headers.join(",")].
      concat(
        data.map((d) =>
        [d.date, d.open, d.high, d.low, d.close, d.volume].join(",")
        )
      ).
      join("\n") + "\n";

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${ticker}_${period}_${interval}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("CSV exported");
    } catch {
      toast.error("Failed to export CSV");
    }
  }

  return (
    <section
      className={cn(
        "w-full max-w-full rounded-[16px] bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/70 ring-1 ring-border relative",
        className
      )}
      aria-label="Stock market analysis dashboard">

      {/* Controls */}
      <div className="px-4 py-4 sm:px-6 sm:py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <Card className="bg-secondary/60 backdrop-blur ring-1 ring-border rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Controls</CardTitle>
              <CardDescription className="text-xs">Configure your analysis</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <div className="grid gap-2">
                <label className="text-xs text-muted-foreground" htmlFor="ticker">
                  Ticker
                </label>
                <Select
                  onValueChange={(v) => setTicker(v as Ticker)}
                  value={ticker}>

                  <SelectTrigger id="ticker" className="bg-card/70 ring-1 ring-border">
                    <SelectValue placeholder="Select a symbol" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="AAPL">AAPL — Apple</SelectItem>
                    <SelectItem value="MSFT">MSFT — Microsoft</SelectItem>
                    <SelectItem value="GOOGL">GOOGL — Alphabet</SelectItem>
                    <SelectItem value="AMZN">AMZN — Amazon</SelectItem>
                    <SelectItem value="TSLA">TSLA — Tesla</SelectItem>
                    <SelectItem value="NVDA">NVDA — NVIDIA</SelectItem>
                    <SelectItem value="META">META — Meta</SelectItem>
                    <SelectItem value="BTC-USD">BTC — Bitcoin</SelectItem>
                    <SelectItem value="ETH-USD">ETH — Ethereum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label className="text-xs text-muted-foreground" htmlFor="period">
                  Period
                </label>
                <Select value={period} onValueChange={(v) => setPeriod(v as Period)}>
                  <SelectTrigger id="period" className="bg-card/70 ring-1 ring-border">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="1mo">1 month</SelectItem>
                    <SelectItem value="3mo">3 months</SelectItem>
                    <SelectItem value="6mo">6 months</SelectItem>
                    <SelectItem value="1y">1 year</SelectItem>
                    <SelectItem value="2y">2 years</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <label className="text-xs text-muted-foreground" htmlFor="interval">
                  Interval
                </label>
                <Select value={interval} onValueChange={(v) => setInterval(v as Interval)}>
                  <SelectTrigger id="interval" className="bg-card/70 ring-1 ring-border">
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover">
                    <SelectItem value="1d">1 day</SelectItem>
                    <SelectItem value="1wk">1 week</SelectItem>
                    <SelectItem value="1mo">1 month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-card/60 px-3 py-2 ring-1 ring-border">
                <div className="min-w-0">
                  <p className="text-sm">Show indicators</p>
                  <p className="text-xs text-muted-foreground">MA, EMA, RSI, Bands</p>
                </div>
                <Switch
                  checked={showIndicators}
                  onCheckedChange={setShowIndicators}
                  aria-label="Toggle technical indicators" />

              </div>
              <Button
                onClick={handleRunAnalysis}
                disabled={isLoading}
                className="mt-1 h-11 rounded-xl bg-primary text-primary-foreground shadow-[0_10px_20px_rgba(155,140,255,0.25),inset_0_1px_0_rgba(255,255,255,0.15)] hover:translate-y-[-1px] hover:shadow-[0_16px_32px_rgba(155,140,255,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] transition-transform">

                {isLoading ?
                <span className="flex items-center gap-2">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground/60 border-t-transparent" />
                    Running...
                  </span> :

                <span className="flex items-center gap-2">
                    <ChartNoAxesCombined className="h-4 w-4" aria-hidden="true" />
                    Run Analysis
                  </span>
                }
              </Button>
            </CardContent>
          </Card>

          {/* Metrics */}
          <Card className="md:col-span-2 bg-secondary/60 backdrop-blur ring-1 ring-border rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <ChartBarBig className="h-4 w-4 text-primary" aria-hidden="true" />
                {ticker} Snapshot
              </CardTitle>
              <CardDescription className="text-xs">
                {period} • {interval}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {isLoading || !latest ?
              Array.from({ length: 5 }).map((_, i) =>
              <div key={i} className="rounded-xl bg-card/60 p-3 ring-1 ring-border shadow">
                    <Skeleton className="h-3 w-16 mb-2 rounded" />
                    <Skeleton className="h-6 w-24 rounded" />
                  </div>
              ) :

              <>
                  <Metric label="Date" value={latest.date} />
                  <Metric label="Open" value={`$${latest.open.toLocaleString()}`} />
                  <Metric label="High" value={`$${latest.high.toLocaleString()}`} />
                  <Metric label="Low" value={`$${latest.low.toLocaleString()}`} />
                  <Metric label="Close" value={`$${latest.close.toLocaleString()}`} />
                </>
              }
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Chart */}
      <div className="px-4 pb-4 sm:px-6 sm:pb-6">
        <Card className="overflow-hidden rounded-2xl bg-[radial-gradient(1200px_400px_at_20%_-20%,rgba(155,140,255,0.15),transparent),linear-gradient(180deg,rgba(18,19,23,0.9),rgba(18,19,23,0.6))] ring-1 ring-border shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <CardHeader className="flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-card ring-1 ring-border shadow">
                <ChartCandlestick className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <div>
                <CardTitle className="text-base">Price Action</CardTitle>
                <CardDescription className="text-xs">
                  Candlesticks, volume, RSI, Bands, MACD
                </CardDescription>
              </div>
            </div>
            {/* Pro controls */}
            <div className="flex items-center gap-2 text-xs">
              <button
                onClick={() => setChartType((t) => t === "candles" ? "line" : "candles")}
                className="rounded-lg px-2 py-1 ring-1 ring-border bg-card/60 hover:bg-card"
                aria-label="Toggle chart type">

                {chartType === "candles" ? "Line" : "Candles"}
              </button>
              <button
                onClick={() => setLogScale((v) => !v)}
                className="rounded-lg px-2 py-1 ring-1 ring-border bg-card/60 hover:bg-card"
                aria-label="Toggle log scale">

                {logScale ? "Log" : "Linear"}
              </button>
              <button
                onClick={() => document.getElementById("pb-chart-svg")?.dispatchEvent(new CustomEvent("pb-export"))}
                className="rounded-lg px-2 py-1 ring-1 ring-border bg-card/60 hover:bg-card">

                Export PNG
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full max-w-full">
              <ChartCanvas
                data={data}
                ma20={showIndicators ? ma20 : undefined}
                ma50={showIndicators ? ma50 : undefined}
                ema12={showIndicators ? ema12 : undefined}
                rsi14={showIndicators ? rsi14 : undefined}
                bbUpper={showIndicators ? bb.upper : undefined}
                bbMiddle={showIndicators ? bb.middle : undefined}
                bbLower={showIndicators ? bb.lower : undefined}
                macdLine={showIndicators ? macdCalc.macdLine : undefined}
                macdSignal={showIndicators ? macdCalc.signal : undefined}
                macdHist={showIndicators ? macdCalc.hist : undefined}
                isLoading={isLoading}
                chartType={chartType}
                logScale={logScale} />

            </div>
          </CardContent>
        </Card>
      </div>

      {/* News + Export */}
      <div className="px-4 pb-4 sm:px-6 sm:pb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 rounded-2xl bg-secondary/60 backdrop-blur ring-1 ring-border shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-card ring-1 ring-border shadow">
                    <ChartPie className="h-5 w-5 text-primary" aria-hidden="true" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Recent News</CardTitle>
                    <CardDescription className="text-xs">
                      Headlines related to {ticker}
                    </CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-3">
              {isLoading ?
              Array.from({ length: 3 }).map((_, i) =>
              <div
                key={i}
                className="rounded-xl bg-card/60 p-4 ring-1 ring-border shadow-[0_6px_18px_rgba(0,0,0,0.35)]">

                    <Skeleton className="h-4 w-2/3 mb-3 rounded" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-3 w-24 rounded" />
                      <Skeleton className="h-3 w-16 rounded" />
                    </div>
                  </div>
              ) :
              NEWS.length === 0 ?
              <EmptyState
                title="No news available"
                description="Try a different ticker or time range." /> :


              NEWS.map((n) =>
              <button
                key={n.id}
                onClick={() => toast.message("Opening article", { description: n.title })}
                className="text-left rounded-xl bg-card/60 p-4 ring-1 ring-border shadow-[0_6px_18px_rgba(0,0,0,0.35)] hover:translate-y-[-1px] hover:shadow-[0_14px_32px_rgba(0,0,0,0.45)] transition"
                aria-label={`Open article: ${n.title}`}>

                    <p className="text-sm sm:text-base font-medium leading-snug">
                      {n.title}
                    </p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="truncate">{n.publisher}</span>
                      <span aria-hidden="true">•</span>
                      <span>{n.time}</span>
                    </div>
                  </button>
              )
              }
            </CardContent>
          </Card>

          <Card className="rounded-2xl bg-secondary/60 backdrop-blur ring-1 ring-border shadow-[0_10px_30px_rgba(0,0,0,0.45)]">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Data Export</CardTitle>
              <CardDescription className="text-xs">
                Download or inspect recent data
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button
                variant="default"
                onClick={handleDownloadCSV}
                className="h-11 rounded-xl bg-primary text-primary-foreground shadow-[0_10px_20px_rgba(155,140,255,0.25),inset_0_1px_0_rgba(255,255,255,0.15)] hover:translate-y-[-1px] hover:shadow-[0_16px_32px_rgba(155,140,255,0.35),inset_0_1px_0_rgba(255,255,255,0.15)] transition">

                Export CSV
              </Button>

              <Collapsible open={isTableOpen} onOpenChange={setIsTableOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full rounded-xl bg-card/60 backdrop-blur ring-1 ring-border"
                    aria-expanded={isTableOpen}>

                    {isTableOpen ? "Hide Recent Data" : "Show Recent Data"}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-3 rounded-xl ring-1 ring-border overflow-hidden">
                  <div className="max-h-[300px] overflow-auto">
                    <Table className="min-w-full">
                      <TableCaption className="text-xs">Most recent 20 rows</TableCaption>
                      <TableHeader className="sticky top-0 bg-secondary/90 backdrop-blur">
                        <TableRow>
                          <TableHead className="whitespace-nowrap">Date</TableHead>
                          <TableHead className="whitespace-nowrap text-right">Open</TableHead>
                          <TableHead className="whitespace-nowrap text-right">High</TableHead>
                          <TableHead className="whitespace-nowrap text-right">Low</TableHead>
                          <TableHead className="whitespace-nowrap text-right">Close</TableHead>
                          <TableHead className="whitespace-nowrap text-right">Volume</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.
                        slice(-20).
                        reverse().
                        map((row) =>
                        <TableRow key={row.date}>
                              <TableCell className="text-xs">{row.date}</TableCell>
                              <TableCell className="text-xs text-right">
                                ${row.open.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-xs text-right">
                                ${row.high.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-xs text-right">
                                ${row.low.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-xs text-right">
                                ${row.close.toLocaleString()}
                              </TableCell>
                              <TableCell className="text-xs text-right">
                                {row.volume.toLocaleString()}
                              </TableCell>
                            </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>);

}

function Metric({ label, value }: {label: string;value: string;}) {
  return (
    <div className="rounded-xl bg-card/60 p-3 ring-1 ring-border shadow-[0_6px_18px_rgba(0,0,0,0.35)]">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-base sm:text-lg font-semibold">{value}</p>
    </div>);

}

function LegendDot({
  color,
  label,
  hollow = false
}: {color: string;label: string;hollow?: boolean;}) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className={cn(
          "inline-block h-2.5 w-2.5 rounded-full ring-1",
          hollow ? "bg-transparent" : ""
        )}
        style={{
          backgroundColor: hollow ? "transparent" : color,
          borderColor: color
        }}
        aria-hidden="true" />

      <span className="text-muted-foreground">{label}</span>
    </span>);

}

function EmptyState({
  title,
  description
}: {title: string;description: string;}) {
  return (
    <div className="rounded-xl bg-card/40 p-6 text-center ring-1 ring-border">
      <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-secondary">
        <ChartBarBig className="h-5 w-5 text-primary" aria-hidden="true" />
      </div>
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>);

}

function ChartCanvas({
  data,
  ma20,
  ma50,
  ema12,
  rsi14,
  bbUpper,
  bbMiddle,
  bbLower,
  macdLine,
  macdSignal,
  macdHist,
  isLoading,
  chartType = "candles",
  logScale = false
}: {data: OHLCV[];ma20?: number[];ma50?: number[];ema12?: number[];rsi14?: number[];bbUpper?: number[];bbMiddle?: number[];bbLower?: number[];macdLine?: number[];macdSignal?: number[];macdHist?: number[];isLoading: boolean;chartType?: "candles" | "line";logScale?: boolean;}) {
  if (isLoading) {
    return (
      <div className="p-4 sm:p-6">
        <Skeleton className="h-[340px] w-full rounded-xl" />
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2">
          <Skeleton className="h-6 w-full rounded" />
          <Skeleton className="h-6 w-full rounded" />
          <Skeleton className="h-6 w-full rounded hidden sm:block" />
        </div>
      </div>);

  }

  if (data.length === 0) {
    return (
      <div className="p-6">
        <EmptyState title="No data" description="Try adjusting your filters." />
      </div>);

  }

  // Dimensions
  const width = 1200;
  const height = 520; // increased to fit MACD
  const pad = 24;
  const volHeight = 70;
  const rsiHeight = 70;
  const macdHeight = 80;
  const gap = 6;
  const priceHeight = height - pad * 2 - volHeight - rsiHeight - macdHeight - gap * 3;

  // Zoom/pan state over indices
  const [range, setRange] = React.useState<{start: number;end: number;}>(() => ({ start: 0, end: data.length - 1 }));
  const visible = React.useMemo(() => data.slice(range.start, range.end + 1), [data, range]);

  const closes = visible.map((d) => d.close);
  const highs = visible.map((d) => d.high);
  const lows = visible.map((d) => d.low);
  const maxPriceLin = Math.max(...highs);
  const minPriceLin = Math.min(...lows);

  const log = (v: number) => Math.log(Math.max(1e-6, v));
  const maxPrice = logScale ? Math.max(...highs.map(log)) : maxPriceLin;
  const minPrice = logScale ? Math.min(...lows.map(log)) : minPriceLin;

  const maxVol = Math.max(...visible.map((d) => d.volume));
  const candlestickWidth = Math.max(2, Math.floor((width - pad * 2) / visible.length) - 2);
  const xStep = Math.max(3, Math.floor((width - pad * 2) / visible.length));

  const valToPriceY = (v: number) => {
    const val = logScale ? log(v) : v;
    return pad + (1 - (val - minPrice) / (maxPrice - minPrice || 1)) * priceHeight;
  };
  const yVol = (v: number) => pad + priceHeight + gap + (1 - v / (maxVol || 1)) * volHeight;
  const yRsi = (v: number) => pad + priceHeight + gap + volHeight + gap + (1 - v / 100) * rsiHeight;
  const yMacdBase = pad + priceHeight + gap + volHeight + gap + rsiHeight + gap;

  const getX = (i: number) => pad + i * xStep;

  // Crosshair state
  const [hover, setHover] = React.useState<number | null>(null);

  const handleMouseMove: React.MouseEventHandler<SVGSVGElement> = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - pad;
    const i = Math.max(0, Math.min(visible.length - 1, Math.round(x / xStep)));
    setHover(i);
  };
  const handleMouseLeave = () => setHover(null);

  // Wheel zoom
  const onWheel: React.WheelEventHandler<SVGSVGElement> = (e) => {
    e.preventDefault();
    const delta = Math.sign(e.deltaY);
    const span = range.end - range.start + 1;
    const center = range.start + Math.floor(span / 2);
    const newSpan = Math.max(20, Math.min(data.length, span + delta * 10));
    let start = Math.max(0, center - Math.floor(newSpan / 2));
    let end = Math.min(data.length - 1, start + newSpan - 1);
    start = Math.max(0, end - newSpan + 1);
    setRange({ start, end });
  };

  // Drag pan
  const dragRef = React.useRef<{startX: number;startRange: {start: number;end: number;};} | null>(null);
  const onMouseDown: React.MouseEventHandler<SVGSVGElement> = (e) => {
    dragRef.current = { startX: e.clientX, startRange: { ...range } };
  };
  const onMouseUp = () => dragRef.current = null;
  const onMouseMoveDrag: React.MouseEventHandler<SVGSVGElement> = (e) => {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const shift = Math.round(dx / xStep);
    let start = dragRef.current.startRange.start - shift;
    let end = dragRef.current.startRange.end - shift;
    if (start < 0) {
      end -= start;
      start = 0;
    }
    if (end > data.length - 1) {
      const over = end - (data.length - 1);
      start -= over;
      end = data.length - 1;
    }
    setRange({ start, end });
  };

  // Export PNG using SVG to canvas
  React.useEffect(() => {
    const el = document.getElementById("pb-chart-svg");
    if (!el) return;
    const handler = () => {
      const svgText = new XMLSerializer().serializeToString(el as Node);
      const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--color-card").trim() || "#0a0a0a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        canvas.toBlob((png) => {
          if (!png) return;
          const a = document.createElement("a");
          a.href = URL.createObjectURL(png);
          a.download = `chart_${Date.now()}.png`;
          a.click();
          URL.revokeObjectURL(a.href);
        });
        URL.revokeObjectURL(url);
      };
      img.src = url;
    };
    el.addEventListener("pb-export" as any, handler);
    return () => el.removeEventListener("pb-export" as any, handler);
  }, []);

  const makePath = (series?: number[]) => {
    if (!series) return "";
    let d = "";
    series.slice(range.start, range.end + 1).forEach((v, i) => {
      if (Number.isNaN(v)) return;
      const x = getX(i) + Math.floor(candlestickWidth / 2);
      const y = valToPriceY(v);
      d += d === "" ? `M ${x} ${y}` : ` L ${x} ${y}`;
    });
    return d;
  };

  const ma20Path = makePath(ma20);
  const ma50Path = makePath(ma50);
  const ema12Path = makePath(ema12);
  const bbUpperPath = makePath(bbUpper);
  const bbMiddlePath = makePath(bbMiddle);
  const bbLowerPath = makePath(bbLower);

  // MACD scale
  const macdVis = macdLine && macdSignal && macdHist ? macdLine.slice(range.start, range.end + 1).map((v, i) => ({
    macd: v,
    sig: macdSignal![range.start + i],
    hist: macdHist![range.start + i]
  })) : [];
  const macdMax = macdVis.length ? Math.max(...macdVis.map((v) => Math.max(v.macd, v.sig, v.hist))) : 1;
  const macdMin = macdVis.length ? Math.min(...macdVis.map((v) => Math.min(v.macd, v.sig, v.hist))) : -1;
  const yMacd = (v: number) => yMacdBase + (1 - (v - macdMin) / (macdMax - macdMin || 1)) * macdHeight;

  const hoverDatum = hover != null ? visible[hover] : null;

  return (
    <div className="p-3 sm:p-4">
      <div className="relative min-w-0 overflow-hidden rounded-xl bg-card/40 ring-1 ring-border shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
        <svg
          id="pb-chart-svg"
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height="auto"
          role="img"
          aria-label="Candlestick chart with indicators"
          className="block cursor-crosshair select-none"
          preserveAspectRatio="none"
          onMouseMove={(e) => {handleMouseMove(e);onMouseMoveDrag(e);}}
          onMouseLeave={handleMouseLeave}
          onWheel={onWheel}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}>

          <defs>
            <linearGradient id="volGrad" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          {/* Price grid lines */}
          {Array.from({ length: 4 }).map((_, i) => {
            const y = pad + i / 4 * priceHeight;
            return (
              <line
                key={`g${i}`}
                x1={pad}
                x2={width - pad}
                y1={y}
                y2={y}
                stroke="var(--border)"
                strokeOpacity="0.6"
                strokeWidth="1" />);


          })}

          {/* Price area/line optional */}
          {chartType === "line" &&
          <>
              <path d={makePath(closes)} fill="none" stroke="#3b82f6" strokeWidth="1.8" />
            </>
          }

          {/* Candlesticks */}
          {chartType === "candles" && visible.map((d, i) => {
            const x = getX(i);
            const isUp = d.close >= d.open;
            const color = isUp ? "#10b981" : "#ef4444";
            const yOpen = valToPriceY(d.open);
            const yClose = valToPriceY(d.close);
            const yHigh = valToPriceY(d.high);
            const yLow = valToPriceY(d.low);
            const bodyY = Math.min(yOpen, yClose);
            const bodyH = Math.max(2, Math.abs(yClose - yOpen));
            return (
              <g key={d.date}>
                <line
                  x1={x + candlestickWidth / 2}
                  x2={x + candlestickWidth / 2}
                  y1={yHigh}
                  y2={yLow}
                  stroke={color}
                  strokeWidth="1.2"
                  opacity="0.9" />

                <rect
                  x={x}
                  y={bodyY}
                  width={candlestickWidth}
                  height={bodyH}
                  fill={color}
                  opacity="0.9"
                  rx="2" />

              </g>);

          })}

          {/* Price lines */}
          {ma20 && <path d={ma20Path} fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" opacity="0.9" />}
          {ma50 && <path d={ma50Path} fill="none" stroke="#f97316" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" opacity="0.9" />}
          {ema12 && <path d={ema12Path} fill="none" stroke="#a855f7" strokeWidth="1.2" strokeDasharray="4 3" strokeLinejoin="round" strokeLinecap="round" opacity="0.9" />}

          {/* Bollinger Bands */}
          {bbUpper && <path d={bbUpperPath} fill="none" stroke="#06b6d4" strokeOpacity="0.6" strokeWidth="1" />}
          {bbLower && <path d={bbLowerPath} fill="none" stroke="#06b6d4" strokeOpacity="0.6" strokeWidth="1" />}
          {bbMiddle && <path d={bbMiddlePath} fill="none" stroke="#06b6d4" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="2 2" />}

          {/* Volume bars */}
          {visible.map((d, i) => {
            const x = getX(i);
            const y = yVol(d.volume);
            const h = pad + priceHeight + gap + volHeight - y;
            return (
              <rect key={`v${i}`} x={x} y={y} width={Math.max(1, candlestickWidth)} height={h} fill="url(#volGrad)" />);

          })}

          {/* RSI subplot */}
          <line x1={pad} x2={width - pad} y1={yRsi(70)} y2={yRsi(70)} stroke="var(--border)" strokeOpacity="0.7" strokeDasharray="4 4" />
          <line x1={pad} x2={width - pad} y1={yRsi(30)} y2={yRsi(30)} stroke="var(--border)" strokeOpacity="0.7" strokeDasharray="4 4" />
          {rsi14 &&
          <path
            d={function () {let d = "";rsi14.slice(range.start, range.end + 1).forEach((v, i) => {if (Number.isNaN(v)) return;const x = getX(i) + Math.floor(candlestickWidth / 2);const y = yRsi(v);d += d === "" ? `M ${x} ${y}` : ` L ${x} ${y}`;});return d;}()}
            fill="none"
            stroke="#eab308"
            strokeWidth="1.2"
            opacity="0.95" />

          }

          {/* MACD subplot */}
          <line x1={pad} x2={width - pad} y1={yMacd(0)} y2={yMacd(0)} stroke="var(--border)" strokeOpacity="0.5" />
          {macdVis.map((v, i) => {
            const x = getX(i);
            const y0 = yMacd(0);
            const y = yMacd(v.hist);
            const h = Math.abs(y - y0);
            return (
              <rect key={`mh${i}`} x={x} y={Math.min(y, y0)} width={Math.max(1, candlestickWidth)} height={h} fill={v.hist >= 0 ? "#10b981" : "#ef4444"} opacity="0.6" />);

          })}
          {macdLine &&
          <path
            d={function () {let d = "";macdLine.slice(range.start, range.end + 1).forEach((v, i) => {const x = getX(i) + Math.floor(candlestickWidth / 2);const y = yMacd(v);d += d === "" ? `M ${x} ${y}` : ` L ${x} ${y}`;});return d;}()}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="1.2" />

          }
          {macdSignal &&
          <path
            d={function () {let d = "";macdSignal.slice(range.start, range.end + 1).forEach((v, i) => {const x = getX(i) + Math.floor(candlestickWidth / 2);const y = yMacd(v);d += d === "" ? `M ${x} ${y}` : ` L ${x} ${y}`;});return d;}()}
            fill="none"
            stroke="#ef4444"
            strokeWidth="1.2" />

          }

          {/* Crosshair */}
          {hover != null &&
          <g>
              <line x1={getX(hover) + candlestickWidth / 2} x2={getX(hover) + candlestickWidth / 2} y1={pad} y2={height - pad} stroke="var(--border)" strokeDasharray="3 3" />
            </g>
          }

          {/* Axes labels */}
          <text x={pad} y={pad - 6} fontSize="10" fill="var(--muted-foreground)">{`High ${(logScale ? Math.exp(maxPrice) : maxPriceLin).toFixed(2)}`}</text>
          <text x={pad} y={pad + priceHeight + gap + volHeight + gap + rsiHeight + gap + macdHeight + 14} fontSize="10" fill="var(--muted-foreground)">MACD</text>
        </svg>

        {/* Tooltip */}
        {hoverDatum &&
        <div className="pointer-events-none absolute left-3 top-3 rounded-lg bg-card/90 px-3 py-2 text-xs ring-1 ring-border shadow">
            <div className="font-medium">{hoverDatum.date}</div>
            <div className="mt-1 grid grid-cols-2 gap-x-4 gap-y-1">
              <span className="text-muted-foreground">O</span><span>${hoverDatum.open.toLocaleString()}</span>
              <span className="text-muted-foreground">H</span><span>${hoverDatum.high.toLocaleString()}</span>
              <span className="text-muted-foreground">L</span><span>${hoverDatum.low.toLocaleString()}</span>
              <span className="text-muted-foreground">C</span><span>${hoverDatum.close.toLocaleString()}</span>
              <span className="text-muted-foreground">Vol</span><span>{hoverDatum.volume.toLocaleString()}</span>
            </div>
          </div>
        }

        {/* Bottom help bar */}
        <div className="absolute bottom-2 right-3 rounded-md bg-card/80 px-2 py-1 text-[10px] text-muted-foreground ring-1 ring-border">
          Scroll to zoom • Drag to pan • Click Export for PNG
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
        <LegendDot color="#10b981" label="Bull" />
        <LegendDot color="#ef4444" label="Bear" />
        <LegendDot color="#3b82f6" label="MA20" />
        <LegendDot color="#f97316" label="MA50" />
        <LegendDot color="#a855f7" label="EMA12" />
        <LegendDot color="#06b6d4" label="BB" />
        <LegendDot color="#eab308" label="RSI" />
      </div>
    </div>);

}