import React, { useState } from "react";
import { TickerInfo } from "../types";
import {
  Volume2,
  VolumeX,
  Smartphone,
  Monitor,
  ChevronDown,
  Activity,
  Zap,
  Download,
  ShieldCheck,
  Battery,
  BatteryCharging,
} from "lucide-react";

interface HeaderProps {
  symbol: string;
  onSelectSymbol: (symbol: string) => void;
  currentPrice: number;
  priceDelta: number;
  ticker: TickerInfo | null;
  audioAlertsEnabled: boolean;
  onToggleAudio: () => void;
  isMobileFrameMode: boolean;
  onToggleViewMode: () => void;
  isStreaming: boolean;
  onOpenApkModal: () => void;
  onOpenLossModal: () => void;
  isEcoMode?: boolean;
  onToggleEcoMode?: () => void;
}

const AVAILABLE_PAIRS = [
  { symbol: "BTCUSDT", name: "Bitcoin", icon: "₿" },
  { symbol: "ETHUSDT", name: "Ethereum", icon: "Ξ" },
  { symbol: "SOLUSDT", name: "Solana", icon: "◎" },
  { symbol: "BNBUSDT", name: "BNB", icon: "🔶" },
  { symbol: "XRPUSDT", name: "Ripple", icon: "✕" },
  { symbol: "DOGEUSDT", name: "Dogecoin", icon: "Ð" },
];

export const Header: React.FC<HeaderProps> = ({
  symbol,
  onSelectSymbol,
  currentPrice,
  priceDelta,
  ticker,
  audioAlertsEnabled,
  onToggleAudio,
  isMobileFrameMode,
  onToggleViewMode,
  isStreaming,
  onOpenApkModal,
  onOpenLossModal,
  isEcoMode = false,
  onToggleEcoMode,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const selectedPair = AVAILABLE_PAIRS.find((p) => p.symbol === symbol) || AVAILABLE_PAIRS[0];
  const change24h = ticker ? ticker.change24h : 2.45;
  const isPositive = change24h >= 0;

  return (
    <header id="fardeen-main-header" className="w-full bg-[#0B0E14] border-b border-slate-800/80 px-3 sm:px-4 py-2.5 flex items-center justify-between gap-3 select-none">
      {/* Left: Fardeen Brand + Pair Selector */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-slate-950 text-base shadow-md shadow-emerald-500/25">
            F
          </div>
          <div>
            <h1 className="text-base font-black text-slate-100 tracking-tight flex items-center gap-1.5">
              Fardeen <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-md border border-emerald-500/30">BOT</span>
            </h1>
            <p className="hidden sm:block text-[10px] text-slate-400">Institutional Signals & Pro Charts</p>
          </div>
        </div>

        {/* Pair Dropdown */}
        <div className="relative">
          <button
            id="symbol-selector-btn"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 rounded-xl transition cursor-pointer"
          >
            <span className="text-base">{selectedPair.icon}</span>
            <div className="text-left">
              <div className="text-xs font-black text-slate-100 flex items-center gap-1">
                {selectedPair.symbol.replace("USDT", "")}
                <span className="text-[10px] text-slate-500 font-normal">/USDT</span>
              </div>
            </div>
            <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 top-full mt-1.5 w-48 bg-[#0F141E] border border-slate-800 rounded-xl shadow-2xl z-50 p-1.5 flex flex-col gap-1">
              <div className="text-[10px] font-bold text-slate-500 px-2 py-1 uppercase">Top Liquid Pairs</div>
              {AVAILABLE_PAIRS.map((pair) => (
                <button
                  id={`select-pair-${pair.symbol}`}
                  key={pair.symbol}
                  onClick={() => {
                    onSelectSymbol(pair.symbol);
                    setDropdownOpen(false);
                  }}
                  className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    symbol === pair.symbol
                      ? "bg-emerald-500 text-slate-950 font-bold"
                      : "text-slate-300 hover:bg-slate-800/80"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{pair.icon}</span>
                    <span>{pair.symbol}</span>
                  </div>
                  <span className={`text-[10px] ${symbol === pair.symbol ? "text-slate-900" : "text-slate-400"}`}>
                    {pair.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Live Market Price with real-time flash glow */}
        <div className="flex items-baseline gap-2">
          <span
            className={`text-base sm:text-xl font-black font-mono tracking-tight transition-colors duration-200 ${
              priceDelta > 0
                ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                : priceDelta < 0
                ? "text-rose-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                : "text-slate-100"
            }`}
          >
            ${currentPrice > 0 ? currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : "---"}
          </span>
          <span
            className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
              isPositive ? "text-emerald-400 bg-emerald-950/60" : "text-rose-400 bg-rose-950/60"
            }`}
          >
            {isPositive ? "+" : ""}
            {change24h.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Right: Clean, Uncluttered Controls */}
      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        {/* Stream Live Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/50 border border-emerald-800/40 text-[11px] font-mono text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live 60fps</span>
        </div>

        {/* Install Fardeen Mobile App Button */}
        <button
          id="btn-header-install-app"
          onClick={onOpenApkModal}
          className="flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 shadow-md shadow-emerald-500/20 transition active:scale-95 cursor-pointer"
          title="Download Fardeen Flutter App & APK"
        >
          <Download className="w-4 h-4 shrink-0" />
          <span>Flutter / APK</span>
        </button>

        {/* Zero-Loss Capital Protection Rule Button */}
        <button
          id="btn-header-zero-loss"
          onClick={onOpenLossModal}
          className="hidden sm:flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-700/80 transition active:scale-95 cursor-pointer"
          title="Zero-Loss Protocol & Capital Protection Rules"
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Zero-Loss Rule</span>
        </button>

        {/* Sound alerts toggle */}
        <button
          id="btn-toggle-sound"
          onClick={onToggleAudio}
          title={audioAlertsEnabled ? "Signal Audio Alerts On" : "Signal Audio Muted"}
          className={`p-2 rounded-xl border transition cursor-pointer ${
            audioAlertsEnabled
              ? "bg-slate-800 text-emerald-400 border-slate-700"
              : "bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300"
          }`}
        >
          {audioAlertsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
