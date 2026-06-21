import React, { useState } from "react";
import { Sparkles, Star, Play, Bookmark, Lock } from "lucide-react";
import { Movie, RecommendationResponse } from "../types";
import { motion } from "motion/react";
import { curatedMovies } from "../data/curatedMovies";
import { toast } from "sonner";

interface MoodRecommenderProps {
  onSelectMovie: (movie: Movie) => void;
  onToggleWatchlist: (mId: number) => void;
  watchlist: number[];
  genresList: string[];
}

export default function MoodRecommender({
  onSelectMovie,
  onToggleWatchlist,
  watchlist,
  genresList,
}: MoodRecommenderProps) {
  const [mood, setMood] = useState("");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [favoriteFilmInput, setFavoriteFilmInput] = useState("");
  const [favoriteFilms, setFavoriteFilms] = useState<string[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [recommendationResult, setRecommendationResult] = useState<RecommendationResponse | null>(null);

  const handleGenreToggle = (g: string) => {
    if (g === "All") return;
    if (selectedGenres.includes(g)) {
      setSelectedGenres(selectedGenres.filter((item) => item !== g));
    } else {
      setSelectedGenres([...selectedGenres, g]);
    }
  };

  const handleAddFav = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = favoriteFilmInput.trim();
    if (clean && !favoriteFilms.includes(clean)) {
      setFavoriteFilms([...favoriteFilms, clean]);
      setFavoriteFilmInput("");
      toast.success(`Film log updated`, {
        description: `"${clean}" added as a personal favorite reference.`,
      });
    }
  };

  const handleRemoveFav = (f: string) => {
    setFavoriteFilms(favoriteFilms.filter((item) => item !== f));
  };

  const generateAIRecommendations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: mood,
          preferredGenres: selectedGenres,
          favoredMovies: favoriteFilms,
        }),
      });
      if (!response.ok) throw new Error("API status error");
      const data = await response.json();
      if (data.success) {
        setRecommendationResult(data);
        toast.success("AI Insights Delivered", {
          description: "Found top-tier matches based on your mood analysis.",
        });
      } else {
        throw new Error("Success was false");
      }
    } catch (err) {
      console.warn("Backend AI recommendations offline or on static deploy. Running smart offline fallback model...", err);
      
      const lowerMood = mood.toLowerCase().trim();
      const matches = curatedMovies.filter((movie) => {
        // Match chosen genres
        const genreMatches = selectedGenres.length === 0 ||
          movie.genres.some((g) => selectedGenres.some((sg) => sg.toLowerCase() === g.toLowerCase()));

        // Match keyword description in title, overview, or genres list
        const keywordMatches = !lowerMood ||
          movie.title.toLowerCase().includes(lowerMood) ||
          movie.overview.toLowerCase().includes(lowerMood) ||
          movie.genres.some((g) => lowerMood.includes(g.toLowerCase()));

        return genreMatches && keywordMatches;
      });

      // If strict intersect matches have nothing, try relaxed union matching
      let finalMatches = matches;
      if (matches.length === 0) {
        finalMatches = curatedMovies.filter((movie) => {
          const genreMatches = selectedGenres.length > 0 &&
            movie.genres.some((g) => selectedGenres.some((sg) => sg.toLowerCase() === g.toLowerCase()));
          
          const keywordMatches = lowerMood && (
            movie.title.toLowerCase().includes(lowerMood) ||
            movie.overview.toLowerCase().includes(lowerMood)
          );
          return !!(genreMatches || keywordMatches);
        });
      }

      // Final ultimate fallback in case no matching genres or keywords found at all
      const displayList = finalMatches.length > 0 ? finalMatches : curatedMovies;

      // Map format with simulated reasoning response
      const simulatedReasoningResult: RecommendationResponse = {
        success: true,
        reasoning: mood.trim()
          ? `Searching deep catalogs for your mood: "${mood}". Found several titles matching your atmospheric vibe.`
          : `We loaded top-tier movies with genres [${selectedGenres.join(", ")}] from verified offline cinema libraries.`,
        movies: displayList.slice(0, 6) as Movie[],
        source: "fallback"
      };

      setRecommendationResult(simulatedReasoningResult);
      toast.info("Offline fallback mode active", {
        description: "Scanned local database for matches since the AI server is busy.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full py-6 max-w-5xl mx-auto px-2 relative z-10 animate-fade-in">
      <div className="mb-8 p-6 rounded-2xl border border-white/5 bg-[#050505]/45 backdrop-blur-md shadow-2xl">
        <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-6">
          <Sparkles className="h-5 w-5 text-[#ff4e00] animate-pulse" />
          <h2 className="font-display text-lg md:text-xl font-extrabold text-white tracking-wide uppercase">
            AI Studio Mood Matcher
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Inputs section */}
          <div className="space-y-5">
            {/* 1. Mood Description input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-0.5">
                Describe Your Mood or Desired Journey
              </label>
              <textarea
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                placeholder="E.g., 'I am looking for a mind-bending space drama with complex timelines and deep philosophical overtones' or 'Something funny and comforting to watch with pizza.'"
                className="w-full h-24 rounded-lg bg-white/5 border border-white/10 text-sm p-3 placeholder-zinc-500 text-white focus:outline-none focus:border-[#ff4e00] focus:ring-1 focus:ring-[#ff4e00] transition-colors resize-none font-sans"
              />
            </div>

            {/* 2. Genre multi select */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-0.5">
                Preferred Genres (Select multiple)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {genresList.filter((g) => g !== "All").map((g) => {
                  const active = selectedGenres.includes(g);
                  return (
                    <button
                      key={g}
                      onClick={() => handleGenreToggle(g)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-colors cursor-pointer ${
                        active
                          ? "bg-[#ff4e00] text-white font-bold shadow-md shadow-[#ff4e00]/20"
                          : "bg-white/5 text-zinc-400 hover:text-white border border-white/5"
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Inputs list: Favorites */}
          <div className="space-y-5 flex flex-col justify-between">
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block mb-0.5">
                Movies / Shows You Already Love
              </label>
              
              <form onSubmit={handleAddFav} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter title, e.g. Interstellar"
                  value={favoriteFilmInput}
                  onChange={(e) => setFavoriteFilmInput(e.target.value)}
                  className="flex-1 rounded-full bg-white/5 border border-white/10 text-xs px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-[#ff4e00]"
                />
                <button
                  type="submit"
                  className="bg-[#ff4e00]/25 hover:bg-[#ff4e00]/40 border border-[#ff4e00] text-[#ff4e00] px-4 rounded-full text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Add
                </button>
              </form>

              <div className="flex flex-wrap gap-1.5 min-h-[40px] pt-2">
                {favoriteFilms.length === 0 ? (
                  <span className="text-xs text-zinc-600 italic">No favorite films added yet</span>
                ) : (
                  favoriteFilms.map((f) => (
                    <span
                      key={f}
                      className="inline-flex items-center gap-1 bg-[#ff4e00]/10 border border-[#ff4e00]/20 text-[#ff4e00] text-xs px-2.5 py-1 rounded-full font-medium"
                    >
                      {f}
                      <button
                        type="button"
                        onClick={() => handleRemoveFav(f)}
                        className="hover:text-white ml-1 focus:outline-none font-bold text-[11px]"
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Launch CTA */}
            <button
              onClick={generateAIRecommendations}
              disabled={isLoading || (!mood.trim() && selectedGenres.length === 0 && favoriteFilms.length === 0)}
              className="w-full bg-[#ff4e00] hover:bg-[#ff4e00]/90 disabled:bg-[#111] disabled:text-zinc-600 border border-[#ff4e03] disabled:border-white/5 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-[#ff4e00]/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              {isLoading ? "Analyzing Cinema Paradises..." : "Initiate Mood Consultation"}
            </button>
          </div>

        </div>
      </div>

      {/* Recommendations Output Block */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/5 border-t-[#ff4e00]" />
          <div className="text-center">
            <p className="font-mono text-xs text-zinc-400">Consulting CineStream AI matching vectors...</p>
            <p className="text-[10px] text-[#ff4e00]/70 mt-1 uppercase tracking-wider font-semibold">Parsing casting tables • Compiling score sheets</p>
          </div>
        </div>
      ) : recommendationResult ? (
        <div className="space-y-6">
          {/* Header Action Bar with Reset/Back Button */}
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h3 className="font-display font-bold text-sm uppercase tracking-wider text-white">Recommended for You</h3>
            <button
              onClick={() => {
                setRecommendationResult(null);
                setMood("");
                setSelectedGenres([]);
                setFavoriteFilms([]);
              }}
              className="px-4 py-1.5 rounded-full border border-white/10 hover:border-[#ff4e00]/50 text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 hover:text-white bg-white/5 hover:bg-[#ff4e00]/10 transition-colors cursor-pointer"
            >
              ← Back to Questions / Reset
            </button>
          </div>

          {/* Reasoning Alert banner */}
          <div className="p-4 rounded-xl border border-[#ff4e00]/25 bg-[#ff4e00]/5 text-zinc-350">
            <h4 className="font-display font-black text-xs text-[#ff4e00] uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" />
              Model Insights
            </h4>
            <p className="font-sans text-sm italic">&ldquo;{recommendationResult.reasoning}&rdquo;</p>
            {recommendationResult.source === "fallback" && (
              <p className="text-[10px] text-amber-500 mt-2 font-mono uppercase tracking-wider">
                Note: Standard fallbacks loaded. Enable Gemini Secrets Key for live AI modeling.
              </p>
            )}
          </div>

          {/* Core recommended results list */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {recommendationResult.movies.map((m) => {
              const bookmarked = watchlist.includes(m.id);
              return (
                <div
                  key={m.id}
                  onClick={() => onSelectMovie(m)}
                  className="group relative flex flex-col overflow-hidden bg-[#111111]/45 border border-white/5 rounded-xl hover:border-[#ff4e00]/40 transition-all cursor-pointer shadow-lg shadow-black/30"
                >
                  <div className="relative aspect-[3/4] bg-[#121212]">
                    {m.posterUrl === "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center border-2 border-dashed border-zinc-800 bg-[#0a0a0a]">
                         <div className="relative mb-3">
                           <div className="absolute inset-0 animate-ping opacity-20 bg-[#ff4e00] rounded-full blur-xl border-dashed"></div>
                           <Lock className="h-8 w-8 text-zinc-600 animate-pulse relative z-10" />
                         </div>
                         <span className="font-mono text-[9px] uppercase font-black tracking-widest text-[#ff4e00] opacity-80 border-b border-[#ff4e00]/30 pb-0.5 mb-2">Classified</span>
                      </div>
                    ) : (
                      <img
                        src={m.posterUrl}
                        alt={m.title}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover transition-transform group-hover:scale-103"
                        onError={(e) => {
                          e.currentTarget.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
                        }}
                      />
                    )}
                    <div className="absolute top-2 left-2 flex items-center gap-1 rounded bg-black/85 px-1.5 py-0.5 text-[9px] font-bold text-yellow-500">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                      {m.rating.toFixed(1)}
                    </div>
                  </div>

                  <div className="p-3 flex flex-col flex-1 z-10">
                    <h5 className="font-display font-semibold text-sm line-clamp-1 group-hover:text-[#ff4e00] text-zinc-100">
                      {m.title}
                    </h5>
                    <p className="text-[10px] font-mono text-zinc-500 mt-1 uppercase">{m.genres.join(" • ")}</p>
                    <p className="font-sans text-[11px] text-zinc-400 line-clamp-2 mt-2 leading-relaxed flex-1">
                      {m.overview}
                    </p>
                    <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-white/5 text-[10px] text-zinc-500 font-mono">
                      <span>{m.releaseDate.split("-")[0]} • {m.duration}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleWatchlist(m.id);
                        }}
                        className="text-zinc-500 hover:text-[#ff4e00] transition-colors cursor-pointer"
                      >
                        {bookmarked ? "Remove" : "Bookmark"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
