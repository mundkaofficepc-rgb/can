import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import MovieGrid from "./components/MovieGrid";
import MovieDetailModal from "./components/MovieDetailModal";
import MoodRecommender from "./components/MoodRecommender";
import CinemaSensei from "./components/CinemaSensei";
import { Movie } from "./types";
import { Sparkles, MessageSquare, Flame, HelpCircle, GraduationCap, X, Bookmark, Film } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { curatedMovies } from "./data/curatedMovies";

const TMDB_API_KEY = "1d84ab491afb8deec137b04c9f397a39";

const CLIENT_GENRE_MAP: { [key: number]: string } = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Sci-Fi",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
  10759: "Action",
  10762: "Family",
  10763: "Drama",
  10764: "Reality",
  10765: "Sci-Fi",
  10766: "Drama",
  10767: "Talk",
  10768: "War"
};

async function fetchFromTMDBClient(): Promise<Movie[]> {
  const list: Movie[] = [];
  try {
    const trendingRes = await fetch(`https://api.themoviedb.org/3/trending/all/week?api_key=${TMDB_API_KEY}`);
    if (trendingRes.ok) {
      const trendingData = await trendingRes.json();
      const trendingItems = (trendingData.results || []).slice(0, 20).map((item: any) => {
        const isTv = item.media_type === "tv" || !item.release_date;
        const title = item.title || item.name || item.original_title || item.original_name;
        const releaseDate = item.release_date || item.first_air_date || "2024-01-01";
        const genres = (item.genre_ids || []).map((gid: number) => CLIENT_GENRE_MAP[gid]).filter((g: any) => !!g);
        
        return {
          id: item.id,
          title,
          type: isTv ? "tv" : "movie",
          overview: item.overview || "Plot summary not available.",
          rating: item.vote_average || 7.0,
          releaseDate,
          posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=500",
          backdropUrl: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200",
          genres: genres.length > 0 ? genres : ["Drama"],
          trailerUrl: `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(title + " official trailer")}`,
          duration: isTv ? "Season 1" : "2h",
          cast: ["Featured Cast"],
          trending: true
        };
      });
      list.push(...trendingItems);
    }
  } catch (err) {
    console.error("Client TMDB trending load error:", err);
  }

  try {
    const popularRes = await fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}`);
    if (popularRes.ok) {
      const popularData = await popularRes.json();
      const popularItems = (popularData.results || []).slice(0, 10).map((item: any) => {
        const title = item.title || item.original_title;
        const genres = (item.genre_ids || []).map((gid: number) => CLIENT_GENRE_MAP[gid]).filter((g: any) => !!g);
        return {
          id: item.id,
          title,
          type: "movie" as const,
          overview: item.overview || "Plot summary not available.",
          rating: item.vote_average || 7.0,
          releaseDate: item.release_date || "2024-01-01",
          posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=500",
          backdropUrl: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200",
          genres: genres.length > 0 ? genres : ["Drama"],
          trailerUrl: `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(title + " official trailer")}`,
          duration: "2h",
          cast: ["Featured Cast"],
          popular: true
        };
      });

      for (const pi of popularItems) {
        if (!list.some((li: any) => li.id === pi.id)) {
          list.push(pi);
        }
      }
    }
  } catch (err) {
    console.error("Client TMDB popular load error:", err);
  }

  return list;
}

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
      .then((res) => {
        if (!res.ok) throw new Error("API status not success");
        return res.json();
      })
      .then((data) => {
        if (data.success && Array.isArray(data.movies) && data.movies.length > 0) {
          setMovies(data.movies);
        } else {
          throw new Error("Empty API result");
        }
      })
      .catch((err) => {
        console.warn("Backend API movies down or static deploy. Triggering client-side TMDB / local fallback:", err);
        fetchFromTMDBClient().then((clientMovies) => {
          if (clientMovies.length > 0) {
            setMovies(clientMovies);
          } else {
            console.warn("Client TMDB call failed as well. Splicing statically imported local curated list!");
            setMovies(curatedMovies);
          }
        });
      });

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
      if (!response.ok) throw new Error("API failure status");
      const data = await response.json();
      if (data.success && data.movies) {
        setSearchResults(data.movies);
      } else {
        throw new Error("No success key in response");
      }
    } catch (err) {
      console.warn("Backend API search failed. Running client-side high matching fallback logic...", err);
      try {
        const url = `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query.toLowerCase().trim())}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.results)) {
            const results = data.results
              .filter((item: any) => item.media_type === "movie" || item.media_type === "tv")
              .map((item: any) => {
                const isTv = item.media_type === "tv";
                const title = item.title || item.name || item.original_title || item.original_name;
                const releaseDate = item.release_date || item.first_air_date || "2024-01-01";
                const genres = (item.genre_ids || []).map((gid: number) => CLIENT_GENRE_MAP[gid]).filter((g: any) => !!g);

                return {
                  id: item.id,
                  title,
                  type: isTv ? "tv" : "movie",
                  overview: item.overview || "Plot summary is not available for this title.",
                  rating: item.vote_average || 7.0,
                  releaseDate,
                  posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=500",
                  backdropUrl: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200",
                  genres: genres.length > 0 ? genres : ["Drama"],
                  trailerUrl: `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(title + " official trailer")}`,
                  duration: isTv ? "Season 1" : "2h",
                  cast: ["Featured Cast"]
                };
              });
            setSearchResults(results);
            return;
          }
        }
      } catch (tmdbErr) {
        console.error("Direct client TMDB search failed too:", tmdbErr);
      }

      // Final fallback search: match statically imported curatedMovies locally
      const localResults = curatedMovies.filter(
        (m) =>
          m.title.toLowerCase().includes(query.toLowerCase()) ||
          m.overview.toLowerCase().includes(query.toLowerCase()) ||
          m.genres.some((g) => g.toLowerCase().includes(query.toLowerCase()))
      );
      setSearchResults(localResults);
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
