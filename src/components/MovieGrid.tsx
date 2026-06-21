import React from "react";
import { Star, Bookmark, BookmarkCheck, Play, ArrowRight, Eye } from "lucide-react";
import { Movie } from "../types";
import { motion } from "motion/react";

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
}

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
}: MovieGridProps) {
  // Filter movies local to grid if onGenreSelect is not active (or handle local filter)
  const displayedMovies = selectedGenre === "All"
    ? movies
    : movies.filter((m) => m.genres.some(g => g.toLowerCase() === selectedGenre.toLowerCase()));

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
    <div className="w-full py-6">
      {/* Genre Pills */}
      {genresList && onGenreSelect && (
        <div className="mb-8 flex flex-wrap gap-2 justify-center py-2 border-b border-white/5 pb-4">
          {genresList.map((genre) => (
            <button
              key={genre}
              onClick={() => onGenreSelect(genre)}
              className={`rounded-full px-5 py-2 text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer ${
                selectedGenre.toLowerCase() === genre.toLowerCase()
                  ? "bg-[#ff4e00] text-white shadow-lg shadow-[#ff4e00]/30 font-bold"
                  : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-white/5"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      )}

      {/* Grid Title */}
      <div className="mb-6 flex items-center justify-between px-2">
        <div>
          <h2 className="font-display text-xl font-bold md:text-2xl tracking-wide text-white border-l-4 border-[#ff4e00] pl-3.5">
            {title}
          </h2>
          <p className="text-xs text-zinc-500 mt-1">
            {isLoading ? "Searching world directories..." : `Displaying ${displayedMovies.length} matching cinematic masterworks.`}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-white/10 border-t-[#ff4e00]" />
          <p className="font-mono text-xs text-zinc-500">Querying streaming indices...</p>
        </div>
      ) : displayedMovies.length === 0 ? (
        <div className="flex min-h-[250px] flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-[#050505]/40 backdrop-blur pb-8 p-8 text-center">
          <p className="font-sans text-sm text-zinc-400">No movies found in this collection.</p>
          <p className="text-xs text-zinc-600 mt-1">Try another search keyword or ask the AI recommendation model below.</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 px-2"
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

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-85" />

                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-300 group-hover:opacity-100">
                    <div className="rounded-full bg-[#ff4e00]/95 p-3 text-white shadow-xl shadow-[#ff4e00]/40 backdrop-blur-xs transform scale-75 group-hover:scale-100 transition-transform">
                      <Play className="h-5 w-5 fill-white" />
                    </div>
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
                <div className="flex flex-1 flex-col p-3 z-10">
                  <div className="flex items-start justify-between gap-1">
                    <h3 
                      onClick={() => onSelectMovie(movie)}
                      className="line-clamp-1 font-display text-sm font-semibold text-zinc-100 group-hover:text-[#ff4e00]"
                    >
                      {movie.title}
                    </h3>
                  </div>

                  {/* Genres / Metadata */}
                  <p className="mt-1 line-clamp-1 font-sans text-[11px] text-zinc-400">
                    {movie.genres.join(", ")}
                  </p>

                  <div className="mt-auto pt-3 flex items-center justify-between border-t border-white/5">
                    <span className="font-mono text-[10px] text-zinc-400">
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
