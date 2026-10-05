import React from "react";
import { BarChart2, Zap, Layers, Sparkles, List } from "lucide-react";

export type MobileTab = "CHART" | "SIGNALS" | "ORDERBOOK" | "AI" | "WATCHLIST";

interface MobileBottomNavProps {
  activeTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
  activeSignalCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  activeSignalCount = 1,
}) => {
  const tabs = [
    { id: "CHART" as MobileTab, label: "Chart", icon: BarChart2 },
    { id: "SIGNALS" as MobileTab, label: "Signals", icon: Zap, badge: activeSignalCount },
    { id: "ORDERBOOK" as MobileTab, label: "Book/Tape", icon: Layers },
    { id: "AI" as MobileTab, label: "AI Thesis", icon: Sparkles },
    { id: "WATCHLIST" as MobileTab, label: "Market", icon: List },
  ];

  return (
    <nav
      id="mobile-flutter-bottom-nav"
      className="w-full bg-[#0B0E14]/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around select-none z-30"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            id={`nav-tab-${tab.id.toLowerCase()}`}
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
              isActive
                ? "text-emerald-400 font-bold scale-105"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <div className="relative">
              <Icon className="w-5 h-5" />
              {tab.badge && tab.badge > 0 && (
                <span className="absolute -top-1.5 -right-2.5 w-4 h-4 bg-emerald-500 text-slate-950 rounded-full text-[9px] font-black flex items-center justify-center shadow-sm">
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            {isActive && (
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-0.5 shadow-sm shadow-emerald-400" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
