import { AnimatePresence, motion } from "motion/react";
import { History, Search, Trash2, X } from "lucide-react";
import React, { useState, useEffect, useRef } from "react";

type ExpandingSearchDockProps = {
  onSearch?: (query: string) => void;
  onExpansionChange?: (isExpanded: boolean) => void;
  placeholder?: string;
};

export function ExpandingSearchDock({
  onSearch,
  onExpansionChange,
  placeholder = "Search...",
}: ExpandingSearchDockProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [query, setQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("cinestream_recent_searches");
      if (saved) setRecentSearches(JSON.parse(saved));
    } catch (e) {
      console.error("Failed to load recent searches", e);
    }
  }, []);

  const saveSearchQuery = (q: string) => {
    const trimmed = q.trim();
    if (!trimmed) return;
    const next = [trimmed, ...recentSearches.filter(s => s.toLowerCase() !== trimmed.toLowerCase())].slice(0, 5);
    setRecentSearches(next);
    localStorage.setItem("cinestream_recent_searches", JSON.stringify(next));
  };

  const handleExpand = () => {
    setIsExpanded(true);
    onExpansionChange?.(true);
    setIsDropdownOpen(true);
  };

  const handleCollapse = () => {
    setIsExpanded(false);
    onExpansionChange?.(false);
    setQuery("");
    setIsDropdownOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && query) {
      onSearch(query);
      saveSearchQuery(query);
      setIsDropdownOpen(false);
    }
  };

  const handleRecentClick = (q: string) => {
    setQuery(q);
    onSearch?.(q);
    saveSearchQuery(q);
    setIsDropdownOpen(false);
  };

  const clearRecent = (e: React.MouseEvent, q: string) => {
    e.stopPropagation();
    const next = recentSearches.filter(s => s !== q);
    setRecentSearches(next);
    localStorage.setItem("cinestream_recent_searches", JSON.stringify(next));
  };

  return (
    <div className="relative w-full flex justify-center" ref={containerRef}>
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.button
            key="icon"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={handleExpand}
            className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-md transition-colors hover:bg-white/10"
          >
            <Search className="h-4 w-4 sm:h-5 sm:w-5" />
          </motion.button>
        ) : (
          <motion.form
            key="input"
            initial={{ width: 40, opacity: 0 }}
            animate={{ width: "100%", opacity: 1 }}
            exit={{ width: 40, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
            onSubmit={handleSubmit}
            className="relative w-full max-w-[170px] xs:max-w-[200px] sm:max-w-[280px] md:max-w-[380px] lg:max-w-[500px]"
          >
            <motion.div
              initial={{ backdropFilter: "blur(0px)" }}
              animate={{ backdropFilter: "blur(12px)" }}
              className="relative flex items-center gap-2 overflow-hidden rounded-full border border-white/10 bg-white/5 backdrop-blur-md"
            >
              <div className="ml-3 sm:ml-4">
                <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-400" />
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsDropdownOpen(true)}
                placeholder={placeholder}
                autoFocus
                className="h-10 sm:h-12 flex-1 bg-transparent pr-2 sm:pr-4 text-xs sm:text-sm text-white outline-none placeholder:text-zinc-500"
              />

              {/* Search History Dropdown */}
              <AnimatePresence>
                {isDropdownOpen && recentSearches.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute top-full left-0 right-0 mt-2 rounded-2xl bg-zinc-900/95 border border-white/10 shadow-2xl backdrop-blur-xl overflow-hidden z-[100]"
                  >
                    <div className="p-3 border-b border-white/5 bg-white/5 flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 px-1">Recent Discoveries</span>
                      <button 
                        type="button"
                        onClick={() => {
                          setRecentSearches([]);
                          localStorage.removeItem("cinestream_recent_searches");
                        }}
                        className="text-[9px] font-bold text-zinc-600 hover:text-[#ff4e00] transition-colors uppercase tracking-wider"
                      >
                        Clear All
                      </button>
                    </div>
                    <div className="py-1">
                      {recentSearches.map((s, idx) => (
                        <div
                          key={idx}
                          onClick={() => handleRecentClick(s)}
                          className="flex items-center justify-between px-4 py-2.5 hover:bg-white/5 cursor-pointer group transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <History className="h-3.5 w-3.5 text-zinc-600 group-hover:text-zinc-400" />
                            <span className="text-sm font-medium text-zinc-300 group-hover:text-white truncate max-w-[180px]">{s}</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => clearRecent(e, s)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-zinc-600 hover:text-red-400 transition-all"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="button"
                onClick={handleCollapse}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="mr-1.5 sm:mr-2 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full hover:bg-white/10"
              >
                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </motion.button>
            </motion.div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
