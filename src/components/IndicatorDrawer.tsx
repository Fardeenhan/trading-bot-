import React from "react";
import { IndicatorSettings } from "../types";
import { X, Check, Eye, EyeOff, SlidersHorizontal, Sparkles } from "lucide-react";

interface IndicatorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: IndicatorSettings;
  onUpdateSettings: (newSettings: IndicatorSettings) => void;
}

export const IndicatorDrawer: React.FC<IndicatorDrawerProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const toggle = (key: keyof IndicatorSettings) => {
    onUpdateSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  const applyPreset = (preset: "SCALP" | "DAY" | "SWING" | "ALL") => {
    if (preset === "SCALP") {
      onUpdateSettings({
        showEma20: true,
        showEma50: false,
        showEma200: false,
        showBollingerBands: true,
        showRsi: true,
        showMacd: false,
        showSuperTrend: true,
        showVolume: true,
      });
    } else if (preset === "DAY") {
      onUpdateSettings({
        showEma20: true,
        showEma50: true,
        showEma200: false,
        showBollingerBands: false,
        showRsi: true,
        showMacd: true,
        showSuperTrend: true,
        showVolume: true,
      });
    } else if (preset === "SWING") {
      onUpdateSettings({
        showEma20: false,
        showEma50: true,
        showEma200: true,
        showBollingerBands: false,
        showRsi: true,
        showMacd: true,
        showSuperTrend: true,
        showVolume: true,
      });
    } else if (preset === "ALL") {
      onUpdateSettings({
        showEma20: true,
        showEma50: true,
        showEma200: true,
        showBollingerBands: true,
        showRsi: true,
        showMacd: true,
        showSuperTrend: true,
        showVolume: true,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-md bg-[#0F141E] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-slate-100 text-sm">Technical Indicators</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Presets */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/40">
          <div className="text-[11px] font-bold text-slate-400 mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Trading Style Presets
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <button
              onClick={() => applyPreset("SCALP")}
              className="py-1.5 px-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-center transition"
            >
              ⚡ Scalping (1m - 5m)
            </button>
            <button
              onClick={() => applyPreset("DAY")}
              className="py-1.5 px-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-center transition"
            >
              🎯 Day Trade (15m - 1h)
            </button>
            <button
              onClick={() => applyPreset("SWING")}
              className="py-1.5 px-2.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 text-center transition"
            >
              🌊 Swing (4h - 1D)
            </button>
            <button
              onClick={() => applyPreset("ALL")}
              className="py-1.5 px-2.5 rounded-lg bg-emerald-950/50 hover:bg-emerald-900/50 text-emerald-400 border border-emerald-700/50 text-center transition"
            >
              ✨ Full Pro Suite
            </button>
          </div>
        </div>

        {/* Indicator Toggles */}
        <div className="p-4 flex flex-col gap-2 max-h-[350px] overflow-y-auto">
          {/* EMA 20 */}
          <div
            onClick={() => toggle("showEma20")}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 cursor-pointer transition select-none"
          >
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#F59E0B]" />
              <div>
                <div className="text-xs font-bold text-slate-200">EMA (20 Period)</div>
                <div className="text-[10px] text-slate-500">Short-term dynamic support & resistance</div>
              </div>
            </div>
            {settings.showEma20 ? (
              <Eye className="w-4 h-4 text-emerald-400" />
            ) : (
              <EyeOff className="w-4 h-4 text-slate-600" />
            )}
          </div>

          {/* EMA 50 */}
          <div
            onClick={() => toggle("showEma50")}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 cursor-pointer transition select-none"
          >
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#38BDF8]" />
              <div>
                <div className="text-xs font-bold text-slate-200">EMA (50 Period)</div>
                <div className="text-[10px] text-slate-500">Medium-term trend direction guide</div>
              </div>
            </div>
            {settings.showEma50 ? (
              <Eye className="w-4 h-4 text-emerald-400" />
            ) : (
              <EyeOff className="w-4 h-4 text-slate-600" />
            )}
          </div>

          {/* EMA 200 */}
          <div
            onClick={() => toggle("showEma200")}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 cursor-pointer transition select-none"
          >
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[#A855F7]" />
              <div>
                <div className="text-xs font-bold text-slate-200">EMA (200 Period)</div>
                <div className="text-[10px] text-slate-500">Major macro institutional trend baseline</div>
              </div>
            </div>
            {settings.showEma200 ? (
              <Eye className="w-4 h-4 text-emerald-400" />
            ) : (
              <EyeOff className="w-4 h-4 text-slate-600" />
            )}
          </div>

          {/* Bollinger Bands */}
          <div
            onClick={() => toggle("showBollingerBands")}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 cursor-pointer transition select-none"
          >
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-sky-400" />
              <div>
                <div className="text-xs font-bold text-slate-200">Bollinger Bands (20, 2)</div>
                <div className="text-[10px] text-slate-500">Volatility envelope & mean reversion</div>
              </div>
            </div>
            {settings.showBollingerBands ? (
              <Eye className="w-4 h-4 text-emerald-400" />
            ) : (
              <EyeOff className="w-4 h-4 text-slate-600" />
            )}
          </div>

          {/* SuperTrend */}
          <div
            onClick={() => toggle("showSuperTrend")}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 cursor-pointer transition select-none"
          >
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              <div>
                <div className="text-xs font-bold text-slate-200">SuperTrend (10, 3)</div>
                <div className="text-[10px] text-slate-500">ATR trailing stop & trend indicator</div>
              </div>
            </div>
            {settings.showSuperTrend ? (
              <Eye className="w-4 h-4 text-emerald-400" />
            ) : (
              <EyeOff className="w-4 h-4 text-slate-600" />
            )}
          </div>

          {/* Volume */}
          <div
            onClick={() => toggle("showVolume")}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800 cursor-pointer transition select-none"
          >
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-teal-400" />
              <div>
                <div className="text-xs font-bold text-slate-200">Volume Histogram</div>
                <div className="text-[10px] text-slate-500">Real-time volume bars with color delta</div>
              </div>
            </div>
            {settings.showVolume ? (
              <Eye className="w-4 h-4 text-emerald-400" />
            ) : (
              <EyeOff className="w-4 h-4 text-slate-600" />
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-500/20"
          >
            Apply Indicators
          </button>
        </div>
      </div>
    </div>
  );
};
