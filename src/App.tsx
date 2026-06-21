import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import MovieGrid from "./components/MovieGrid";
import MovieDetailModal from "./components/MovieDetailModal";
import MoodRecommender from "./components/MoodRecommender";
import CinemaSensei from "./components/CinemaSensei";
import { Movie } from "./types";
import { Sparkles, MessageSquare, Flame, HelpCircle, GraduationCap, X, Bookmark, Film } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function App() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [activeTab, setActiveTab] = useState<string>("movies");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [watchlist, setWatchlist] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [selectedGenre, setSelectedGenre] = useState<string>("All");
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  
  // Floating Sensei Drawer active state
  const [isSenseiOpen, setIsSenseiOpen] = useState<boolean>(false);

  // Load curated list and verify database parameters on mount
  useEffect(() => {
    // 1. Fetch default curated movies list
    fetch("/api/movies")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setMovies(data.movies);
        }
      })
      .catch((err) => console.error("Could not fetch movies database list", err));

    // 2. Fetch config to verify API keys availability
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.hasApiKey) {
          setHasApiKey(true);
        }
      })
      .catch(() => {
        // Fallback check - if env exists, API will tell us anyway or work in simulated fallback
        setHasApiKey(true); 
      });

    // 3. Load user watchlist from local storage
    const stored = localStorage.getItem("cinestream_watchlist");
    if (stored) {
      try {
        setWatchlist(JSON.parse(stored));
      } catch (err) {
        console.error("Failed to parse watchlist", err);
      }
    }
  }, []);

  // Write watchlist updates to localstorage
  const handleToggleWatchlist = (movieID: number) => {
    let updated: number[];
    if (watchlist.includes(movieID)) {
      updated = watchlist.filter((id) => id !== movieID);
    } else {
      updated = [...watchlist, movieID];
    }
    setWatchlist(updated);
    localStorage.setItem("cinestream_watchlist", JSON.stringify(updated));
  };

  // Perform backend multi-engine search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      if (data.success && data.movies) {
        setSearchResults(data.movies);
      }
    } catch (err) {
      console.error("Multi-engine searching failed", err);
    } finally {
      setIsSearching(false);
    }
  };

  // Extruded genres list derived from standard keys
  const genresList = ["All", "Action", "Sci-Fi", "Drama", "Fantasy", "Animation", "Thriller"];

  // Filter bookmarks movies
  const watchlistMovies = movies.filter((m) => watchlist.includes(m.id));

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col selection:bg-[#ff4e00] selection:text-white relative">
      {/* 0. ATMOSPHERIC BACKDROP GLOW */}
      <div className="atmosphere" />

      {/* 1. TOP BRANDED HEADER MODULE */}
      <Header
        onSearch={handleSearch}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasApiKey={hasApiKey}
        watchlistCount={watchlist.length}
      />

      {/* 2. BODY CHASSIS */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 py-8 relative z-10">
        
        {/* Render search results if there's an active query */}
        {searchQuery ? (
          <div className="space-y-4 animate-fade-in">
            <button
              onClick={() => handleSearch("")}
              className="text-xs text-[#ff4e00] hover:text-[#ff4e00]/80 font-mono tracking-wider uppercase mb-2 flex items-center gap-1.5 cursor-pointer"
            >
              ← Back To Curated Grid
            </button>
            <MovieGrid
              movies={searchResults}
              title={`Search Results for "${searchQuery}"`}
              onSelectMovie={setSelectedMovie}
              onToggleWatchlist={handleToggleWatchlist}
              watchlist={watchlist}
              selectedGenre="All"
              isLoading={isSearching}
            />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === "movies" && (
              <motion.div
                key="movies-layout"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-8"
              >
                {/* Cinema Spotlight Banner card */}
                {movies.length > 0 && (
                  <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-zinc-950/45 backdrop-blur-md p-6 md:p-10 flex flex-col md:flex-row items-center gap-8 shadow-2xl">
                    {/* Backdrop decorative mask */}
                    <img
                      src={movies[0].backdropUrl}
                      alt="Banner backdrop"
                      className="absolute inset-0 h-full w-full object-cover opacity-10 filter blur-xs pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent pointer-events-none" />

                    <img
                      src={movies[0].posterUrl}
                      alt="Banner spotlight"
                      className="relative h-60 w-40 object-cover rounded-xl border border-white/10 shadow-xl shadow-black/80"
                    />

                    <div className="relative flex-1 space-y-4 text-center md:text-left">
                      <div className="flex gap-2 items-center justify-center md:justify-start">
                        <div className="px-3 py-1 bg-[#ff4e00]/20 border border-[#ff4e00] text-[#ff4e00] rounded text-[10px] font-bold uppercase tracking-wider">
                          Cinema Spotlight Of The Month
                        </div>
                      </div>
                      
                      <h2 className="font-display text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-none">
                        {movies[0].title}
                      </h2>
                      
                      <p className="font-sans text-sm text-zinc-300 leading-relaxed max-w-2xl line-clamp-3">
                        {movies[0].overview}
                      </p>

                      <div className="flex items-center justify-center md:justify-start gap-4 text-xs font-mono text-zinc-400">
                        <span className="bg-white/10 rounded px-2 py-0.5">{movies[0].duration}</span>
                        <span>{movies[0].genres.join(" / ")}</span>
                        <span>{movies[0].releaseDate.substring(0, 4)}</span>
                      </div>

                      <div className="flex flex-wrap gap-3 items-center justify-center md:justify-start pt-2">
                        <button
                          onClick={() => setSelectedMovie(movies[0])}
                          className="px-6 py-3 rounded-lg bg-[#ff4e00] hover:bg-[#ff4e00]/90 active:bg-orange-700 text-white text-xs font-bold uppercase tracking-wide transition-all shadow-lg shadow-[#ff4e00]/25 flex items-center gap-2 cursor-pointer"
                        >
                          <Film className="h-4 w-4" />
                          Stream Now
                        </button>
                        <button
                          onClick={() => handleToggleWatchlist(movies[0].id)}
                          className="px-5 py-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white text-zinc-300 text-xs font-bold uppercase tracking-wide transition-all cursor-pointer"
                        >
                          {watchlist.includes(movies[0].id) ? "Bookmarked ✓" : "Add to List"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Primary Movie Catalogue Grid */}
                <MovieGrid
                  movies={movies}
                  title="Featured Blockbusters & Series"
                  onSelectMovie={setSelectedMovie}
                  onToggleWatchlist={handleToggleWatchlist}
                  watchlist={watchlist}
                  selectedGenre={selectedGenre}
                  onGenreSelect={setSelectedGenre}
                  genresList={genresList}
                />
              </motion.div>
            )}

            {activeTab === "mood" && (
              <motion.div
                key="mood-layout"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <MoodRecommender
                  onSelectMovie={setSelectedMovie}
                  onToggleWatchlist={handleToggleWatchlist}
                  watchlist={watchlist}
                  genresList={genresList}
                />
              </motion.div>
            )}

            {activeTab === "watchlist" && (
              <motion.div
                key="watchlist-layout"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <MovieGrid
                  movies={watchlistMovies}
                  title="My Curated Watchlist"
                  onSelectMovie={setSelectedMovie}
                  onToggleWatchlist={handleToggleWatchlist}
                  watchlist={watchlist}
                  selectedGenre="All"
                />
              </motion.div>
            )}
          </AnimatePresence>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-zinc-90 w-full py-6 bg-zinc-950 mt-12 text-zinc-600 text-xs text-center font-mono">
        <p>© 2026 CineStream V2.0. Clean, Modern Cinema Discovery & Streaming Interface.</p>
        <p className="mt-1 px-4 max-w-lg mx-auto text-zinc-700">
          This system integrates third-party embeds and dynamic fallback AI modeling. All key materials safely proxy through Express endpoints.
        </p>
      </footer>

      {/* 3. FLOATING INTUITIVE AI FILM GURU DRAWER */}
      {/* Drawer Toggle Trigger Button */}
      <button
        onClick={() => setIsSenseiOpen(!isSenseiOpen)}
        className="fixed bottom-6 right-6 z-40 rounded-full bg-[#ff4e00] p-4 text-white hover:bg-[#ff4e00]/90 shadow-xl shadow-[#ff4e00]/30 border border-white/5 flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-105"
        id="trigger-sensei-chat"
        title="Chat with Cinema Sensei"
      >
        {isSenseiOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6 fill-current" />}
      </button>

      {/* Floating Panel overlay wrapper */}
      <AnimatePresence>
        {isSenseiOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-45 max-w-sm w-[90%] shadow-2xl"
          >
            <CinemaSensei
              currentMovie={selectedMovie}
              onClose={() => setIsSenseiOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. DETAIL MOVIE MODAL OVERLAY */}
      <AnimatePresence>
        {selectedMovie && (
          <MovieDetailModal
            movie={selectedMovie}
            onClose={() => setSelectedMovie(null)}
            onToggleWatchlist={handleToggleWatchlist}
            isBookmarked={watchlist.includes(selectedMovie.id)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
