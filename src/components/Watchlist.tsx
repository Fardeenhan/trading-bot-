import React from "react";
import { TickerInfo } from "../types";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";

interface WatchlistProps {
  currentSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  tickers: TickerInfo[];
}

export const Watchlist: React.FC<WatchlistProps> = ({
  currentSymbol,
  onSelectSymbol,
  tickers,
}) => {
  return (
    <div id="watchlist-container" className="bg-[#0F141E] border border-slate-800/80 rounded-2xl p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-100">Live Crypto Markets</h3>
        <span className="text-[10px] text-slate-400 font-mono">Binance 24h Volume</span>
      </div>

      <div className="flex flex-col gap-1.5">
        {tickers.map((t) => {
          const isSelected = t.symbol === currentSymbol;
          const isPos = t.change24h >= 0;
          return (
            <div
              key={t.symbol}
              onClick={() => onSelectSymbol(t.symbol)}
              className={`flex items-center justify-between p-3 rounded-xl border transition cursor-pointer ${
                isSelected
                  ? "bg-slate-800/80 border-emerald-500/50 shadow-md shadow-emerald-950/20"
                  : "bg-slate-900/50 hover:bg-slate-800/50 border-slate-800/70"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-300">
                  {t.baseAsset.slice(0, 3)}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                    {t.symbol}
                    {isSelected && (
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1 rounded font-mono">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-400">{t.name}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs font-mono font-bold text-slate-100">
                  ${t.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                </div>
                <div
                  className={`text-[10px] font-mono font-semibold flex items-center justify-end gap-0.5 mt-0.5 ${
                    isPos ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {isPos ? "+" : ""}
                  {t.change24h.toFixed(2)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
