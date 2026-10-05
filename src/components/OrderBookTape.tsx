import React, { useState } from "react";
import { OrderBookLevel, RecentTrade } from "../types";
import { ArrowUpRight, ArrowDownRight, Layers, Activity } from "lucide-react";

interface OrderBookTapeProps {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  trades: RecentTrade[];
  currentPrice: number;
}

export const OrderBookTape: React.FC<OrderBookTapeProps> = ({
  bids,
  asks,
  trades,
  currentPrice,
}) => {
  const [activeTab, setActiveTab] = useState<"BOOK" | "TRADES">("BOOK");

  const maxBidTotal = bids.length > 0 ? Math.max(...bids.map((b) => b.total)) : 1;
  const maxAskTotal = asks.length > 0 ? Math.max(...asks.map((a) => a.total)) : 1;

  // Buyer vs Seller ratio calculation
  const totalBidsAmount = bids.reduce((acc, b) => acc + b.amount, 0);
  const totalAsksAmount = asks.reduce((acc, a) => acc + a.amount, 0);
  const buyRatio = totalBidsAmount + totalAsksAmount > 0
    ? Math.round((totalBidsAmount / (totalBidsAmount + totalAsksAmount)) * 100)
    : 52;

  return (
    <div id="orderbook-tape-container" className="flex flex-col bg-[#0F141E] border border-slate-800/80 rounded-2xl overflow-hidden">
      {/* Header Tabs */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0B0E14] border-b border-slate-800/80">
        <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
          <button
            id="tab-order-book"
            onClick={() => setActiveTab("BOOK")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-bold transition ${
              activeTab === "BOOK"
                ? "bg-slate-800 text-emerald-400 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Order Book</span>
          </button>
          <button
            id="tab-trade-tape"
            onClick={() => setActiveTab("TRADES")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-bold transition ${
              activeTab === "TRADES"
                ? "bg-slate-800 text-sky-400 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Live Trades</span>
          </button>
        </div>

        {/* Real-time Order Flow Bar */}
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="text-emerald-400 font-bold">{buyRatio}% Bids</span>
          <div className="w-16 h-2 bg-rose-500/80 rounded-full overflow-hidden flex">
            <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${buyRatio}%` }} />
          </div>
          <span className="text-rose-400 font-bold">{100 - buyRatio}% Asks</span>
        </div>
      </div>

      {activeTab === "BOOK" ? (
        <div className="p-3 text-[11px] font-mono select-none">
          {/* Column Titles */}
          <div className="grid grid-cols-3 text-slate-500 text-[10px] font-bold pb-2 border-b border-slate-800/60 mb-1.5 px-1">
            <span>Price (USDT)</span>
            <span className="text-right">Size</span>
            <span className="text-right">Total</span>
          </div>

          {/* Asks (Sells) - Reversed so lowest ask sits above spread */}
          <div className="flex flex-col-reverse gap-0.5">
            {asks.slice(0, 6).map((ask, idx) => {
              const depthWidth = Math.min(100, Math.round((ask.total / maxAskTotal) * 100));
              return (
                <div key={idx} className="relative grid grid-cols-3 py-1 px-1 rounded hover:bg-slate-800/40">
                  <div
                    className="absolute inset-y-0 right-0 bg-rose-500/10 pointer-events-none rounded"
                    style={{ width: `${depthWidth}%` }}
                  />
                  <span className="relative text-rose-400 font-bold">${ask.price.toLocaleString()}</span>
                  <span className="relative text-right text-slate-300">{ask.amount.toFixed(3)}</span>
                  <span className="relative text-right text-slate-400">{ask.total.toFixed(3)}</span>
                </div>
              );
            })}
          </div>

          {/* Mid Price / Spread Indicator */}
          <div className="my-2 py-1.5 px-2 bg-slate-900/90 border-y border-slate-800 flex items-center justify-between rounded">
            <div className="flex items-center gap-1.5">
              <span className="text-xs sm:text-sm font-black text-slate-100">${currentPrice.toLocaleString()}</span>
              <span className="text-[10px] text-emerald-400">Market Price</span>
            </div>
            <span className="text-[10px] text-slate-500">Spread: 0.01%</span>
          </div>

          {/* Bids (Buys) */}
          <div className="flex flex-col gap-0.5">
            {bids.slice(0, 6).map((bid, idx) => {
              const depthWidth = Math.min(100, Math.round((bid.total / maxBidTotal) * 100));
              return (
                <div key={idx} className="relative grid grid-cols-3 py-1 px-1 rounded hover:bg-slate-800/40">
                  <div
                    className="absolute inset-y-0 right-0 bg-emerald-500/10 pointer-events-none rounded"
                    style={{ width: `${depthWidth}%` }}
                  />
                  <span className="relative text-emerald-400 font-bold">${bid.price.toLocaleString()}</span>
                  <span className="relative text-right text-slate-300">{bid.amount.toFixed(3)}</span>
                  <span className="relative text-right text-slate-400">{bid.total.toFixed(3)}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Live Trades Tape */
        <div className="p-3 text-[11px] font-mono select-none">
          <div className="grid grid-cols-3 text-slate-500 text-[10px] font-bold pb-2 border-b border-slate-800/60 mb-1.5 px-1">
            <span>Price (USDT)</span>
            <span className="text-right">Amount</span>
            <span className="text-right">Time</span>
          </div>

          <div className="flex flex-col gap-1 max-h-[300px] overflow-y-auto pr-1">
            {trades.slice(0, 14).map((trade) => {
              const isBuy = trade.side === "buy";
              return (
                <div
                  key={trade.id}
                  className="grid grid-cols-3 py-1 px-1 rounded hover:bg-slate-800/40 items-center transition"
                >
                  <span className={`font-bold flex items-center gap-1 ${isBuy ? "text-emerald-400" : "text-rose-400"}`}>
                    {isBuy ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    ${trade.price.toLocaleString()}
                  </span>
                  <span className="text-right text-slate-300">{trade.amount.toFixed(4)}</span>
                  <span className="text-right text-slate-500 text-[10px]">{trade.time}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
