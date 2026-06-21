import React, { useState } from "react";
import { Film, Search, Sparkles, Bookmark, Play, AlertCircle } from "lucide-react";

interface HeaderProps {
  onSearch: (query: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hasApiKey: boolean;
  watchlistCount: number;
}

export default function Header({
  onSearch,
  activeTab,
  setActiveTab,
  hasApiKey,
  watchlistCount,
}: HeaderProps) {
  const [searchVal, setSearchVal] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchVal);
  };

  const handleClear = () => {
    setSearchVal("");
    onSearch("");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#050505]/75 backdrop-blur-xl px-4 py-4 md:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        
        {/* Logo and Brand */}
        <div 
          onClick={() => { setActiveTab("movies"); handleClear(); }} 
          className="flex cursor-pointer items-center gap-2.5 group"
          id="brand-logo"
        >
          <div className="rounded-lg bg-[#ff4e00] p-2 text-white shadow-lg shadow-[#ff4e00]/45 transition-transform group-hover:scale-105">
            <Film className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-display text-xl font-extrabold tracking-tighter text-white">
              CINE<span className="text-[#ff4e00] drop-shadow-[0_0_8px_rgba(255,78,0,0.5)]">STREAM</span>
            </h1>
            <p className="font-mono text-[9px] tracking-widest text-[#ff4e00]/70 font-semibold uppercase">ATMOSPHERE PRO</p>
          </div>
        </div>

        {/* Search Bar Form */}
        <form onSubmit={handleSubmit} className="relative flex-1 max-w-md w-full" id="search-form">
          <input
            id="search-input"
            type="text"
            placeholder="Search titles, genres, or let AI generate matches..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full rounded-full border border-white/10 bg-white/5 py-2 pl-10 pr-10 text-sm font-sans text-white placeholder-zinc-500 outline-none transition-all focus:border-[#ff4e00] focus:ring-1 focus:ring-[#ff4e00] focus:bg-white/10"
          />
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-zinc-400" />
          {searchVal && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3.5 top-2 text-xs text-zinc-400 hover:text-white"
            >
              Clear
            </button>
          )}
        </form>

        {/* Navigation Tabs and AI Indicator */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-4 justify-center">
          <nav className="flex items-center gap-1 rounded-full bg-white/5 p-1 border border-white/5">
            <button
              id="tab-movies"
              onClick={() => { setActiveTab("movies"); }}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === "movies"
                  ? "bg-[#ff4e00] text-white shadow-lg shadow-[#ff4e00]/30 font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Play className="h-3.5 w-3.5" />
              Cinema
            </button>
            
            <button
              id="tab-mood"
              onClick={() => setActiveTab("mood")}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === "mood"
                  ? "bg-[#ff4e00] text-white shadow-lg shadow-[#ff4e00]/30 font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI Recommendations
            </button>

            <button
              id="tab-watchlist"
              onClick={() => setActiveTab("watchlist")}
              className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                activeTab === "watchlist"
                  ? "bg-[#ff4e00] text-white shadow-lg shadow-[#ff4e00]/30 font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" />
              My List
              {watchlistCount > 0 && (
                <span className="ml-1 rounded-full bg-white px-1.5 py-0.5 text-[9px] font-bold text-black font-mono">
                  {watchlistCount}
                </span>
              )}
            </button>
          </nav>

          {/* AI Security indicator */}
          <div className="flex items-center gap-1 rounded-full bg-white/5 border border-white/5 px-3 py-1.5 font-mono text-[9px] text-zinc-400 shadow">
            {hasApiKey ? (
              <span className="flex items-center gap-1 text-green-400 font-semibold tracking-wide">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                AI ENGAGED
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[#ff4e00] font-semibold tracking-wide" title="Connect GEMINI_API_KEY for true AI searches & reviews">
                <AlertCircle className="h-3 w-3" />
                LOCAL MODE
              </span>
            )}
          </div>
        </div>

      </div>
    </header>
  );
}
