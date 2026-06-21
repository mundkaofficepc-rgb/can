import React, { useState, useEffect } from "react";
import { X, Star, Play, Award, HelpCircle, Film, Info, ChevronRight } from "lucide-react";
import { Movie, TriviaResponse } from "../types";
import { motion } from "motion/react";

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

async function fetchTMDBDetailsClient(id: number, type: string): Promise<Movie | null> {
  try {
    const apiType = type === "tv" ? "tv" : "movie";
    const url = `https://api.themoviedb.org/3/${apiType}/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,external_ids,videos,similar`;
    
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    
    const cast = data.credits?.cast?.slice(0, 5).map((c: any) => c.name) || ["Featured Stars"];
    const imdbId = data.external_ids?.imdb_id || null;
    
    let trailerUrl = "";
    if (data.videos?.results && Array.isArray(data.videos.results)) {
      const trailer = data.videos.results.find(
        (v: any) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser" || v.type === "Clip")
      );
      if (trailer) {
        trailerUrl = `https://www.youtube.com/embed/${trailer.key}`;
      }
    }
    if (!trailerUrl) {
      trailerUrl = `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent((data.title || data.name) + " official trailer")}`;
    }
    
    let duration = "2h 5m";
    if (apiType === "movie" && data.runtime) {
      const hrs = Math.floor(data.runtime / 60);
      const mins = data.runtime % 60;
      duration = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
    } else if (apiType === "tv") {
      const seasons = data.number_of_seasons || 1;
      duration = `${seasons} ${seasons === 1 ? "Season" : "Seasons"}`;
    }
    
    const genres = data.genres?.map((g: any) => g.name) || ["Drama"];
    
    const similar = (data.similar?.results || []).slice(0, 6).map((item: any) => {
      const isTv = apiType === "tv";
      const itemTitle = item.title || item.name || item.original_title || item.original_name;
      const releaseDate = item.release_date || item.first_air_date || "2024";
      
      const posterUrl = item.poster_path 
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
        : "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=500";
        
      const backdropUrl = item.backdrop_path 
        ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` 
        : "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200";
        
      const itemGenres = (item.genre_ids || [])
        .map((gid: number) => CLIENT_GENRE_MAP[gid])
        .filter((g: any) => !!g);

      return {
        id: item.id,
        title: itemTitle,
        type: isTv ? "tv" : "movie",
        overview: item.overview || "Similar recommendation Plot synopsis.",
        rating: item.vote_average || 7.0,
        releaseDate,
        posterUrl,
        backdropUrl,
        genres: itemGenres.length > 0 ? itemGenres : ["Drama"],
        trailerUrl: `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(itemTitle + " official trailer")}`,
        duration: isTv ? "Season 1" : "2h",
        cast: ["Featured Cast"]
      };
    });
    
    return {
      id: data.id,
      title: data.title || data.name || data.original_title || data.original_name,
      type: apiType,
      overview: data.overview || "",
      rating: data.vote_average || 7.0,
      releaseDate: data.release_date || data.first_air_date || "",
      posterUrl: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=500",
      backdropUrl: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200",
      genres,
      duration,
      cast,
      imdbId,
      trailerUrl,
      similar
    };
  } catch (err) {
    console.error("Client fetchTMDBDetailsClient failed:", err);
    return null;
  }
}

interface MovieDetailModalProps {
  movie: Movie;
  onClose: () => void;
  onToggleWatchlist: (mId: number) => void;
  isBookmarked: boolean;
}

export default function MovieDetailModal({
  movie,
  onClose,
  onToggleWatchlist,
  isBookmarked,
}: MovieDetailModalProps) {
  const [activeMovie, setActiveMovie] = useState<Movie>(movie);
  const [activeVideoTab, setActiveVideoTab] = useState<"trailer" | "stream">("stream");
  const [streamSource, setStreamSource] = useState<string>("vidsrc_to");
  
  // TV show specific options
  const [tvSeason, setTvSeason] = useState<number>(1);
  const [tvEpisode, setTvEpisode] = useState<number>(1);

  // Trivia states
  const [isLoadingTrivia, setIsLoadingTrivia] = useState<boolean>(false);
  const [triviaData, setTriviaData] = useState<TriviaResponse | null>(null);

  // Fetch detailed movie info from TMDB and AI Trivia
  useEffect(() => {
    setActiveMovie(movie); // reset to selected movie prop
    setTvSeason(1);
    setTvEpisode(1);
    setActiveVideoTab("stream");
    setStreamSource("vidsrc_to");

    // 1. Fetch dynamic details (real cast, runtime, imdbId, YouTube trailers and similar movies)
    fetch(`/api/details?id=${movie.id}&type=${movie.type}`)
      .then((res) => {
        if (!res.ok) throw new Error("API status failure");
        return res.json();
      })
      .then((data) => {
        if (data.success && data.details) {
          setActiveMovie(data.details);
          if (data.details.imdbId) {
            setStreamSource("playimdb");
          }
        }
      })
      .catch((err) => {
        console.warn("Could not fetch TMDB dynamic details via api backend, switching to client fetch direct:", err);
        fetchTMDBDetailsClient(movie.id, movie.type).then((details) => {
          if (details) {
            setActiveMovie(details);
            if (details.imdbId) {
              setStreamSource("playimdb");
            }
          }
        });
      });

    // 2. Fetch AI trivia
    setIsLoadingTrivia(true);
    fetch("/api/trivia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: movie.title }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTriviaData(data);
        }
      })
      .catch((err) => console.error("Could not fetch trivia", err))
      .finally(() => setIsLoadingTrivia(false));
  }, [movie]);

  // Handler for when a user clicks on a similar movie to select it inside the modal
  const handleSelectSimilar = (similarMovie: Movie) => {
    setActiveMovie(similarMovie);
    setTvSeason(1);
    setTvEpisode(1);
    setActiveVideoTab("stream");
    setStreamSource("vidsrc_to");

    // Fetch dynamic details for the new selection
    fetch(`/api/details?id=${similarMovie.id}&type=${similarMovie.type}`)
      .then((res) => {
        if (!res.ok) throw new Error("API status failure");
        return res.json();
      })
      .then((data) => {
        if (data.success && data.details) {
          setActiveMovie(data.details);
          if (data.details.imdbId) {
            setStreamSource("playimdb");
          }
        }
      })
      .catch((err) => {
        console.warn("Could not fetch TMDB details for similar via backend:", err);
        fetchTMDBDetailsClient(similarMovie.id, similarMovie.type).then((details) => {
          if (details) {
            setActiveMovie(details);
            if (details.imdbId) {
              setStreamSource("playimdb");
            }
          }
        });
      });

    // Fetch AI Trivia for the new selection
    setIsLoadingTrivia(true);
    fetch("/api/trivia", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: similarMovie.title }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTriviaData(data);
        }
      })
      .catch((err) => console.error("Could not fetch trivia", err))
      .finally(() => setIsLoadingTrivia(false));
  };

  // Formulate Stream Embed URLs based on standard players
  const getStreamUrl = () => {
    const id = activeMovie.id;
    const imdbId = activeMovie.imdbId;

    if (streamSource === "playimdb" && imdbId) {
      // On-the-fly playimdb stream URL substitution requested by the user
      const originalImdbUrl = `https://www.imdb.com/title/${imdbId}/`;
      const modifiedUrl = originalImdbUrl.replace("www.imdb.com", "www.playimdb.com");
      return modifiedUrl;
    }

    if (activeMovie.type === "tv") {
      switch (streamSource) {
        case "vidsrc_me":
          return `https://vidsrc.me/embed/tv?tmdb=${id}&season=${tvSeason}&episode=${tvEpisode}`;
        case "vidsrc_to":
          return `https://vidsrc.to/embed/tv/${id}/${tvSeason}/${tvEpisode}`;
        case "embed_su":
          return `https://embed.su/embed/tv/${id}/${tvSeason}/${tvEpisode}`;
        default:
          return `https://vidsrc.to/embed/tv/${id}/${tvSeason}/${tvEpisode}`;
      }
    } else {
      switch (streamSource) {
        case "vidsrc_me":
          return `https://vidsrc.me/embed/movie?tmdb=${id}`;
        case "vidsrc_to":
          return `https://vidsrc.to/embed/movie/${id}`;
        case "embed_su":
          return `https://embed.su/embed/movie/${id}`;
        default:
          return `https://vidsrc.to/embed/movie/${id}`;
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto px-4 py-6 md:p-10 backdrop-blur-md bg-black/85">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-5xl rounded-2xl bg-[#050505]/95 border border-white/5 shadow-2xl overflow-hidden shadow-black/90"
        id="movie-detail-modal"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-50 rounded-full bg-black/80 p-2 text-zinc-400 hover:text-white border border-white/10 hover:bg-white/5 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Backdrop Hero Header Section */}
        <div className="relative h-60 md:h-80 w-full overflow-hidden">
          <img
            src={activeMovie.backdropUrl}
            alt={activeMovie.title}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover opacity-25 filter blur-[1px]"
            onError={(e) => {
              e.currentTarget.src = "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200";
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/45 to-transparent" />
          
          {/* Header Movie Poster & Text Overlay */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row items-end gap-6 z-10">
            <img
              src={activeMovie.posterUrl}
              alt={activeMovie.title}
              referrerPolicy="no-referrer"
              className="hidden md:block h-44 w-32 rounded-lg border border-white/10 shadow-lg object-cover"
              onError={(e) => {
                e.currentTarget.src = "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=500";
              }}
            />
            <div className="flex-1">
              <span className="rounded bg-[#ff4e00] px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-white shadow">
                {activeMovie.type.toUpperCase()}
              </span>
              <h2 className="font-display text-2xl md:text-5xl font-extrabold tracking-tight text-white mt-2 leading-none">
                {activeMovie.title}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs md:text-sm text-zinc-300 font-mono">
                <span className="flex items-center gap-1 text-[#f59e0b] font-bold">
                  <Star className="h-4 w-4 fill-[#f59e0b] text-[#f59e0b]" />
                  {activeMovie.rating.toFixed(1)} / 10
                </span>
                <span>•</span>
                <span>{activeMovie.releaseDate}</span>
                <span>•</span>
                <span>{activeMovie.duration}</span>
                <span>•</span>
                <span className="line-clamp-1">{activeMovie.genres.join(", ")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Multi-Section Column (Video Player + metadata info + Gemini Trivia) */}
        <div className="p-6 md:p-8 space-y-8 max-h-[70vh] overflow-y-auto">
          
          {/* 1. PLAYER & VIDEO CONFIG TABS */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  id="tab-stream-player"
                  onClick={() => setActiveVideoTab("stream")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    activeVideoTab === "stream"
                      ? "bg-[#ff4e00] text-white shadow"
                      : "bg-white/5 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  CineStream Player
                </button>
                <button
                  type="button"
                  id="tab-trailer-player"
                  onClick={() => setActiveVideoTab("trailer")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    activeVideoTab === "trailer"
                      ? "bg-[#ff4e00] text-white shadow"
                      : "bg-white/5 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Film className="h-3.5 w-3.5" />
                  Official Trailer
                </button>
              </div>

              {/* Player source configuration selector */}
              {activeVideoTab === "stream" && (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-mono text-[10px] text-zinc-500 uppercase tracking-wider">Stream Switcher:</span>
                  <select
                    value={streamSource}
                    onChange={(e) => setStreamSource(e.target.value)}
                    className="bg-white/5 text-xs text-zinc-300 border border-white/10 rounded px-2.5 py-1 focus:outline-none focus:border-[#ff4e00]"
                  >
                    {activeMovie.imdbId && <option value="playimdb">PlayIMDB (On-The-Fly Server)</option>}
                    <option value="vidsrc_to">VidSrc.To (Fast)</option>
                    <option value="vidsrc_me">VidSrc.Me (Multiplex)</option>
                    <option value="embed_su">Embed.Su (Stable Premium)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Video Player Render Space */}
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-white/5">
              {activeVideoTab === "trailer" ? (
                activeMovie.trailerUrl ? (
                  <iframe
                    src={activeMovie.trailerUrl}
                    title={`${activeMovie.title} Trailer`}
                    className="absolute inset-0 h-full w-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-zinc-500 font-sans text-xs">
                    No preview trailer found. Use CineStream Player instead.
                  </div>
                )
              ) : (
                <iframe
                  src={getStreamUrl()}
                  title={`${activeMovie.title} Streaming`}
                  className="absolute inset-0 h-full w-full"
                  allowFullScreen
                  scrolling="no"
                  allow="autoplay; encrypted-media"
                />
              )}
            </div>

            {/* IMDb On-The-Fly link conversion display banner */}
            {activeMovie.imdbId && activeVideoTab === "stream" && (
              <div className="mt-2 text-xs bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-3 shadow-inner">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5 animate-pulse">
                    <span className="font-bold text-[#ff4e00] uppercase tracking-wider text-[10px] block font-mono">
                      Background Live IMDb Resolver
                    </span>
                    <span className="font-mono text-zinc-400 block text-[11px]">
                      raw link:{" "}
                      <a
                        href={`https://www.imdb.com/title/${activeMovie.imdbId}/`}
                        target="_blank"
                        rel="noreferrer"
                        className="underline hover:text-[#ff4e00] text-zinc-300"
                      >
                        https://www.imdb.com/title/{activeMovie.imdbId}/
                      </a>
                    </span>
                  </div>
                  <div className="border-t border-dashed border-zinc-800 pt-2 sm:pt-0 sm:border-t-0 sm:text-right space-y-0.5">
                    <span className="font-bold text-emerald-500 uppercase tracking-wider text-[10px] block font-mono">
                      webapp streaming redirection
                    </span>
                    <span className="font-mono text-[11px] block text-zinc-200">
                      playimdb stream:{" "}
                      <span className="text-[#ff4e00] font-semibold select-all">
                        https://www.playimdb.com/title/{activeMovie.imdbId}/
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Interactive TV Series controls (Season/Episode selection) if TV type */}
            {activeMovie.type === "tv" && activeVideoTab === "stream" && (
              <div className="flex flex-wrap items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 mt-2">
                <div className="flex items-center gap-1.5 text-zinc-200">
                  <Film className="h-4 w-4 text-[#ff4e00]" />
                  <span className="text-xs font-bold font-mono">SERIES SELECTOR</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-zinc-550 font-mono uppercase">Season:</label>
                  <input
                    type="number"
                    min="1"
                    max="30"
                    value={tvSeason}
                    onChange={(e) => setTvSeason(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-14 rounded bg-[#111] border border-white/5 py-1 text-center text-xs text-white focus:border-[#ff4e00] focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-zinc-550 font-mono uppercase">Episode:</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={tvEpisode}
                    onChange={(e) => setTvEpisode(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-14 rounded bg-[#111] border border-white/5 py-1 text-center text-xs text-white focus:border-[#ff4e00] focus:outline-none"
                  />
                </div>
                <div className="ml-auto text-[10px] text-zinc-400 font-mono italic">
                  Currently playing: Season {tvSeason}, Episode {tvEpisode}
                </div>
              </div>
            )}
          </div>

          {/* 2. CAST, SUMMARY, AND GENERAL INFO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div>
                <h3 className="text-zinc-400 font-display text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Info className="h-3.5 w-3.5 text-[#ff4e00]" />
                  Plot Overview
                </h3>
                <p className="mt-2 text-zinc-300 font-sans text-sm leading-relaxed">
                  {activeMovie.overview}
                </p>
              </div>

              <div>
                <h3 className="text-zinc-400 font-display text-xs font-bold uppercase tracking-widest">
                  Featured Stars
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {activeMovie.cast.map((actor) => (
                    <span
                      key={actor}
                      className="rounded-full bg-white/5 border border-white/5 px-3.5 py-1.5 text-xs text-zinc-300 hover:text-white transition-colors"
                    >
                      {actor}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Action Block */}
            <div className="bg-[#111111]/35 p-5 rounded-xl border border-white/5 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <h4 className="font-display font-semibold text-xs uppercase tracking-wider text-zinc-400">Watchlist Status</h4>
                <p className="text-[11px] text-zinc-500 leading-relaxed">Add this masterpiece to your list for secure custom bookmarks and tracking.</p>
              </div>
              <button
                type="button"
                onClick={() => onToggleWatchlist(activeMovie.id)}
                className={`w-full py-2.5 text-xs font-bold uppercase tracking-widest rounded-lg transition-all cursor-pointer ${
                  isBookmarked
                    ? "bg-white/5 text-[#ff4e00] border border-[#ff4e00]/20 hover:bg-white/10"
                    : "bg-[#ff4e00] text-white shadow hover:bg-[#ff4e00]/95 shadow-[#ff4e00]/10"
                }`}
              >
                {isBookmarked ? "Remove From List" : "Add to List"}
              </button>
            </div>
          </div>

          {/* 3. GEMINI AI INTEL REPORT (TRIVIA & DEEP ANALYSIS) */}
          <div className="rounded-xl border border-white/5 bg-gradient-to-b from-black to-[#0c0c0c] p-6 space-y-6 shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-[#ff4e00]" />
                <h3 className="font-display text-sm font-bold text-white uppercase tracking-wider">
                  AI Critical Intel Report
                </h3>
              </div>
              <span className="font-mono text-[9px] bg-[#ff4e00]/10 text-[#ff4e00] border border-[#ff4e00]/20 rounded px-2.5 py-1 font-bold">
                GEMINI 3.5 ACTIVE
              </span>
            </div>

            {isLoadingTrivia ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/5 border-t-[#ff4e00]" />
                <p className="font-mono text-xs text-zinc-500">Securing dynamic critical insights...</p>
              </div>
            ) : triviaData ? (
              <div className="space-y-6">
                {/* AI Review Quote */}
                <div className="relative pl-4 border-l-2 border-[#ff4e00]/80">
                  <h4 className="font-display font-semibold text-xs text-zinc-400 tracking-widest">
                    Critical Cinematic Review
                  </h4>
                  <p className="mt-2 text-zinc-300 font-sans text-sm italic leading-relaxed">
                    &ldquo;{triviaData.review}&rdquo;
                  </p>
                  <p className="mt-2 text-zinc-500 font-mono text-[10px] uppercase">
                    Critics Analysis: {triviaData.ratingExplanation}
                  </p>
                </div>

                {/* Trivia List */}
                <div className="space-y-2">
                  <h4 className="font-display font-semibold text-xs text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <HelpCircle className="h-3.5 w-3.5 text-[#ff4e00]" />
                    Deep-Dive Trivia & Secrets
                  </h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    {triviaData.trivia.map((t, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2 bg-[#111111]/45 p-3 rounded-lg border border-white/5 font-sans text-xs text-zinc-300 leading-relaxed"
                      >
                        <ChevronRight className="h-4 w-4 text-[#ff4e00] shrink-0 mt-0.5" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center font-sans text-xs text-zinc-500 py-2">
                Could not connect to AI Intel databases. Enable dynamic critical modeling or verify your Google connection.
              </div>
            )}
          </div>

          {/* 4. SIMILAR RECOMMENDATIONS (TMDB Live similar movies) */}
          {activeMovie.similar && activeMovie.similar.length > 0 && (
            <div className="space-y-4 pt-6 border-t border-white/5">
              <h3 className="text-zinc-400 font-display text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                <Film className="h-3.5 w-3.5 text-[#ff4e00]" />
                Similar Recommendations
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {activeMovie.similar.map((simMovie) => (
                  <div
                    key={simMovie.id}
                    onClick={() => handleSelectSimilar(simMovie)}
                    className="group cursor-pointer space-y-2 relative"
                  >
                    <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden border border-white/5 group-hover:border-[#ff4e00]/50 transition-colors bg-[#0a0a0a]">
                      <img
                        src={simMovie.posterUrl}
                        alt={simMovie.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=500";
                        }}
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <Play className="h-6 w-6 text-white fill-current animate-pulse" />
                      </div>
                    </div>
                    <h4 className="font-sans text-[11px] font-semibold text-zinc-300 group-hover:text-[#ff4e00] transition-colors line-clamp-1">
                      {simMovie.title}
                    </h4>
                    <p className="font-mono text-[9px] text-zinc-500">
                      ⭐ {simMovie.rating ? simMovie.rating.toFixed(1) : "7.0"}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </motion.div>
    </div>
  );
}
