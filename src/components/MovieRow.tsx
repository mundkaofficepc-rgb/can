import React, { useRef } from "react";
import { Movie } from "../types";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Lock, Star, Bookmark, BookmarkCheck, Play, ArrowRight } from "lucide-react";
import { isPlayable } from "../utils";

interface MovieRowProps {
  movies: Movie[];
  title: string;
  onSelectMovie: (movie: Movie) => void;
  onToggleWatchlist: (mId: number) => void;
  watchlist: number[];
}

export default function MovieRow({
  movies,
  title,
  onSelectMovie,
  onToggleWatchlist,
  watchlist,
}: MovieRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -window.innerWidth / 1.5, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: window.innerWidth / 1.5, behavior: "smooth" });
    }
  };

  if (movies.length === 0) return null;

  return (
    <div className="w-full py-4 relative group/row">
      <div className="mb-4 flex flex-col md:flex-row md:items-center justify-between px-2 sm:px-6">
        <div>
          <h2 className="font-display text-xl font-bold tracking-wide text-white border-l-4 border-[#ff4e00] pl-3.5 flex items-center gap-2">
            {title}
            <ArrowRight className="h-4 w-4 text-[#ff4e00]/80 opacity-0 -translate-x-2 group-hover/row:opacity-100 group-hover/row:translate-x-0 transition-all duration-300" />
          </h2>
        </div>
      </div>

      <div className="relative">
        <button
          onClick={scrollLeft}
          className="absolute left-0 top-0 bottom-0 w-12 sm:w-16 z-20 flex flex-col items-center justify-center bg-gradient-to-r from-[#030303] via-[#030303]/80 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 disabled:opacity-0 cursor-pointer"
        >
          <ChevronLeft className="h-8 w-8 text-white filter drop-shadow-lg scale-90 hover:scale-125 transition-transform" />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-hide px-2 sm:px-6 py-2 snap-x snap-mandatory"
          style={{ scrollBehavior: 'smooth', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {movies.map((movie) => {
            const isBookmarked = watchlist.includes(movie.id);
            const playable = isPlayable(movie.releaseDate);

            return (
              <motion.div
                key={movie.id}
                className="group relative flex flex-col overflow-hidden bg-[#111111]/45 border border-white/5 rounded-2xl hover:border-white/10 transition-all cursor-pointer shadow-lg shadow-black/30 shrink-0 snap-start"
                style={{ width: "160px" }}
                whileHover={{ y: -5, scale: 1.02 }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => onSelectMovie(movie)}
              >
                <div className="relative aspect-[2/3] bg-[#121212] overflow-hidden">
                  {movie.posterUrl === "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center border-2 border-dashed border-zinc-800 bg-[#0a0a0a]">
                       <div className="relative mb-3">
                         <div className="absolute inset-0 animate-ping opacity-20 bg-[#ff4e00] rounded-full blur-xl border-dashed"></div>
                         <Lock className="h-8 w-8 text-zinc-600 animate-pulse relative z-10" />
                       </div>
                       <span className="font-mono text-[9px] uppercase font-black tracking-widest text-[#ff4e00] opacity-80 border-b border-[#ff4e00]/30 pb-1 mb-2">Classified</span>
                    </div>
                  ) : (
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
                      }}
                    />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-85" />
                  
                  <div className="absolute top-2 left-2 flex items-center gap-1 rounded bg-black/85 px-1.5 py-0.5 text-[10px] font-bold text-yellow-500">
                    <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                    {movie.rating.toFixed(1)}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWatchlist(movie.id);
                    }}
                    className="absolute right-2 top-2 z-10 rounded-full bg-black/50 p-2 text-white opacity-0 backdrop-blur transition-all duration-300 hover:bg-white/20 group-hover:opacity-100"
                  >
                    {isBookmarked ? (
                      <BookmarkCheck className="h-4 w-4 text-[#ff4e00]" />
                    ) : (
                      <Bookmark className="h-4 w-4" />
                    )}
                  </button>

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    {playable ? (
                      <div className="rounded-full bg-[#ff4e00]/90 p-3 shadow-lg shadow-[#ff4e00]/50 backdrop-blur-sm transform scale-90 group-hover:scale-100 transition-all">
                        <Play className="h-6 w-6 fill-white text-white" />
                      </div>
                    ) : (
                      <div className="rounded-full bg-[#050505]/80 p-3 shadow-lg shadow-black backdrop-blur border border-white/10 group-hover:scale-100 scale-90 transition-all flex flex-col items-center">
                        <Lock className="h-5 w-5 text-white animate-pulse" />
                      </div>
                    )}
                  </div>

                  {!playable && (
                     <div className="absolute top-2 right-2 flex items-center gap-1 rounded bg-black/85 px-2 py-0.5 text-[9px] font-bold text-zinc-300 uppercase tracking-widest border border-white/5">
                       Upcoming
                     </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-3">
                  <h3 className="line-clamp-1 font-display text-sm font-semibold text-white drop-shadow-md">
                    {movie.title}
                  </h3>
                  <div className="mt-auto flex items-center justify-between pt-1">
                    <span className="text-[11px] font-mono font-medium text-zinc-500 bg-white/5 px-2 py-0.5 rounded-sm border border-white/5">
                      {new Date(movie.releaseDate).getFullYear() || "UPCOMING"}
                    </span>
                    {movie.adult && <span className="text-[9px] font-bold text-red-500 border border-red-500/30 px-1 py-0.5 rounded backdrop-blur">18+</span>}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <button
          onClick={scrollRight}
          className="absolute right-0 top-0 bottom-0 w-12 sm:w-16 z-20 flex flex-col items-center justify-center bg-gradient-to-l from-[#030303] via-[#030303]/80 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 disabled:opacity-0 cursor-pointer"
        >
          <ChevronRight className="h-8 w-8 text-white filter drop-shadow-lg scale-90 hover:scale-125 transition-transform" />
        </button>
      </div>
    </div>
  );
}
