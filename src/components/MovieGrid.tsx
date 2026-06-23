import React from "react";
import MovieCardSkeleton from "./MovieCardSkeleton";
import { Star, Bookmark, BookmarkCheck, Play, ArrowRight, Eye, Grid, Flame, Rocket, Theater, Sparkles, Palette, Skull, Lock } from "lucide-react";
import { Movie } from "../types";
import { motion } from "motion/react";
import { isPlayable } from "@/lib/utils";

interface MovieGridProps {
  movies: Movie[];
  title: string;
  onSelectMovie: (movie: Movie) => void;
  onToggleWatchlist: (mId: number) => void;
  watchlist: number[];
  selectedGenre: string;
  onGenreSelect?: (genre: string) => void;
  genresList?: string[];
  isLoading?: boolean;
  sortBy?: string;
  onSortByChange?: (sort: string) => void;
}

const getGenreIcon = (genre: string) => {
  const normalized = genre.toLowerCase();
  switch (normalized) {
    case "action":
      return <Flame className="h-3.5 w-3.5 text-orange-400" />;
    case "sci-fi":
      return <Rocket className="h-3.5 w-3.5 text-blue-400" />;
    case "drama":
      return <Theater className="h-3.5 w-3.5 text-pink-400" />;
    case "fantasy":
      return <Sparkles className="h-3.5 w-3.5 text-purple-400" />;
    case "animation":
      return <Palette className="h-3.5 w-3.5 text-yellow-400" />;
    case "thriller":
      return <Skull className="h-3.5 w-3.5 text-red-500" />;
    default:
      return <Grid className="h-3.5 w-3.5 text-zinc-400" />;
  }
};

