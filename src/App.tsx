import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  CandleData,
  ChartType,
  IndicatorSettings,
  OrderBookLevel,
  RecentTrade,
  TickerInfo,
  TimeFrame,
  TradingSignal,
} from "./types";
import { fetchHistoricalKlines, LiveMarketStream } from "./services/marketData";
import { generateTradingSignals } from "./utils/indicators";
import { playSignalAlertSound } from "./utils/sound";
import { Header } from "./components/Header";
import { TradingViewChart } from "./components/TradingViewChart";
import { SignalPanel } from "./components/SignalPanel";
import { OrderBookTape } from "./components/OrderBookTape";
import { IndicatorDrawer } from "./components/IndicatorDrawer";
import { AiAnalysisModal } from "./components/AiAnalysisModal";
import { ApkDownloadModal } from "./components/ApkDownloadModal";
import { LossPreventionModal } from "./components/LossPreventionModal";
import { Watchlist } from "./components/Watchlist";
import { MobileBottomNav, MobileTab } from "./components/MobileBottomNav";
import { SignalAlertBanner } from "./components/SignalAlertBanner";
import { Wifi, Battery, BatteryCharging, Signal as SignalIcon, Smartphone, Download, ShieldCheck } from "lucide-react";

export default function App() {
  // State: Symbol & Timeframe
  const [symbol, setSymbol] = useState<string>("BTCUSDT");
  const [timeframe, setTimeframe] = useState<TimeFrame>("1m");
  const [chartType, setChartType] = useState<ChartType>("candlestick");

  // Modals for APK & Zero-Loss
  const [isApkModalOpen, setIsApkModalOpen] = useState(false);
  const [isLossModalOpen, setIsLossModalOpen] = useState(false);

  // State: Candles & Market Data
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceDelta, setPriceDelta] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // State: Order Book & Trades
  const [bids, setBids] = useState<OrderBookLevel[]>([]);
  const [asks, setAsks] = useState<OrderBookLevel[]>([]);
  const [trades, setTrades] = useState<RecentTrade[]>([]);

  // State: Signals
  const [activeSignal, setActiveSignal] = useState<TradingSignal | null>(null);
  const [signalHistory, setSignalHistory] = useState<TradingSignal[]>([]);
  const [floatingAlert, setFloatingAlert] = useState<TradingSignal | null>(null);

  // State: Indicators
  const [indicators, setIndicators] = useState<IndicatorSettings>({
    showEma20: true,
    showEma50: true,
    showEma200: false,
    showBollingerBands: true,
    showRsi: true,
    showMacd: false,
    showSuperTrend: true,
    showVolume: true,
  });
  const [isIndicatorDrawerOpen, setIsIndicatorDrawerOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // State: Sound & UI Mode
  const [audioAlertsEnabled, setAudioAlertsEnabled] = useState(true);
  const [isMobileFrameMode, setIsMobileFrameMode] = useState(false);
  const [mobileTab, setMobileTab] = useState<MobileTab>("CHART");
  const [isEcoMode, setIsEcoMode] = useState(false);

  // Auto-detect phone battery if supported by browser/WebAPK
  useEffect(() => {
    if (typeof navigator !== "undefined" && "getBattery" in navigator) {
      (navigator as any)
        .getBattery()
        .then((battery: any) => {
          if (battery.level <= 0.25 && !battery.charging) {
            setIsEcoMode(true);
          }
          battery.addEventListener("levelchange", () => {
            if (battery.level <= 0.2 && !battery.charging) {
              setIsEcoMode(true);
            }
          });
        })
        .catch(() => {});
    }
  }, []);

  // Watchlist
  const [watchlistTickers, setWatchlistTickers] = useState<TickerInfo[]>([
    { symbol: "BTCUSDT", name: "Bitcoin", price: 94350, change24h: 2.85, high24h: 95400, low24h: 92100, volume24h: "32.4K BTC", baseAsset: "BTC" },
    { symbol: "ETHUSDT", name: "Ethereum", price: 2748, change24h: 4.12, high24h: 2795, low24h: 2630, volume24h: "184.2K ETH", baseAsset: "ETH" },
    { symbol: "SOLUSDT", name: "Solana", price: 196.8, change24h: 6.94, high24h: 199.5, low24h: 182.1, volume24h: "890K SOL", baseAsset: "SOL" },
    { symbol: "BNBUSDT", name: "BNB", price: 638.5, change24h: 1.15, high24h: 644.0, low24h: 627.5, volume24h: "48K BNB", baseAsset: "BNB" },
    { symbol: "XRPUSDT", name: "XRP", price: 2.38, change24h: -0.78, high24h: 2.45, low24h: 2.31, volume24h: "12M XRP", baseAsset: "XRP" },
    { symbol: "DOGEUSDT", name: "Dogecoin", price: 0.264, change24h: 3.42, high24h: 0.276, low24h: 0.252, volume24h: "180M DOGE", baseAsset: "DOGE" },
  ]);

  const streamRef = useRef<LiveMarketStream | null>(null);
  const lastSignalIdRef = useRef<string>("");

  // Fetch initial klines whenever symbol or timeframe changes
  const loadMarketData = useCallback(async () => {
    setIsLoading(true);
    const data = await fetchHistoricalKlines(symbol, timeframe, 250);
    setCandles(data);

    if (data.length > 0) {
      const last = data[data.length - 1];
      setCurrentPrice(last.close);

      // Generate initial trading signals
      const { activeSignal: sig, signalHistory: hist } = generateTradingSignals(data, symbol, timeframe);
      setActiveSignal(sig);
      setSignalHistory(hist);

      // Initialize bids/asks around close price
      const initBids: OrderBookLevel[] = [];
      const initAsks: OrderBookLevel[] = [];
      let bSum = 0;
      let aSum = 0;
      for (let i = 1; i <= 6; i++) {
        const bPrice = Number((last.close - i * (last.close * 0.0003)).toFixed(2));
        const bAmt = Number((Math.random() * 2.5 + 0.3).toFixed(3));
        bSum += bAmt;
        initBids.push({ price: bPrice, amount: bAmt, total: Number(bSum.toFixed(3)) });

        const aPrice = Number((last.close + i * (last.close * 0.0003)).toFixed(2));
        const aAmt = Number((Math.random() * 2.5 + 0.3).toFixed(3));
        aSum += aAmt;
        initAsks.push({ price: aPrice, amount: aAmt, total: Number(aSum.toFixed(3)) });
      }
      setBids(initBids);
      setAsks(initAsks);

      // Initialize sample trade tape
      const initTrades: RecentTrade[] = [
        { id: "t-1", price: last.close, amount: 0.285, side: "buy", time: new Date().toLocaleTimeString() },
        { id: "t-2", price: last.close - 1, amount: 0.84, side: "sell", time: new Date().toLocaleTimeString() },
        { id: "t-3", price: last.close + 2, amount: 1.42, side: "buy", time: new Date().toLocaleTimeString() },
      ];
      setTrades(initTrades);
    }
    setIsLoading(false);
  }, [symbol, timeframe]);

  useEffect(() => {
    loadMarketData();
  }, [loadMarketData]);

  // Connect live streaming
  useEffect(() => {
    if (candles.length === 0) return;

    if (streamRef.current) {
      streamRef.current.stop();
    }

    const latest = candles[candles.length - 1];
    const stream = new LiveMarketStream(symbol, timeframe, {
      onCandleUpdate: (candle, isClosed) => {
        setCandles((prev) => {
          if (prev.length === 0) return [candle];
          const last = prev[prev.length - 1];

          // Compute price delta for flash glow
          const delta = candle.close - last.close;
          if (delta !== 0) {
            setPriceDelta(delta);
            setTimeout(() => setPriceDelta(0), 400);
          }
          setCurrentPrice(candle.close);

          let nextCandles: CandleData[];
          if (candle.time > last.time) {
            // New candle started: strictly increasing timestamp
            nextCandles = [...prev, candle];
            if (nextCandles.length > 300) {
              nextCandles = nextCandles.slice(nextCandles.length - 300);
            }
          } else if (candle.time === last.time) {
            // Update current candle in place
            nextCandles = [...prev.slice(0, -1), candle];
          } else {
            // Ignore stale out-of-order older timestamps
            nextCandles = prev;
          }

          // Evaluate signals every 10 updates
          if (Math.random() > 0.85) {
            const { activeSignal: newSig, signalHistory: newHist } = generateTradingSignals(
              nextCandles,
              symbol,
              timeframe
            );

            if (newSig && newSig.id !== lastSignalIdRef.current) {
              lastSignalIdRef.current = newSig.id;
              setActiveSignal(newSig);
              setSignalHistory(newHist);

              // If it's a strong signal, alert the user!
              if (newSig.type.includes("STRONG")) {
                setFloatingAlert(newSig);
                if (audioAlertsEnabled) {
                  playSignalAlertSound(newSig.type.includes("BUY") ? "buy" : "sell");
                }
              }
            }
          }

          return nextCandles;
        });
      },
      onTrade: (newTrade) => {
        setTrades((prev) => [newTrade, ...prev.slice(0, 20)]);
      },
      onOrderBook: (newBids, newAsks) => {
        setBids(newBids);
        setAsks(newAsks);
      },
    }, isEcoMode);

    stream.setInitialCandle(latest);
    stream.start();
    streamRef.current = stream;

    return () => {
      stream.stop();
      streamRef.current = null;
    };
  }, [candles.length > 0 ? candles[0].time : 0, symbol, timeframe, audioAlertsEnabled, isEcoMode]);

  // Sync ecoMode changes dynamically to existing stream without reconnecting
  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.setEcoMode(isEcoMode);
    }
  }, [isEcoMode]);

  // Fetch watchlist tickers with battery-aware pause & eco intervals
  useEffect(() => {
    const fetchTickers = async () => {
      if (typeof document !== "undefined" && document.hidden) return;
      try {
        let tickerData: any[] = [];
        const endpoints = [
          "/api/tickers",
          "https://api.binance.com/api/v3/ticker/24hr",
          "https://data-api.binance.vision/api/v3/ticker/24hr",
        ];

        for (const url of endpoints) {
          try {
            const res = await fetch(url);
            if (res.ok) {
              const json = await res.json();
              const list = Array.isArray(json) ? json : json.tickers;
              if (Array.isArray(list) && list.length > 0) {
                tickerData = list;
                break;
              }
            }
          } catch (e) {
            // try next endpoint
          }
        }

        if (tickerData.length > 0) {
          setWatchlistTickers((prev) =>
            prev.map((item) => {
              const found = tickerData.find((t: any) => t.symbol === item.symbol);
              if (found) {
                return {
                  ...item,
                  price: parseFloat(found.lastPrice),
                  change24h: parseFloat(found.priceChangePercent),
                  high24h: parseFloat(found.highPrice),
                  low24h: parseFloat(found.lowPrice),
                };
              }
              return item;
            })
          );
        }
      } catch (e) {
        // Fallback gracefully
      }
    };
    fetchTickers();
    const intervalTime = isEcoMode ? 20000 : 8000;
    const interval = setInterval(fetchTickers, intervalTime);
    return () => clearInterval(interval);
  }, [isEcoMode]);

  const activeTicker = watchlistTickers.find((t) => t.symbol === symbol) || watchlistTickers[0];

  // Core application content (renders either in desktop edge-to-edge or inside the Flutter mobile shell)
  const appContent = (
    <div className="flex flex-col min-h-screen bg-[#07090E] text-slate-100 font-sans pb-16 lg:pb-6">
      {/* 1. Header */}
      <Header
        symbol={symbol}
        onSelectSymbol={setSymbol}
        currentPrice={currentPrice}
        priceDelta={priceDelta}
        ticker={activeTicker}
        audioAlertsEnabled={audioAlertsEnabled}
        onToggleAudio={() => setAudioAlertsEnabled(!audioAlertsEnabled)}
        isMobileFrameMode={isMobileFrameMode}
        onToggleViewMode={() => setIsMobileFrameMode(!isMobileFrameMode)}
        isStreaming={true}
        onOpenApkModal={() => setIsApkModalOpen(true)}
        onOpenLossModal={() => setIsLossModalOpen(true)}
        isEcoMode={isEcoMode}
        onToggleEcoMode={() => setIsEcoMode(!isEcoMode)}
      />

      {/* 2. Main Workspace Layout */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto p-2 sm:p-4 flex flex-col gap-4">
        {/* Mobile Tab View Router (On mobile, or when in Mobile Tab mode) */}
        <div className="block lg:hidden">
          {mobileTab === "CHART" && (
            <div className="flex flex-col gap-3">
              <TradingViewChart
                candles={candles}
                chartType={chartType}
                indicators={indicators}
                timeframe={timeframe}
                activeSignal={activeSignal}
                signalHistory={signalHistory}
                symbol={symbol}
                onTimeframeChange={setTimeframe}
                onChartTypeChange={setChartType}
                onToggleIndicators={() => setIsIndicatorDrawerOpen(true)}
                onRefresh={loadMarketData}
              />
              {/* Quick Signal Summary under chart for mobile */}
              {activeSignal && (
                <div
                  onClick={() => setMobileTab("SIGNALS")}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer ${
                    activeSignal.type.includes("BUY")
                      ? "bg-emerald-950/40 border-emerald-500/40"
                      : "bg-rose-950/40 border-rose-500/40"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded ${
                        activeSignal.type.includes("BUY") ? "bg-emerald-500 text-slate-950" : "bg-rose-500 text-white"
                      }`}
                    >
                      {activeSignal.type.replace("_", " ")}
                    </span>
                    <span className="text-xs font-mono text-slate-200">
                      Target: ${activeSignal.tp1.toLocaleString()}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-400">View Full Setup →</span>
                </div>
              )}
            </div>
          )}

          {mobileTab === "SIGNALS" && (
            <SignalPanel
              activeSignal={activeSignal}
              signalHistory={signalHistory}
              symbol={symbol}
              onOpenAiAnalysis={() => setIsAiModalOpen(true)}
              onOpenLossModal={() => setIsLossModalOpen(true)}
              onSelectSignalOnChart={() => setMobileTab("CHART")}
            />
          )}

          {mobileTab === "ORDERBOOK" && (
            <OrderBookTape
              bids={bids}
              asks={asks}
              trades={trades}
              currentPrice={currentPrice}
            />
          )}

          {mobileTab === "AI" && (
            <div className="bg-[#0F141E] border border-slate-800 rounded-2xl p-4 flex flex-col gap-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                🤖 Institutional AI Market Analysis
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Scan {symbol} using deep algorithmic price action and quantitative volume delta models.
              </p>
              <button
                onClick={() => setIsAiModalOpen(true)}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition"
              >
                Launch Gemini AI Signal Thesis
              </button>
            </div>
          )}

          {mobileTab === "WATCHLIST" && (
            <Watchlist
              currentSymbol={symbol}
              onSelectSymbol={(s) => {
                setSymbol(s);
                setMobileTab("CHART");
              }}
              tickers={watchlistTickers}
            />
          )}
        </div>

        {/* Desktop Responsive Multi-Column Layout (when on larger screens or desktop mode) */}
        <div className="hidden lg:grid lg:grid-cols-12 gap-4">
          {/* Left / Center 8 Columns: Chart & Live Signals */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            <TradingViewChart
              candles={candles}
              chartType={chartType}
              indicators={indicators}
              timeframe={timeframe}
              activeSignal={activeSignal}
              signalHistory={signalHistory}
              symbol={symbol}
              onTimeframeChange={setTimeframe}
              onChartTypeChange={setChartType}
              onToggleIndicators={() => setIsIndicatorDrawerOpen(true)}
              onRefresh={loadMarketData}
            />

            {/* Signal Panel & Performance Matrix */}
            <SignalPanel
              activeSignal={activeSignal}
              signalHistory={signalHistory}
              symbol={symbol}
              onOpenAiAnalysis={() => setIsAiModalOpen(true)}
              onOpenLossModal={() => setIsLossModalOpen(true)}
            />
          </div>

          {/* Right 4 Columns: Order Book, Live Trades & Watchlist */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <OrderBookTape
              bids={bids}
              asks={asks}
              trades={trades}
              currentPrice={currentPrice}
            />

            <Watchlist
              currentSymbol={symbol}
              onSelectSymbol={setSymbol}
              tickers={watchlistTickers}
            />
          </div>
        </div>
      </main>

      {/* Floating Real-time Signal Alert Toast */}
      <SignalAlertBanner
        signal={floatingAlert}
        onDismiss={() => setFloatingAlert(null)}
        onViewSignal={() => {
          setFloatingAlert(null);
          setMobileTab("SIGNALS");
        }}
      />

      {/* Indicators Drawer Modal */}
      <IndicatorDrawer
        isOpen={isIndicatorDrawerOpen}
        onClose={() => setIsIndicatorDrawerOpen(false)}
        settings={indicators}
        onUpdateSettings={setIndicators}
      />

      {/* AI Deep Analysis Thesis Modal */}
      <AiAnalysisModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        symbol={symbol}
        timeframe={timeframe}
        candles={candles}
        currentPrice={currentPrice}
      />

      {/* APK Direct Download & Android Mobile Installation Modal */}
      <ApkDownloadModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
      />

      {/* Zero-Loss Capital Protection Protocol Modal */}
      <LossPreventionModal
        isOpen={isLossModalOpen}
        onClose={() => setIsLossModalOpen(false)}
        signal={activeSignal}
        symbol={symbol}
      />

      {/* Mobile Flutter-style Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden">
        <MobileBottomNav
          activeTab={mobileTab}
          onSelectTab={setMobileTab}
          activeSignalCount={activeSignal ? 1 : 0}
        />
      </div>
    </div>
  );

  // Clean Responsive Edge-to-Edge Application View
  return appContent;
}
