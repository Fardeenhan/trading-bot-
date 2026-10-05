import React, { useState } from "react";
import { TradingSignal } from "../types";
import {
  ShieldAlert,
  ShieldCheck,
  Target,
  TrendingUp,
  TrendingDown,
  Calculator,
  Volume2,
  Copy,
  CheckCircle2,
  X,
  Zap,
  Lock,
  ArrowRight,
  Flame,
} from "lucide-react";

interface LossPreventionModalProps {
  isOpen: boolean;
  onClose: () => void;
  signal: TradingSignal | null;
  symbol: string;
}

export const LossPreventionModal: React.FC<LossPreventionModalProps> = ({
  isOpen,
  onClose,
  signal,
  symbol,
}) => {
  const [accountBalance, setAccountBalance] = useState<number>(1000);
  const [riskPercent, setRiskPercent] = useState<number>(1);
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  if (!isOpen || !signal) return null;

  const isBuy = signal.type.includes("BUY");
  const entry = signal.price;
  const tp1 = signal.tp1;
  const tp2 = signal.tp2;
  const sl = signal.sl;

  // Capital risk calculations
  const maxRiskUsd = (accountBalance * riskPercent) / 100;
  const stopLossDistance = Math.abs(entry - sl);
  const stopLossPercent = (stopLossDistance / entry) * 100;

  // Position size in USD and asset units
  const positionSizeUsd = stopLossPercent > 0 ? (maxRiskUsd / (stopLossPercent / 100)) : 0;
  const positionSizeCoins = positionSizeUsd / entry;

  const tp1Distance = Math.abs(tp1 - entry);
  const profitAtTp1 = positionSizeCoins * tp1Distance;
  const tp2Distance = Math.abs(tp2 - entry);
  const profitAtTp2 = positionSizeCoins * tp2Distance;

  // Text to Speech for Hindi voice guidance
  const handleSpeakGuidance = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const textToSpeak = signal.hindiGuidance ||
      `Bhai yeh proper researched signal hai. Entry ${entry} dollar par lein, Stop Loss ${sl} dollar par lagayein, aur TP1 aate hi Stop Loss ko entry price par move kar dein taaki zero loss ho!`;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.95;
    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleCopyTradeSetup = () => {
    const text = `🎯 APEXTRADE ZERO-LOSS TRADE SETUP
Pair: ${signal.symbol} (${signal.timeframe})
Action: ${signal.type.replace("_", " ")}
━━━━━━━━━━━━━━━━━━━
Entry Price: $${entry.toLocaleString()}
Take Profit 1 (TP1): $${tp1.toLocaleString()} (+${((Math.abs(tp1 - entry) / entry) * 100).toFixed(2)}%)
Take Profit 2 (TP2): $${tp2.toLocaleString()} (+${((Math.abs(tp2 - entry) / entry) * 100).toFixed(2)}%)
Stop Loss (SL): $${sl.toLocaleString()} (-${((Math.abs(entry - sl) / entry) * 100).toFixed(2)}%)
Risk/Reward: ${signal.riskReward}
━━━━━━━━━━━━━━━━━━━
🛡️ ZERO-LOSS RULE:
Jaise hi TP1 hit ho, turant apna Stop Loss Entry price ($${entry.toLocaleString()}) par move karein!
Isse trade 100% Risk-Free aur Zero-Loss ban jayegi.
Capital Risk: Max 1% per trade.`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div
      id="loss-prevention-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in"
    >
      <div
        id="loss-prevention-dialog"
        className="relative w-full max-w-2xl bg-[#0D111A] border border-emerald-500/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
      >
        {/* Header with Zero-Loss Shield badge */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 p-5 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center shadow-lg shadow-emerald-950">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base sm:text-lg font-black text-slate-100">
                    Zero-Loss Capital Protection Protocol
                  </h2>
                  <span className="text-[10px] font-bold font-mono bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-full uppercase">
                    A+ Research
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Institutional Risk Management • Strict Invalidation • Multi-Timeframe Confluence
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 flex items-center justify-center transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Audio Hindi Voice Guidance Button */}
          <div className="mt-3 flex items-center justify-between bg-emerald-950/60 border border-emerald-500/30 px-3.5 py-2 rounded-xl">
            <div className="flex items-center gap-2 text-xs text-emerald-300 font-semibold">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>Hindi Voice Guidance (Aawaz me sunein)</span>
            </div>
            <button
              onClick={handleSpeakGuidance}
              className={`text-xs font-bold px-3 py-1 rounded-lg transition ${
                isPlayingAudio
                  ? "bg-rose-500 text-white animate-pulse"
                  : "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
              }`}
            >
              {isPlayingAudio ? "Stop Audio" : "Listen in Hindi 🔊"}
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-200">
          {/* Hindi Direct Guidance Card */}
          <div className="bg-slate-900/90 border border-emerald-500/30 p-4 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                Zero-Loss Execution Plan:
              </span>
              <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                {signal.symbol} • {signal.timeframe}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              {signal.hindiGuidance ||
                `Bhai yeh proper full research wala signal hai: Entry $${entry.toLocaleString()} par lein, SL $${sl.toLocaleString()} lagayein. TP1 aate hi Stop Loss ko turant entry price par shift kar dena, isse aapka loss 100% zero ho jayega!`}
            </p>
          </div>

          {/* Key Trade Parameters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl">
              <div className="text-[10px] text-slate-400 font-mono">ENTRY PRICE</div>
              <div className="text-sm sm:text-base font-bold text-slate-100 font-mono mt-0.5">
                ${entry.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Exact trigger level</div>
            </div>

            <div className="bg-emerald-950/40 border border-emerald-500/40 p-3 rounded-xl">
              <div className="text-[10px] text-emerald-400 font-mono">TARGET 1 (TP1)</div>
              <div className="text-sm sm:text-base font-bold text-emerald-300 font-mono mt-0.5">
                ${tp1.toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-400/80 mt-1">Move SL to Entry here!</div>
            </div>

            <div className="bg-emerald-950/20 border border-emerald-500/30 p-3 rounded-xl">
              <div className="text-[10px] text-emerald-400 font-mono">TARGET 2 (TP2)</div>
              <div className="text-sm sm:text-base font-bold text-emerald-400 font-mono mt-0.5">
                ${tp2.toLocaleString()}
              </div>
              <div className="text-[10px] text-emerald-400/80 mt-1">Runner target</div>
            </div>

            <div className="bg-rose-950/40 border border-rose-500/40 p-3 rounded-xl">
              <div className="text-[10px] text-rose-400 font-mono">STOP LOSS (SL)</div>
              <div className="text-sm sm:text-base font-bold text-rose-300 font-mono mt-0.5">
                ${sl.toLocaleString()}
              </div>
              <div className="text-[10px] text-rose-400/80 mt-1">Hard invalidation</div>
            </div>
          </div>

          {/* Visual Step-by-Step Zero-Loss Breakeven Rule Diagram */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3">
            <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wide">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              Loss Na Hone Ki 3-Step Strategy (Golden Rule):
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex flex-col gap-1">
                <span className="font-mono text-emerald-400 font-bold text-[11px]">STEP 1: ENTRY</span>
                <span className="text-slate-300 font-medium">Position Open Karein</span>
                <p className="text-[11px] text-slate-400 leading-snug">
                  ${entry.toLocaleString()} par entry lein aur Stop Loss $${sl.toLocaleString()} par lagayein.
                </p>
              </div>

              <div className="bg-emerald-950/30 p-3 rounded-xl border border-emerald-500/40 flex flex-col gap-1">
                <span className="font-mono text-emerald-400 font-bold text-[11px]">STEP 2: TP1 HIT</span>
                <span className="text-emerald-300 font-medium">50% Profit Book Karein</span>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Jaise hi price $${tp1.toLocaleString()} pe aaye, aadhi trade close karke profit pocket me daalein.
                </p>
              </div>

              <div className="bg-indigo-950/30 p-3 rounded-xl border border-indigo-500/40 flex flex-col gap-1">
                <span className="font-mono text-indigo-400 font-bold text-[11px]">STEP 3: ZERO LOSS</span>
                <span className="text-indigo-300 font-medium">SL to Entry (Risk-Free)</span>
                <p className="text-[11px] text-slate-300 leading-snug">
                  Bachi hui 50% position ka Stop Loss Entry price (${entry.toLocaleString()}) par set karein. Loss ab 0%!
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Capital Risk & Position Size Calculator */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wide">
                  Capital Risk & Position Size Calculator
                </h4>
              </div>
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded font-mono border border-emerald-500/30">
                1% Rule Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Account Balance Input */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Aapka Total Trading Balance ($ USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500">$</span>
                  <input
                    type="number"
                    value={accountBalance}
                    onChange={(e) => setAccountBalance(Math.max(10, Number(e.target.value)))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-7 pr-3 py-2 text-xs font-mono font-bold text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Risk Level Selector */}
              <div className="space-y-1">
                <label className="text-[11px] text-slate-400">Risk Per Trade (%)</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[0.5, 1.0, 2.0].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRiskPercent(r)}
                      className={`py-2 text-xs font-mono font-bold rounded-xl border transition ${
                        riskPercent === r
                          ? "bg-emerald-500 text-slate-950 border-emerald-400"
                          : "bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      {r}% {r === 1.0 ? "(Safe)" : ""}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Calculated Results Bar */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 grid grid-cols-3 gap-2 text-center">
              <div>
                <div className="text-[10px] text-slate-400">Max Dollar Risk</div>
                <div className="text-xs sm:text-sm font-mono font-bold text-rose-400 mt-0.5">
                  -${maxRiskUsd.toFixed(2)}
                </div>
                <div className="text-[9px] text-slate-500">(Total balance safe)</div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400">Position Size</div>
                <div className="text-xs sm:text-sm font-mono font-bold text-slate-100 mt-0.5">
                  ${positionSizeUsd.toFixed(1)}
                </div>
                <div className="text-[9px] text-slate-400 font-mono">
                  {positionSizeCoins.toFixed(4)} {symbol.replace("USDT", "")}
                </div>
              </div>

              <div>
                <div className="text-[10px] text-slate-400">Potential Profit (TP1)</div>
                <div className="text-xs sm:text-sm font-mono font-bold text-emerald-400 mt-0.5">
                  +${profitAtTp1.toFixed(2)}
                </div>
                <div className="text-[9px] text-emerald-500 font-mono">
                  TP2: +${profitAtTp2.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Multi-Timeframe Confirmation */}
          <div className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300">
              Multi-Timeframe Trend Consensus:
            </span>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-md">
                15M: {signal.multiTfConfirmation?.tf15m || "BULLISH"}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-md">
                1H: {signal.multiTfConfirmation?.tf1h || "BULLISH"}
              </span>
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-md">
                4H: {signal.multiTfConfirmation?.tf4h || "BULLISH"}
              </span>
            </div>
          </div>
        </div>

        {/* Footer with One-Click Copy */}
        <div className="p-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            onClick={handleCopyTradeSetup}
            className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition"
          >
            {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Trade Setup Copied for Exchange!" : "Copy Signal for Binance / Bybit / MT5"}
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
