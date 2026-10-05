import React from "react";
import { TradingSignal } from "../types";
import { TrendingUp, TrendingDown, Target, Shield, X, Bell } from "lucide-react";

interface SignalAlertBannerProps {
  signal: TradingSignal | null;
  onDismiss: () => void;
  onViewSignal: () => void;
}

export const SignalAlertBanner: React.FC<SignalAlertBannerProps> = ({
  signal,
  onDismiss,
  onViewSignal,
}) => {
  if (!signal) return null;

  const isTrap = signal.trapStatus === "BULL_TRAP_DETECTED" || signal.trapStatus === "BEAR_TRAP_DETECTED";
  if (signal.type === "NEUTRAL" && !isTrap) return null;

  const isBuy = signal.type === "STRONG_BUY";
  const isBullTrap = signal.trapStatus === "BULL_TRAP_DETECTED";

  return (
    <div
      id="live-signal-floating-alert"
      className={`fixed bottom-16 sm:bottom-6 right-4 sm:right-6 max-w-sm z-40 bg-[#0F141E]/95 backdrop-blur-md border rounded-2xl shadow-2xl p-3.5 flex items-start gap-3 animate-in slide-in-from-bottom-5 ${
        isTrap
          ? isBullTrap
            ? "border-rose-500/80 shadow-rose-950/40"
            : "border-teal-500/80 shadow-teal-950/40"
          : isBuy
          ? "border-emerald-500/80 shadow-emerald-950/40"
          : "border-rose-500/80 shadow-rose-950/40"
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
          isTrap
            ? isBullTrap
              ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
              : "bg-teal-500/20 text-teal-400 border border-teal-500/40"
            : isBuy
            ? "bg-emerald-500 text-slate-950"
            : "bg-rose-500 text-white"
        }`}
      >
        {isTrap ? (
          <Shield className="w-5 h-5 animate-pulse" />
        ) : isBuy ? (
          <TrendingUp className="w-5 h-5" />
        ) : (
          <TrendingDown className="w-5 h-5" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={`text-xs font-black uppercase tracking-wide ${
              isTrap
                ? isBullTrap
                  ? "text-rose-400"
                  : "text-teal-400"
                : isBuy
                ? "text-emerald-400"
                : "text-rose-400"
            }`}
          >
            {isTrap
              ? isBullTrap
                ? "⚠️ Bull Trap Alert"
                : "⚠️ Bear Trap Alert"
              : `🚨 100% ${signal.type.replace("_", " ")}`}
          </span>
          <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-1.5 py-0.2 rounded border border-slate-700">
            {signal.symbol}
          </span>
        </div>

        <p className="text-[11px] text-slate-300 mt-1 font-mono">
          {isTrap ? (
            <span className="text-amber-300 font-sans">
              Whale trap detected! Trade is blocked to save 100% capital.
            </span>
          ) : (
            <>
              Entry: <strong className="text-slate-100">${signal.price.toLocaleString()}</strong> • TP1:{" "}
              <strong className="text-emerald-400">${signal.tp1.toLocaleString()}</strong>
            </>
          )}
        </p>

        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={onViewSignal}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition ${
              isTrap
                ? "bg-amber-400 hover:bg-amber-300 text-slate-950"
                : "bg-emerald-500 hover:bg-emerald-400 text-slate-950"
            }`}
          >
            {isTrap ? "View Anti-Trap Shield" : "Review Setup"}
          </button>
          <button
            onClick={onDismiss}
            className="text-[11px] text-slate-400 hover:text-slate-200 px-2 py-1 rounded-lg hover:bg-slate-800 transition"
          >
            Dismiss
          </button>
        </div>
      </div>

      <button
        onClick={onDismiss}
        className="text-slate-500 hover:text-slate-300 p-1 -mr-1 -mt-1"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
