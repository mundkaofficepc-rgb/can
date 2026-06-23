import React from "react";
import { Play, Calendar, Sparkles, Bookmark, Settings } from "lucide-react";
import { motion } from "motion/react";

interface MobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  watchlistCount: number;
  onOpenSettings: () => void;
}

export default function MobileNav({ activeTab, setActiveTab, watchlistCount, onOpenSettings }: MobileNavProps) {
  const tabs = [
    { id: "movies", label: "Cinema", icon: Play },
    { id: "upcoming", label: "Soon", icon: Calendar },
    { id: "mood", label: "AI", icon: Sparkles },
    { id: "watchlist", label: "List", icon: Bookmark },
    { id: "settings", label: "Menu", icon: Settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] sm:hidden">
      {/* Visual background with blur */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl border-t border-white/5" />
      
      {/* Safe area padding for newer iOS devices if needed, otherwise standard 16px */}
      <nav className="relative flex items-center justify-around px-4 pt-3 pb-6 h-full">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === "settings") {
                  onOpenSettings();
                } else {
                  setActiveTab(tab.id);
                }
              }}
              className="relative flex flex-col items-center gap-1 min-w-[56px] group"
            >
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-active"
                  className="absolute -top-1 w-10 h-1 bg-[#ff4e00] rounded-full shadow-[0_0_10px_#ff4e00]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              <div className={`p-1.5 transition-all duration-300 ${isActive ? 'text-[#ff4e00]' : 'text-zinc-500'}`}>
                <Icon className={`h-6 w-6 ${isActive ? 'fill-[#ff4e00]/10' : ''}`} />
                
                {tab.id === "watchlist" && watchlistCount > 0 && (
                  <span className="absolute top-1 right-3 flex h-4 w-4 items-center justify-center rounded-full bg-[#ff4e00] text-[8px] font-black text-white shadow-sm">
                    {watchlistCount}
                  </span>
                )}
              </div>
              
              <span className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-zinc-500'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
