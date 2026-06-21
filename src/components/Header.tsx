import React, { useState } from "react";
import { Film, Search, Sparkles, Bookmark, Play, AlertCircle, ArrowLeft, Calendar, History, Trash2, X } from "lucide-react";
import { ExpandingSearchDock } from "./ui/expanding-search-dock-shadcnui";
import { toast } from "sonner";

interface HeaderProps {
  onSearch: (query: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hasApiKey: boolean;
  watchlistCount: number;
  selectedGenre?: string;
  onBackToHome?: () => void;
}

export default function Header({
  onSearch,
  activeTab,
  setActiveTab,
  hasApiKey,
  watchlistCount,
  selectedGenre = "All",
  onBackToHome,
}: HeaderProps) {
  const [searchVal, setSearchVal] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("cinestream_recent_searches");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const saveSearchQuery = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    
    setRecentSearches((prev) => {
      const clean = prev.filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
      const next = [trimmed, ...clean].slice(0, 5);
      localStorage.setItem("cinestream_recent_searches", JSON.stringify(next));
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchVal);
    saveSearchQuery(searchVal);
    setIsDropdownOpen(false);
  };

  const handleClear = () => {
    setSearchVal("");
    onSearch("");
    setIsDropdownOpen(false);
  };

  const handleRecentClick = (query: string) => {
    setSearchVal(query);
    onSearch(query);
    saveSearchQuery(query);
    setIsDropdownOpen(false);
  };

  const handleClearRecent = (e: React.MouseEvent, query: string) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const next = prev.filter((q) => q !== query);
      localStorage.setItem("cinestream_recent_searches", JSON.stringify(next));
      return next;
    });
  };

  const handleClearAllRecents = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem("cinestream_recent_searches");
    toast.info("Search history purged", {
      description: "Local search logs have been successfully cleared.",
    });
  };

  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const showBackButton = activeTab !== "movies" || selectedGenre !== "All" || !!searchVal;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#050505]/95 backdrop-blur-xl px-4 py-4 md:px-8 shadow-md shadow-black/25 transition-all">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        
        {/* Back Button & Brand Logo Container */}
        <div className={`flex items-center gap-3 transition-all duration-300 ${isSearchExpanded ? 'opacity-0 w-0 overflow-hidden sm:opacity-100 sm:w-auto' : 'opacity-100'}`}>
          {showBackButton && onBackToHome && (
            <button
              onClick={() => {
                handleClear();
                onBackToHome();
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-white/10 hover:border-[#ff4e00]/50 text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 hover:text-white bg-white/5 hover:bg-[#ff4e00]/10 transition-all cursor-pointer shadow-lg shadow-black/40 animate-fade-in"
              title="Go back to main catalog"
              id="header-back-button"
            >
              <ArrowLeft className="h-4 w-4 text-[#ff4e00]" />
              <span className={isSearchExpanded ? "hidden lg:inline" : "inline"}>Back</span>
            </button>
          )}

          {/* Logo and Brand */}
          <div 
            onClick={() => { 
              setActiveTab("movies"); 
              handleClear(); 
              if (onBackToHome) onBackToHome();
            }} 
            className="flex cursor-pointer items-center gap-2.5 group animate-fade-in"
            id="brand-logo"
          >
            <div className="rounded-lg bg-[#ff4e00] p-2 text-white shadow-lg shadow-[#ff4e00]/45 transition-transform group-hover:scale-105">
              <Film className="h-5 w-5" />
            </div>
            <div className={isSearchExpanded ? "hidden md:block" : "block"}>
              <h1 className="font-display text-xl font-extrabold tracking-tighter text-white">
                CINE<span className="text-[#ff4e00] drop-shadow-[0_0_8px_rgba(255,78,0,0.5)]">STREAM</span>
              </h1>
              <p className="font-mono text-[9px] tracking-widest text-[#ff4e00]/70 font-semibold uppercase">ATMOSPHERE PRO</p>
            </div>
          </div>
        </div>

        {/* Search Bar Dock */}
        <div className={`flex-1 flex justify-center transition-all duration-500 ${isSearchExpanded ? 'max-w-xl' : 'max-w-md'}`} id="search-container">
          <ExpandingSearchDock 
            onSearch={(query) => {
              onSearch(query);
              saveSearchQuery(query);
            }} 
            onExpansionChange={setIsSearchExpanded}
            placeholder="Search titles..."
          />
        </div>

        {/* Navigation Tabs and AI Indicator */}
        <div className={`flex items-center gap-2 sm:gap-4 justify-center transition-all duration-300 ${isSearchExpanded ? 'w-auto' : ''}`}>
          <nav className="flex items-center gap-1 rounded-full bg-white/5 p-1 border border-white/5">
            <button
              id="tab-movies"
              onClick={() => { setActiveTab("movies"); }}
              className={`flex items-center gap-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                isSearchExpanded ? "px-2 lg:px-4" : "px-4"
              } py-1.5 ${
                activeTab === "movies"
                  ? "bg-[#ff4e00] text-white shadow-lg shadow-[#ff4e00]/30 font-bold"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Play className="h-3.5 w-3.5" />
              <span className={isSearchExpanded ? "hidden lg:inline" : "inline"}>Cinema</span>
            </button>

            <button
              id="tab-upcoming"
              onClick={() => { setActiveTab("upcoming"); }}
              className={`flex items-center gap-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                isSearchExpanded ? "px-2 lg:px-4" : "px-4"
              } py-1.5 ${
                activeTab === "upcoming"
                  ? "bg-[#ff4e00] text-white shadow-lg shadow-[#ff4e00]/30 font-bold"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              <span className={isSearchExpanded ? "hidden lg:inline" : "inline"}>Upcoming</span>
            </button>
            
            <button
              id="tab-mood"
              onClick={() => setActiveTab("mood")}
              className={`flex items-center gap-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                isSearchExpanded ? "px-2 lg:px-4" : "px-4"
              } py-1.5 ${
                activeTab === "mood"
                  ? "bg-[#ff4e00] text-white shadow-lg shadow-[#ff4e00]/30 font-bold"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className={isSearchExpanded ? "hidden xl:inline" : "inline"}>
                {isSearchExpanded ? "AI" : "AI Recommendations"}
              </span>
            </button>

            <button
              id="tab-watchlist"
              onClick={() => setActiveTab("watchlist")}
              className={`flex items-center gap-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                isSearchExpanded ? "px-2 lg:px-4" : "px-4"
              } py-1.5 ${
                activeTab === "watchlist"
                  ? "bg-[#ff4e00] text-white shadow-lg shadow-[#ff4e00]/30 font-bold"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <Bookmark className="h-3.5 w-3.5" />
              <span className={isSearchExpanded ? "hidden lg:inline" : "inline"}>My List</span>
              {watchlistCount > 0 && (
                <span className="ml-1 rounded-full bg-white px-1.5 py-0.5 text-[9px] font-bold text-black font-mono">
                  {watchlistCount}
                </span>
              )}
            </button>
          </nav>

          {/* AI Security indicator */}
          <div className={`flex items-center gap-1 rounded-full bg-white/5 border border-white/5 px-3 py-1.5 font-mono text-[9px] text-zinc-400 shadow transition-all ${isSearchExpanded ? 'hidden xl:flex' : 'flex'}`}>
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
