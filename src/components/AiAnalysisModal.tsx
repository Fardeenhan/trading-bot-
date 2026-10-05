import React, { useState, useEffect } from "react";
import { AiSignalAnalysis, CandleData } from "../types";
import { Sparkles, X, TrendingUp, TrendingDown, Target, Shield, AlertTriangle, RefreshCw } from "lucide-react";

interface AiAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  timeframe: string;
  candles: CandleData[];
  currentPrice: number;
}

export const AiAnalysisModal: React.FC<AiAnalysisModalProps> = ({
  isOpen,
  onClose,
  symbol,
  timeframe,
  candles,
  currentPrice,
}) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AiSignalAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    if (candles.length === 0) return;
    setLoading(true);
    setError(null);

    try {
      const recent = candles.slice(-10);
      const res = await fetch("/api/ai-signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symbol,
          interval: timeframe,
          currentPrice,
          recentCandles: recent,
        }),
      });

      if (!res.ok) throw new Error("Failed to fetch AI signal");
      const json = await res.json();
      if (json.success && json.aiAnalysis) {
        setAnalysis(json.aiAnalysis);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err: any) {
      setError(err.message || "Failed to analyze setup");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAnalysis();
    }
  }, [isOpen, symbol, timeframe]);

  if (!isOpen) return null;

  const isBuy = analysis?.signal.includes("BUY");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-lg bg-[#0F141E] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-[#0B0E14]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                Institutional AI Signal Thesis
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                  Gemini Flash
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {symbol} • {timeframe.toUpperCase()} Frame • Real-Time Scan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
              <RefreshCw className="w-7 h-7 text-indigo-400 animate-spin" />
              <p className="text-xs font-semibold text-slate-300">
                Computing multi-factor price action & liquidity matrix...
              </p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 text-xs">
              {error}
            </div>
          ) : analysis ? (
            <>
              {/* Verdict Card */}
              <div
                className={`p-4 rounded-xl border flex items-center justify-between ${
                  isBuy
                    ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-400"
                    : "bg-rose-950/30 border-rose-500/40 text-rose-400"
                }`}
              >
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Trading Direction</div>
                  <div className="text-xl font-black flex items-center gap-2 mt-0.5">
                    {isBuy ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                    {analysis.signal.replace("_", " ")}
                  </div>
                  <div className="text-xs text-slate-300 mt-1 font-medium">{analysis.trendOutlook}</div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Conviction Score</div>
                  <div className="text-2xl font-black font-mono text-indigo-400">
                    {analysis.confidenceScore}%
                  </div>
                  <div className="text-[10px] text-slate-400">Institutional Confidence</div>
                </div>
              </div>

              {/* Execution Targets */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between text-[10px] font-bold text-emerald-400 mb-1">
                    <span>Take Profit 1</span>
                    <Target className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-base font-mono font-bold text-emerald-300">
                    ${analysis.takeProfit1.toLocaleString()}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between text-[10px] font-bold text-emerald-400 mb-1">
                    <span>Take Profit 2 (Extension)</span>
                    <Target className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-base font-mono font-bold text-emerald-300">
                    ${analysis.takeProfit2.toLocaleString()}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between text-[10px] font-bold text-rose-400 mb-1">
                    <span>Stop Loss (Invalidation)</span>
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-base font-mono font-bold text-rose-300">
                    ${analysis.stopLoss.toLocaleString()}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 mb-1">Risk / Reward Ratio</div>
                  <div className="text-base font-mono font-bold text-sky-400">
                    {analysis.riskRewardRatio}
                  </div>
                </div>
              </div>

              {/* Institutional Thesis */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800">
                <div className="text-[11px] font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  Quantitative Market Structure Rationale:
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {analysis.institutionalThesis}
                </p>
              </div>

              {/* Zero-Loss Capital Protection Protocol Banner */}
              {analysis.lossPreventionProtocol && (
                <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide">
                      🛡️ Zero-Loss Capital Protection:
                    </span>
                    <span className="text-[10px] font-mono bg-emerald-500 text-slate-950 px-2 py-0.5 rounded font-bold">
                      {analysis.lossPreventionProtocol.confluenceGrade}
                    </span>
                  </div>
                  <div className="text-xs text-slate-200 leading-relaxed space-y-1">
                    <p>• <strong className="text-emerald-300">Break-Even:</strong> {analysis.lossPreventionProtocol.breakEvenRule}</p>
                    <p>• <strong className="text-emerald-300">Risk Rule:</strong> {analysis.lossPreventionProtocol.capitalRule}</p>
                    <p>• <strong className="text-rose-400">Invalidation:</strong> {analysis.lossPreventionProtocol.invalidationZone}</p>
                  </div>
                </div>
              )}

              {/* Hindi Guidance Box */}
              {analysis.hindiGuidance && (
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-2.5">
                  <span className="text-lg">🇮🇳</span>
                  <div className="text-xs text-slate-300 leading-relaxed">
                    <strong className="text-slate-100 block mb-0.5 font-bold">Hindi Guidance:</strong>
                    {analysis.hindiGuidance}
                  </div>
                </div>
              )}

              {/* Confluence list */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 mb-2">Confluence Matrix:</div>
                <div className="flex flex-col gap-1.5">
                  {analysis.indicatorConfluence.map((c, i) => (
                    <div
                      key={i}
                      className="text-xs text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800 flex items-start gap-2"
                    >
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#0B0E14] flex items-center justify-between">
          <button
            onClick={fetchAnalysis}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-300 hover:bg-slate-800 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Re-scan Setup</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-indigo-600/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
