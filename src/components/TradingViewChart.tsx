import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  createChart,
  IChartApi,
  ISeriesApi,
  CandlestickSeries,
  HistogramSeries,
  LineSeries,
  AreaSeries,
  ColorType,
  CrosshairMode,
  createSeriesMarkers,
} from "lightweight-charts";
import { CandleData, ChartType, IndicatorSettings, TimeFrame, TradingSignal } from "../types";
import {
  calculateBollingerBands,
  calculateEMA,
  calculateSuperTrend,
  convertToHeikinAshi,
} from "../utils/indicators";
import {
  Maximize2,
  Minimize2,
  RefreshCw,
  TrendingUp,
  BarChart2,
  Sliders,
  Layers,
  ZoomIn,
} from "lucide-react";

interface TradingViewChartProps {
  candles: CandleData[];
  chartType: ChartType;
  indicators: IndicatorSettings;
  timeframe: TimeFrame;
  activeSignal: TradingSignal | null;
  signalHistory: TradingSignal[];
  symbol: string;
  onTimeframeChange: (tf: TimeFrame) => void;
  onChartTypeChange: (type: ChartType) => void;
  onToggleIndicators: () => void;
  onRefresh: () => void;
}

function sanitizeSeriesData<T extends { time: any }>(data: T[]): T[] {
  if (!data || data.length === 0) return [];
  const sorted = [...data].sort((a, b) => Number(a.time) - Number(b.time));
  const result: T[] = [];
  for (const item of sorted) {
    if (result.length === 0) {
      result.push(item);
    } else {
      const prevTime = Number(result[result.length - 1].time);
      const curTime = Number(item.time);
      if (curTime > prevTime) {
        result.push(item);
      } else if (curTime === prevTime) {
        // Overwrite duplicate with latest
        result[result.length - 1] = item;
      }
    }
  }
  return result;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({
  candles,
  chartType,
  indicators,
  timeframe,
  activeSignal,
  signalHistory,
  symbol,
  onTimeframeChange,
  onChartTypeChange,
  onToggleIndicators,
  onRefresh,
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const mainSeriesRef = useRef<ISeriesApi<any> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<any> | null>(null);
  const ema20SeriesRef = useRef<ISeriesApi<any> | null>(null);
  const ema50SeriesRef = useRef<ISeriesApi<any> | null>(null);
  const ema200SeriesRef = useRef<ISeriesApi<any> | null>(null);
  const bbUpperRef = useRef<ISeriesApi<any> | null>(null);
  const bbLowerRef = useRef<ISeriesApi<any> | null>(null);
  const supertrendRef = useRef<ISeriesApi<any> | null>(null);
  const markersPrimitiveRef = useRef<any>(null);

  const [hoverData, setHoverData] = useState<{
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    change: number;
    volume: number;
  } | null>(null);

  const [isFullscreen, setIsFullscreen] = useState(false);

  // Timeframe list
  const timeframes: TimeFrame[] = ["1s", "1m", "5m", "15m", "1h", "4h", "1d"];

  // Initialize and build Lightweight Chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const container = chartContainerRef.current;
    container.innerHTML = ""; // clean previous canvas

    const chart = createChart(container, {
      width: container.clientWidth,
      height: container.clientHeight || 420,
      layout: {
        background: { type: ColorType.Solid, color: "#0B0E14" },
        textColor: "#94A3B8",
        fontSize: 11,
        fontFamily: "'JetBrains Mono', monospace",
      },
      grid: {
        vertLines: { color: "rgba(30, 41, 59, 0.45)", style: 1 },
        horzLines: { color: "rgba(30, 41, 59, 0.45)", style: 1 },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          color: "#64748B",
          width: 1,
          style: 3,
          labelBackgroundColor: "#1E293B",
        },
        horzLine: {
          color: "#64748B",
          width: 1,
          style: 3,
          labelBackgroundColor: "#1E293B",
        },
      },
      timeScale: {
        borderColor: "#1E293B",
        timeVisible: true,
        secondsVisible: timeframe === "1s",
        barSpacing: 8,
        minBarSpacing: 3,
      },
      rightPriceScale: {
        borderColor: "#1E293B",
        scaleMargins: {
          top: 0.1,
          bottom: 0.22,
        },
        autoScale: true,
      },
    });

    chartRef.current = chart;

    // 1. Volume Series
    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: "#26a69a",
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    });
    chart.priceScale("volume").applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
      visible: false,
    });
    volumeSeriesRef.current = volumeSeries;

    // 2. Main Price Series (Candles / Area / Line)
    let mainSeries: ISeriesApi<any>;
    if (chartType === "area") {
      mainSeries = chart.addSeries(AreaSeries, {
        topColor: "rgba(16, 185, 129, 0.4)",
        bottomColor: "rgba(16, 185, 129, 0.01)",
        lineColor: "#10b981",
        lineWidth: 2,
      });
    } else {
      mainSeries = chart.addSeries(CandlestickSeries, {
        upColor: "#10B981",
        downColor: "#EF4444",
        borderVisible: false,
        wickUpColor: "#10B981",
        wickDownColor: "#EF4444",
      });
    }
    mainSeriesRef.current = mainSeries;

    // 3. Indicator Series
    // EMA 20 (Golden Yellow)
    const ema20 = chart.addSeries(LineSeries, {
      color: "#F59E0B",
      lineWidth: 1,
      title: "EMA 20",
      crosshairMarkerVisible: false,
    });
    ema20SeriesRef.current = ema20;

    // EMA 50 (Sky Blue)
    const ema50 = chart.addSeries(LineSeries, {
      color: "#38BDF8",
      lineWidth: 1,
      title: "EMA 50",
      crosshairMarkerVisible: false,
    });
    ema50SeriesRef.current = ema50;

    // EMA 200 (Purple)
    const ema200 = chart.addSeries(LineSeries, {
      color: "#A855F7",
      lineWidth: 2,
      title: "EMA 200",
      crosshairMarkerVisible: false,
    });
    ema200SeriesRef.current = ema200;

    // Bollinger Bands Upper & Lower
    const bbUpper = chart.addSeries(LineSeries, {
      color: "rgba(56, 189, 248, 0.6)",
      lineWidth: 1,
      lineStyle: 2,
      crosshairMarkerVisible: false,
    });
    const bbLower = chart.addSeries(LineSeries, {
      color: "rgba(56, 189, 248, 0.6)",
      lineWidth: 1,
      lineStyle: 2,
      crosshairMarkerVisible: false,
    });
    bbUpperRef.current = bbUpper;
    bbLowerRef.current = bbLower;

    // SuperTrend
    const supertrendSeries = chart.addSeries(LineSeries, {
      color: "#10B981",
      lineWidth: 2,
      crosshairMarkerVisible: false,
    });
    supertrendRef.current = supertrendSeries;

    // Crosshair move handler
    chart.subscribeCrosshairMove((param) => {
      if (
        !param.time ||
        param.point === undefined ||
        param.point.x < 0 ||
        param.point.x > container.clientWidth ||
        param.point.y < 0 ||
        param.point.y > container.clientHeight
      ) {
        setHoverData(null);
        return;
      }

      const barData = param.seriesData.get(mainSeries) as any;
      if (barData) {
        const o = barData.open ?? barData.value;
        const h = barData.high ?? barData.value;
        const l = barData.low ?? barData.value;
        const c = barData.close ?? barData.value;
        const chg = o ? ((c - o) / o) * 100 : 0;
        const v = (param.seriesData.get(volumeSeries) as any)?.value || 0;

        const dateObj = new Date(Number(param.time) * 1000);
        const timeStr = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });

        setHoverData({
          time: timeStr,
          open: o,
          high: h,
          low: l,
          close: c,
          change: chg,
          volume: v,
        });
      }
    });

    // Resize Observer for 60fps responsive canvas
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0 || !chartRef.current) return;
      const { width, height } = entries[0].contentRect;
      chartRef.current.applyOptions({ width, height });
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [chartType, timeframe]);

  // Feed and update data
  useEffect(() => {
    if (!chartRef.current || !mainSeriesRef.current || candles.length === 0) return;

    const rawDisplayCandles = chartType === "heikin_ashi" ? convertToHeikinAshi(candles) : candles;
    const displayCandles: CandleData[] = sanitizeSeriesData<CandleData>(rawDisplayCandles);
    if (displayCandles.length === 0) return;

    // 1. Set main candles
    if (chartType === "area") {
      const areaData = sanitizeSeriesData(
        displayCandles.map((c) => ({ time: c.time as any, value: c.close }))
      );
      mainSeriesRef.current.setData(areaData);
    } else {
      const candleData = sanitizeSeriesData(
        displayCandles.map((c) => ({
          time: c.time as any,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }))
      );
      mainSeriesRef.current.setData(candleData);
    }

    // 2. Set Volume
    if (volumeSeriesRef.current && indicators.showVolume) {
      volumeSeriesRef.current.applyOptions({ visible: true });
      const volData = sanitizeSeriesData(
        displayCandles.map((c) => ({
          time: c.time as any,
          value: c.volume,
          color: c.close >= c.open ? "rgba(16, 185, 129, 0.45)" : "rgba(239, 68, 68, 0.45)",
        }))
      );
      volumeSeriesRef.current.setData(volData);
    } else if (volumeSeriesRef.current) {
      volumeSeriesRef.current.applyOptions({ visible: false });
    }

    // 3. EMA 20
    if (ema20SeriesRef.current) {
      if (indicators.showEma20) {
        const ema20Data = sanitizeSeriesData(
          calculateEMA(displayCandles, 20).map((d) => ({ time: d.time as any, value: d.value }))
        );
        ema20SeriesRef.current.applyOptions({ visible: true });
        ema20SeriesRef.current.setData(ema20Data);
      } else {
        ema20SeriesRef.current.applyOptions({ visible: false });
      }
    }

    // 4. EMA 50
    if (ema50SeriesRef.current) {
      if (indicators.showEma50) {
        const ema50Data = sanitizeSeriesData(
          calculateEMA(displayCandles, 50).map((d) => ({ time: d.time as any, value: d.value }))
        );
        ema50SeriesRef.current.applyOptions({ visible: true });
        ema50SeriesRef.current.setData(ema50Data);
      } else {
        ema50SeriesRef.current.applyOptions({ visible: false });
      }
    }

    // 5. EMA 200
    if (ema200SeriesRef.current) {
      if (indicators.showEma200) {
        const ema200Data = sanitizeSeriesData(
          calculateEMA(displayCandles, 200).map((d) => ({ time: d.time as any, value: d.value }))
        );
        ema200SeriesRef.current.applyOptions({ visible: true });
        ema200SeriesRef.current.setData(ema200Data);
      } else {
        ema200SeriesRef.current.applyOptions({ visible: false });
      }
    }

    // 6. Bollinger Bands
    if (bbUpperRef.current && bbLowerRef.current) {
      if (indicators.showBollingerBands) {
        const bb = calculateBollingerBands(displayCandles, 20, 2);
        bbUpperRef.current.applyOptions({ visible: true });
        bbLowerRef.current.applyOptions({ visible: true });
        bbUpperRef.current.setData(
          sanitizeSeriesData(bb.upper.map((d) => ({ time: d.time as any, value: d.value })))
        );
        bbLowerRef.current.setData(
          sanitizeSeriesData(bb.lower.map((d) => ({ time: d.time as any, value: d.value })))
        );
      } else {
        bbUpperRef.current.applyOptions({ visible: false });
        bbLowerRef.current.applyOptions({ visible: false });
      }
    }

    // 7. SuperTrend
    if (supertrendRef.current) {
      if (indicators.showSuperTrend) {
        const st = calculateSuperTrend(displayCandles, 10, 3);
        supertrendRef.current.applyOptions({ visible: true });
        supertrendRef.current.setData(
          sanitizeSeriesData(st.map((d) => ({ time: d.time as any, value: d.value })))
        );
      } else {
        supertrendRef.current.applyOptions({ visible: false });
      }
    }

    // 8. Place Buy/Sell Signal Markers on the Chart
    if (mainSeriesRef.current && signalHistory.length > 0) {
      try {
        const markers: any[] = [];
        const timesInCandles = new Set(candles.map((c) => c.time));
        const usedTimes = new Set<number>();

        // Only take the high-accuracy non-neutral signals
        const validSignals = signalHistory.filter((s) => s.type !== "NEUTRAL");

        validSignals.forEach((sig) => {
          const sigTime = Math.floor(sig.timestamp / 1000);
          // Find nearest candle time
          let matchTime = sigTime;
          if (!timesInCandles.has(matchTime)) {
            let minDiff = Infinity;
            for (const c of candles) {
              const diff = Math.abs(c.time - sigTime);
              if (diff < minDiff) {
                minDiff = diff;
                matchTime = c.time;
              }
            }
          }

          if (usedTimes.has(matchTime)) return; // prevent duplicate markers on same candle
          usedTimes.add(matchTime);

          const isBuy = sig.type.includes("BUY");
          markers.push({
            time: matchTime,
            position: isBuy ? "belowBar" : "aboveBar",
            color: isBuy ? "#10B981" : "#EF4444",
            shape: isBuy ? "arrowUp" : "arrowDown",
            text: sig.type.replace("_", " "),
            size: 1.5,
          });
        });

        // Ensure markers are strictly sorted ascending by time
        markers.sort((a, b) => Number(a.time) - Number(b.time));

        // In Lightweight Charts v5: createSeriesMarkers
        if (markersPrimitiveRef.current) {
          markersPrimitiveRef.current.setMarkers(markers);
        } else {
          markersPrimitiveRef.current = createSeriesMarkers(mainSeriesRef.current, markers);
        }
      } catch (e) {
        // Safe fallback
      }
    }
  }, [candles, indicators, chartType, signalHistory]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const fitContent = () => {
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  };

  const latestCandle = candles[candles.length - 1];
  const activePrice = hoverData?.close ?? latestCandle?.close ?? 0;
  const activeChg = hoverData?.change ?? (latestCandle ? ((latestCandle.close - latestCandle.open) / latestCandle.open) * 100 : 0);

  return (
    <div
      id="tradingview-chart-wrapper"
      className={`flex flex-col bg-[#0B0E14] border border-slate-800/80 rounded-2xl overflow-hidden transition-all duration-300 ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : "w-full"
      }`}
    >
      {/* Top Mobile/Desktop Toolbar */}
      <div id="chart-controls-toolbar" className="flex flex-wrap items-center justify-between px-3 py-2 bg-[#0F141E] border-b border-slate-800/80 gap-2 select-none">
        {/* Left: Timeframe chips */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {timeframes.map((tf) => (
            <button
              id={`tf-btn-${tf}`}
              key={tf}
              onClick={() => onTimeframeChange(tf)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                timeframe === tf
                  ? "bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20 font-bold"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
              }`}
            >
              {tf.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Right: Chart Type & Action Buttons */}
        <div className="flex items-center gap-1.5 ml-auto">
          {/* Chart Style Switcher */}
          <div className="flex bg-slate-900/80 p-0.5 rounded-lg border border-slate-800">
            <button
              id="chart-type-candlestick"
              title="Candlesticks"
              onClick={() => onChartTypeChange("candlestick")}
              className={`p-1 rounded ${
                chartType === "candlestick" ? "bg-slate-800 text-emerald-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
            </button>
            <button
              id="chart-type-area"
              title="Area Line"
              onClick={() => onChartTypeChange("area")}
              className={`p-1 rounded ${
                chartType === "area" ? "bg-slate-800 text-emerald-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
            </button>
            <button
              id="chart-type-heikin-ashi"
              title="Heikin Ashi Smoothed"
              onClick={() => onChartTypeChange("heikin_ashi")}
              className={`px-1.5 py-0.5 text-[10px] font-bold rounded ${
                chartType === "heikin_ashi" ? "bg-slate-800 text-emerald-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              HA
            </button>
          </div>

          {/* Indicator toggles drawer button */}
          <button
            id="btn-indicators-modal"
            onClick={onToggleIndicators}
            title="Technical Indicators"
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Indicators</span>
          </button>

          {/* Fit view */}
          <button
            id="btn-fit-chart"
            onClick={fitContent}
            title="Fit content"
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>

          {/* Refresh */}
          <button
            id="btn-refresh-chart"
            onClick={onRefresh}
            title="Reload data"
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen */}
          <button
            id="btn-fullscreen-chart"
            onClick={toggleFullscreen}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Floating Precision OHLCV Header Badge */}
      <div id="ohlcv-status-badge" className="flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-1.5 bg-[#0B0E14]/95 text-[11px] text-slate-400 border-b border-slate-900 font-mono select-none">
        <span className="font-bold text-slate-200">{symbol}</span>
        <span className="text-slate-500">•</span>
        <span>
          O: <strong className="text-slate-200">${(hoverData?.open ?? latestCandle?.open ?? 0).toLocaleString()}</strong>
        </span>
        <span>
          H: <strong className="text-slate-200">${(hoverData?.high ?? latestCandle?.high ?? 0).toLocaleString()}</strong>
        </span>
        <span>
          L: <strong className="text-slate-200">${(hoverData?.low ?? latestCandle?.low ?? 0).toLocaleString()}</strong>
        </span>
        <span>
          C:{" "}
          <strong className={activeChg >= 0 ? "text-emerald-400" : "text-rose-400"}>
            ${activePrice.toLocaleString()} ({activeChg >= 0 ? "+" : ""}
            {activeChg.toFixed(2)}%)
          </strong>
        </span>
        {hoverData?.volume !== undefined && (
          <span className="hidden md:inline">
            Vol: <strong className="text-slate-300">{hoverData.volume.toFixed(2)}</strong>
          </span>
        )}
        {hoverData?.time && (
          <span className="ml-auto text-slate-500 text-[10px] hidden sm:inline">{hoverData.time}</span>
        )}
      </div>

      {/* Active Indicator Legend Bar */}
      <div id="indicators-active-legend" className="flex flex-wrap items-center gap-3 px-3 py-1 bg-[#090C12] text-[10px] font-mono border-b border-slate-900/60 text-slate-400">
        {indicators.showEma20 && (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
            <span>EMA(20)</span>
          </span>
        )}
        {indicators.showEma50 && (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
            <span>EMA(50)</span>
          </span>
        )}
        {indicators.showEma200 && (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-[#A855F7]" />
            <span>EMA(200)</span>
          </span>
        )}
        {indicators.showBollingerBands && (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-sky-400" />
            <span>BB(20,2)</span>
          </span>
        )}
        {indicators.showSuperTrend && (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>SuperTrend(10,3)</span>
          </span>
        )}
        {indicators.showVolume && (
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            <span>Vol(20)</span>
          </span>
        )}
      </div>

      {/* 60fps TradingView Canvas Container */}
      <div
        id="tv-lightweight-chart-container"
        ref={chartContainerRef}
        className={`w-full relative transition-all ${
          isFullscreen ? "flex-1 h-full min-h-[500px]" : "h-[360px] sm:h-[440px] md:h-[490px]"
        }`}
      />
    </div>
  );
};