export default function MovieGrid({
  movies,
  title,
  onSelectMovie,
  onToggleWatchlist,
  watchlist,
  selectedGenre,
  onGenreSelect,
  genresList,
  isLoading,
  sortBy = "popularity",
  onSortByChange,
}: MovieGridProps) {
  // With dynamic TMDB category discovery, the movies array represents the selected category matches.
  const displayedMovies = movies;

  // Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <div className="w-full py-3">
      {/* Genre Pills & Sort */}
      {( (genresList && onGenreSelect) || onSortByChange ) && (
        <div className="mb-6 flex flex-col md:flex-row gap-4 justify-between items-center py-2 border-b border-white/5 pb-4">
          {genresList && onGenreSelect && (
            <div className="flex flex-wrap gap-2 justify-center">
              {genresList.map((genre) => (
                <button
                  key={genre}
                  onClick={() => onGenreSelect(genre)}
                  className={`rounded-full px-4 py-1.5 text-[10px] font-semibold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                    selectedGenre.toLowerCase() === genre.toLowerCase()
                      ? "bg-[#ff4e00] text-white shadow-lg shadow-[#ff4e00]/30 font-bold scale-[1.02]"
                      : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-white/5"
                  }`}
                >
                  {getGenreIcon(genre)}
                  <span>{genre}</span>
                </button>
              ))}
            </div>
          )}
          
          {onSortByChange && (
            <div className="flex items-center gap-2 bg-[#050505] border border-white/10 rounded-full px-3 py-1 shrink-0">
               <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-widest pl-1">Sort by:</span>
               <select
                 value={sortBy}
                 onChange={(e) => onSortByChange(e.target.value)}
                 className="bg-transparent text-[11px] text-zinc-200 border-none font-bold font-mono focus:outline-none focus:ring-0 cursor-pointer"
               >
                 <option value="popularity" className="bg-[#111] text-white">Popularity</option>
                 <option value="rating" className="bg-[#111] text-white">Rating</option>
                 <option value="releaseDate" className="bg-[#111] text-white">Newest</option>
                 <option value="releaseDateOldest" className="bg-[#111] text-white">Oldest</option>
                 <option value="alphabetical" className="bg-[#111] text-white">Alphabetical (A-Z)</option>
                 <option value="alphabeticalReverse" className="bg-[#111] text-white">Alphabetical (Z-A)</option>
               </select>
            </div>
          )}
        </div>
      )}

      {/* Grid Title */}
      <div className="mb-3 sm:mb-5 flex items-center justify-between px-1">
        <div>
          <h2 className="font-display text-sm sm:text-lg md:text-2xl tracking-wide text-white border-l-[3px] sm:border-l-4 border-[#ff4e00] pl-2 sm:pl-3.5 italic sm:not-italic">
            {title}
          </h2>
          <p className="text-[10px] sm:text-xs text-zinc-500 mt-0.5 sm:mt-1">
            {isLoading ? "Searching world directories..." : `Found ${displayedMovies.length} titles`}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 sm:gap-6 px-1 sm:px-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      ) : displayedMovies.length === 0 ? (
        <div className="flex min-h-[250px] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#050505]/40 backdrop-blur p-8 text-center gap-4 animate-fade-in">
          <div>
            <p className="font-sans text-sm text-zinc-400">No movies found in this collection.</p>
            <p className="text-xs text-zinc-600 mt-1">Try another search keyword, or use the interactive buttons below to get back to streaming!</p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {selectedGenre !== "All" && (
              <button
                type="button"
                onClick={() => onGenreSelect && onGenreSelect("All")}
                className="px-4 py-2 border border-[#ff4e00]/20 bg-[#ff4e00]/10 hover:bg-[#ff4e00]/25 text-[#ff4e00] rounded-xl text-xs font-bold uppercase tracking-wider font-mono cursor-pointer transition-colors"
              >
                ← Back to All Genres
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (onGenreSelect) onGenreSelect("All");
                const searchInput = document.getElementById("search-input") as HTMLInputElement;
                if (searchInput) {
                  searchInput.value = "";
                }
                const clearButton = document.querySelector("form button") as HTMLButtonElement;
                if (clearButton) {
                  clearButton.click();
                } else {
                  window.location.reload();
                }
              }}
              className="px-4 py-2 border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-bold uppercase tracking-wider font-mono cursor-pointer transition-colors"
            >
              Reset Filters & Show All
            </button>
          </div>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-3 xs:grid-cols-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 sm:gap-6 px-1 sm:px-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {displayedMovies.map((movie) => {
            const isBookmarked = watchlist.includes(movie.id);
            return (
              <motion.div
                key={movie.id}
                variants={cardVariants}
                className="group relative flex flex-col overflow-hidden rounded-xl bg-[#111111]/40 border border-white/5 shadow-md transition-all duration-300 hover:border-[#ff4e00]/50 hover:shadow-lg hover:shadow-[#ff4e00]/5 cursor-pointer"
                id={`movie-card-${movie.id}`}
              >
                {/* Poster Container */}
                <div 
                  onClick={() => onSelectMovie(movie)}
                  className="relative aspect-[2/3] w-full overflow-hidden bg-[#121212]"
                >
                  {movie.posterUrl === "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center border-2 border-dashed border-zinc-800 bg-[#0a0a0a]">
                       <div className="relative mb-3">
                         <div className="absolute inset-0 animate-ping opacity-20 bg-[#ff4e00] rounded-full blur-xl border-dashed"></div>
                         <Lock className="h-10 w-10 text-zinc-600 animate-pulse relative z-10" />
                       </div>
                       <span className="font-mono text-[10px] uppercase font-black tracking-widest text-[#ff4e00] opacity-80 border-b border-[#ff4e00]/30 pb-1 mb-2">Classified</span>
                       <span className="text-xs font-bold text-zinc-500 leading-tight">Asset Under<br/>Construction</span>
                    </div>
                  ) : (
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        // Fallback Unsplash image if TMDB fails
                        e.currentTarget.src = "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=500&auto=format&fit=crop";
                      }}
                    />
                  )}

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-85" />

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
                    {!isPlayable(movie.releaseDate) ? (() => {
                      const daysLeft = Math.ceil((new Date(movie.releaseDate as string).getTime() - new Date("2026-06-21").getTime()) / (1000 * 3600 * 24));
                      return (
                        <div className="rounded-xl bg-[#ff4e00]/95 px-3 py-1.5 text-white shadow-xl shadow-[#ff4e00]/40 text-center backdrop-blur-xs transform scale-75 group-hover:scale-100 transition-transform">
                          <span className="block text-[9px] font-mono font-black uppercase tracking-widest text-[#ff4e00] bg-black/40 px-1 py-0.5 rounded mb-0.5">
                            {daysLeft > 0 ? `In ${daysLeft} Days` : "Expected"}
                          </span>
                          <span className="block text-xs font-bold leading-tight">
                            {new Date(movie.releaseDate as string).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: '2-digit' })}
                          </span>
                        </div>
                      );
                    })() : (
                      <div className="rounded-full bg-[#ff4e00]/95 p-3 text-white shadow-xl shadow-[#ff4e00]/40 backdrop-blur-xs transform scale-75 group-hover:scale-100 transition-transform">
                        <Play className="h-5 w-5 fill-white" />
                      </div>
                    )}
                  </div>

                  {/* Ratings Tag */}
                  <div className="absolute left-2 top-2 flex items-center gap-1 rounded bg-black/85 px-1.5 py-0.5 font-mono text-[10px] font-bold text-[#f59e0b] shadow backdrop-blur-xs border border-white/5">
                    <Star className="h-3 w-3 fill-[#f59e0b] text-[#f59e0b]" />
                    {movie.rating.toFixed(1)}
                  </div>

                  {/* Form Factor Tag (Movie / TV) */}
                  <span className="absolute right-2 top-2 rounded bg-[#ff4e00]/90 px-1.5 py-0.5 font-mono text-[9px] font-bold tracking-wider text-white shadow backdrop-blur-xs">
                    {movie.type.toUpperCase()}
                  </span>
                </div>

                {/* Info Block */}
                <div className="flex flex-1 flex-col p-1.5 sm:p-3 z-10 overflow-hidden">
                  <div className="flex items-start justify-between gap-1">
                    <h3 
                      onClick={() => onSelectMovie(movie)}
                      className="line-clamp-1 font-display text-[9px] xs:text-[10px] sm:text-sm font-semibold text-zinc-100 group-hover:text-[#ff4e00] transition-colors"
                    >
                      {movie.title}
                    </h3>
                  </div>

                  {/* Genres / Metadata */}
                  <p className="mt-0.5 sm:mt-1 line-clamp-1 font-sans text-[8px] sm:text-[11px] text-zinc-400">
                    {movie.genres.join(", ")}
                  </p>

                  <div className="mt-auto pt-1.5 sm:pt-3 flex items-center justify-between border-t border-white/5">
                    <span className="font-mono text-[8px] sm:text-[10px] text-zinc-400 truncate pr-1">
                      {movie.releaseDate.substring(0, 4)} • {movie.duration}
                    </span>
                    
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWatchlist(movie.id);
                      }}
                      className="rounded p-1 text-zinc-400 hover:bg-white/5 hover:text-white transition-colors cursor-pointer"
                      title={isBookmarked ? "Remove from List" : "Add to List"}
                    >
                      {isBookmarked ? (
                        <BookmarkCheck className="h-4 w-4 text-[#ff4e00] fill-[#ff4e00]" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
