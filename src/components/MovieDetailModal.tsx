import React, { useState, useEffect } from "react";
import { 
  X, Star, Play, Award, HelpCircle, Film, Info, ChevronRight, Share2,
  ChevronLeft, DollarSign, Globe, Calendar, TrendingUp, User, 
  Tv, Image, Video, Layers, Languages, Sparkles, Clock, Heart,
  Building, CheckCircle, Tag, EyeOff, AlertTriangle, Bell, Lock, Minimize2
} from "lucide-react";
import { Movie, TriviaResponse, Person, TVEpisode } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { isPlayable } from "@/lib/utils";
import VideoPlayer from "./ui/video-player";
import MovieCardSkeleton from "./MovieCardSkeleton";

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
    const url = `https://api.themoviedb.org/3/${apiType}/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,external_ids,videos,similar,keywords,images&include_image_language=en,null`;
    
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    
    // Parse TMDB detail format
    const cast = data.credits?.cast?.slice(0, 10).map((c: any) => c.name) || ["Featured Stars"];
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
    
    // Parse Keywords
    const keywordArray = apiType === "movie" ? (data.keywords?.keywords || []) : (data.keywords?.results || []);
    const keywords = keywordArray.map((kw: any) => kw.name);

    // Parse Crew
    const crewList = data.credits?.crew || [];
    const directors = crewList
      .filter((c: any) => c.job === "Director" || c.job === "Co-Director")
      .map((c: any) => ({
        id: c.id,
        name: c.name,
        profilePath: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
      }));

    const writers = crewList
      .filter((c: any) => ["Writer", "Screenplay", "Story", "Novel", "Author"].includes(c.job))
      .map((c: any) => ({
        id: c.id,
        name: c.name,
        profilePath: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
      }));

    const producers = crewList
      .filter((c: any) => ["Producer", "Executive Producer"].includes(c.job))
      .map((c: any) => ({
        id: c.id,
        name: c.name,
        profilePath: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
      }));

    const creativeJobs = ["Director of Photography", "Editor", "Original Music Composer", "Music", "Production Designer", "Costume Designer", "Visual Effects Supervisor", "Stunt Coordinator"];
    const creativeTeam = crewList
      .filter((c: any) => creativeJobs.includes(c.job))
      .map((c: any) => ({
        id: c.id,
        name: c.name,
        job: c.job,
        profilePath: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
      }));

    const directionJobs = ["Director", "Co-Director", "First Assistant Director", "Second Assistant Director", "Second Unit Director"];
    const directionTeam = crewList
      .filter((c: any) => directionJobs.includes(c.job))
      .map((c: any) => ({
        id: c.id,
        name: c.name,
        job: c.job,
        profilePath: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
      }));

    const fullCast = Array.from(new Map<number, { id: number; name: string; character: string; profilePath: string }>(
      (data.credits?.cast || []).slice(0, 30).map((c: any) => [c.id, {
        id: c.id,
        name: c.name,
        character: c.character || "Acting Personnel",
        profilePath: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
      }])
    ).values());

    const videos = (data.videos?.results || []).map((v: any) => ({
      key: v.key,
      name: v.name,
      type: v.type,
      site: v.site
    }));

    const backdrops = (data.images?.backdrops || []).slice(0, 15).map((img: any) => `https://image.tmdb.org/t/p/original${img.file_path}`);
    const posters = (data.images?.posters || []).slice(0, 15).map((img: any) => `https://image.tmdb.org/t/p/w500${img.file_path}`);
    const logos = (data.images?.logos || []).slice(0, 8).map((img: any) => `https://image.tmdb.org/t/p/w500${img.file_path}`);

    const spokenLanguages = (data.spoken_languages || []).map((sl: any) => sl.english_name || sl.name);
    const originCountry = data.origin_country || data.production_countries?.map((c: any) => c.iso_3166_1) || [];

    const belongsToCollection = data.belongs_to_collection ? {
      name: data.belongs_to_collection.name,
      posterUrl: data.belongs_to_collection.poster_path ? `https://image.tmdb.org/t/p/w500${data.belongs_to_collection.poster_path}` : "",
      backdropUrl: data.belongs_to_collection.backdrop_path ? `https://image.tmdb.org/t/p/original${data.belongs_to_collection.backdrop_path}` : ""
    } : null;

    const seasons = (data.seasons || []).map((s: any) => ({
      id: s.id,
      name: s.name,
      seasonNumber: s.season_number,
      episodeCount: s.episode_count,
      airDate: s.air_date || "N/A",
      posterPath: s.poster_path ? `https://image.tmdb.org/t/p/w342${s.poster_path}` : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
      overview: s.overview || "No season summary available."
    }));

    const productionCompanies = (data.production_companies || []).map((pc: any) => ({
      name: pc.name,
      logoUrl: pc.logo_path ? `https://image.tmdb.org/t/p/w185${pc.logo_path}` : "",
      originCountry: pc.origin_country
    }));

    const similarRaw = (data.similar?.results || []).slice(0, 15);
    const similarMap = new Map();
    similarRaw.forEach((item: any) => {
      if (!similarMap.has(item.id)) {
        const isTv = apiType === "tv";
        const itemTitle = item.title || item.name || item.original_title || item.original_name;
        const releaseDate = item.release_date || item.first_air_date || "2024";
        
        const pUrl = item.poster_path 
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
          : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
          
        const bdUrl = item.backdrop_path 
          ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` 
          : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
          
        const itemGenres = (item.genre_ids || [])
          .map((gid: number) => CLIENT_GENRE_MAP[gid])
          .filter((g: any) => !!g);

        similarMap.set(item.id, {
          id: item.id,
          title: itemTitle,
          type: isTv ? "tv" : "movie",
          overview: item.overview || "Similar recommendation Plot synopsis.",
          rating: item.vote_average || 7.0,
          releaseDate,
          posterUrl: pUrl,
          backdropUrl: bdUrl,
          genres: itemGenres.length > 0 ? itemGenres : ["Drama"],
          trailerUrl: `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(itemTitle + " official trailer")}`,
          duration: isTv ? "Season 1" : "2h",
          cast: ["Featured Cast"]
        });
      }
    });
    const similar = Array.from(similarMap.values()).slice(0, 12);
    
    return {
      id: data.id,
      title: data.title || data.name || data.original_title || data.original_name,
      type: apiType,
      overview: data.overview || "",
      rating: data.vote_average || 7.0,
      releaseDate: data.release_date || data.first_air_date || "",
      posterUrl: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
      backdropUrl: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
      genres,
      duration,
      cast,
      imdbId,
      trailerUrl,
      similar,
      
      // Extended fields
      originalTitle: data.original_title || data.original_name || "",
      tagline: data.tagline || "",
      voteCount: data.vote_count || 0,
      popularity: data.popularity || 0,
      keywords,
      adult: data.adult || false,
      spokenLanguages,
      originalLanguage: data.original_language || "en",
      originCountry,
      belongsToCollection,
      budget: data.budget || 0,
      revenue: data.revenue || 0,
      status: data.status || "Released",
      backdrops,
      posters,
      logos,
      directors,
      writers,
      producers,
      creativeTeam,
      directionTeam,
      fullCast,
      videos,
      seasons,
      productionCompanies
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
  onToggleNotification?: (mId: number) => void;
  isNotified?: boolean;
  onMinimize?: (movie: Movie) => void;
}

export default function MovieDetailModal({
  movie,
  onClose,
  onToggleWatchlist,
  isBookmarked,
  onToggleNotification,
  isNotified,
  onMinimize,
}: MovieDetailModalProps) {
  const [activeMovie, setActiveMovie] = useState<Movie>(movie);
  const [activeVideoTab, setActiveVideoTab] = useState<"trailer" | "stream">("stream");
  const [streamSource, setStreamSource] = useState<string>("vidsrc_to");
  const [rating, setRating] = useState(
    parseInt(localStorage.getItem(`rating-${movie.id}`) || "0")
  );

  // Playback timer & simulated progress state for trailer/movie
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(34); // start slightly in for movie vibe
  const [volume, setVolume] = useState<number>(80);

  const durationSec = activeVideoTab === "trailer" ? 172 : 7200; // 2m 52s trailer, 2h movie stream

  useEffect(() => {
    // Reset timer when media changes
    setCurrentTime(activeVideoTab === "trailer" ? 12 : 115);
  }, [activeVideoTab, activeMovie]);

  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= durationSec) {
            return 0; // restart
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, durationSec]);

  const formatPlaybackTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const pad = (num: number) => String(num).padStart(2, "0");
    if (hrs > 0) {
      return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
    }
    return `${pad(mins)}:${pad(secs)}`;
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newPercentage = Math.max(0, Math.min(1, clickX / width));
    setCurrentTime(Math.round(newPercentage * durationSec));
  };
  
  // Custom Detail Tab Menu
  const [currentDetailTab, setCurrentDetailTab] = useState<"overview" | "media" | "cast" | "seasons" | "production" | "similar">("overview");

  // TV show specific options
  const [tvSeason, setTvSeason] = useState<number>(1);
  const [tvEpisode, setTvEpisode] = useState<number>(1);
  const [seasonEpisodes, setSeasonEpisodes] = useState<TVEpisode[]>([]);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState<boolean>(false);

  // Trivia states
  const [isLoadingTrivia, setIsLoadingTrivia] = useState<boolean>(false);
  const [triviaData, setTriviaData] = useState<TriviaResponse | null>(null);

  // Selected Person Profile (Actors/Crew drawer mode)
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);
  const [personData, setPersonData] = useState<Person | null>(null);
  const [isLoadingPerson, setIsLoadingPerson] = useState<boolean>(false);

  // Fetch detailed movie info from TMDB and AI Trivia
  useEffect(() => {
    setActiveMovie(movie); // reset
    setTvSeason(1);
    setTvEpisode(1);
    setActiveVideoTab("stream");
    setStreamSource("vidsrc_to");
    setCurrentDetailTab("overview");
    setSeasonEpisodes([]);

    // 1. Fetch dynamic details from backend proxy
    fetch(`/api/details?id=${movie.id}&type=${movie.type}`)
      .then((res) => {
        if (!res.ok) throw new Error("API status failure");
        return res.json();
      })
      .then((data) => {
        if (data.success && data.details) {
          if (data.details.similar) {
            data.details.similar = Array.from(new Map(data.details.similar.map((m: any) => [m.id, m])).values());
          }
          setActiveMovie(data.details);
          if (data.details.imdbId) {
            setStreamSource("playimdb");
          }
        }
      })
      .catch((err) => {
        console.warn("Could not fetch TMDB details via backend, switching to client direct:", err);
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
      .catch((err) => console.log("Note: Trivia backend quota fallback active."))
      .finally(() => setIsLoadingTrivia(false));
  }, [movie]);

  // Load TV Season Episodes automatically when season changes
  useEffect(() => {
    if (activeMovie.type === "tv" && tvSeason) {
      setIsLoadingEpisodes(true);
      fetch(`/api/tv-season?id=${activeMovie.id}&season=${tvSeason}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.episodes) {
            setSeasonEpisodes(data.episodes);
          }
        })
        .catch((err) => console.error("Could not fetch season episodes:", err))
        .finally(() => setIsLoadingEpisodes(false));
    }
  }, [activeMovie.id, activeMovie.type, tvSeason]);

  // Load Person/Actor Profile details
  useEffect(() => {
    if (selectedPersonId) {
      setIsLoadingPerson(true);
      fetch(`/api/person?id=${selectedPersonId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.person) {
            setPersonData(data.person);
          }
        })
        .catch((err) => console.error("Could not fetch actor details:", err))
        .finally(() => setIsLoadingPerson(false));
    } else {
      setPersonData(null);
    }
  }, [selectedPersonId]);

  // Handler for when a user clicks on a similar/recommended movie
  const handleSelectSimilar = (similarMovie: Movie) => {
    setActiveMovie(similarMovie);
    setTvSeason(1);
    setTvEpisode(1);
    setActiveVideoTab("stream");
    setStreamSource("vidsrc_to");
    setCurrentDetailTab("overview");
    setSeasonEpisodes([]);
    setSelectedPersonId(null);

    fetch(`/api/details?id=${similarMovie.id}&type=${similarMovie.type}`)
      .then((res) => {
        if (!res.ok) throw new Error("API status failure");
        return res.json();
      })
      .then((data) => {
        if (data.success && data.details) {
          if (data.details.similar) {
            data.details.similar = Array.from(new Map(data.details.similar.map((m: any) => [m.id, m])).values());
          }
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
      .catch((err) => console.log("Trivia quota fallback active."))
      .finally(() => setIsLoadingTrivia(false));
  };

  // Formulate Stream Embed URLs based on standard players
  const getStreamUrl = () => {
    const id = activeMovie.id;
    const imdbId = activeMovie.imdbId;

    if (streamSource === "playimdb" && imdbId) {
      const originalImdbUrl = `https://www.imdb.com/title/${imdbId}/`;
      return originalImdbUrl.replace("www.imdb.com", "www.playimdb.com");
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

  const formatCurrency = (val?: number) => {
    if (!val || val === 0) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Categorize Videos
  const movieVideos = activeMovie.videos || [];
  const trailersOnly = movieVideos.filter(v => v.type === "Trailer" && v.site === "YouTube");
  const teasersOnly = movieVideos.filter(v => v.type === "Teaser" && v.site === "YouTube");
  const behindScenesOnly = movieVideos.filter(v => ["Behind the Scenes", "Featurette"].includes(v.type) && v.site === "YouTube");
  const clipsOnly = movieVideos.filter(v => v.type === "Clip" && v.site === "YouTube");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto backdrop-blur-md bg-black md:p-8" id="modal-backdrop">
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
        className="relative w-full h-full md:h-auto md:max-h-[92vh] max-w-6xl md:rounded-2xl bg-[#030303] md:border md:border-white/10 shadow-2xl overflow-hidden shadow-black/100 flex flex-col"
        id="movie-detail-modal"
      >
        {/* Header Navigation Controls */}
        <div className="absolute inset-x-0 top-0 z-50 flex items-center justify-between p-4 pointer-events-none">
          <button
            onClick={onClose}
            className="rounded-full bg-black/80 p-2.5 text-zinc-400 hover:text-white border border-white/10 hover:bg-white/5 transition-all cursor-pointer shadow-md pointer-events-auto md:hidden"
            title="Go Back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-2 ml-auto pointer-events-auto">
            {onMinimize && (
              <button
                onClick={() => onMinimize(activeMovie)}
                className="rounded-full bg-black/80 p-2.5 text-zinc-400 hover:text-white border border-white/10 hover:bg-white/5 transition-all cursor-pointer shadow-md"
                title="Minimize to Picture-in-Picture"
              >
                <Minimize2 className="h-5 w-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className={`rounded-full bg-black/80 p-2.5 text-zinc-400 hover:text-white border border-white/10 hover:bg-white/5 transition-all cursor-pointer shadow-md ${onMinimize ? '' : 'ml-auto'}`}
              title="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Frame Area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">

          {/* 🎬 MOVIE BACKDROP & CORE HEADER OVERLAY */}
          <div className="relative h-56 xxs:h-64 md:h-[340px] w-full overflow-hidden shrink-0">
            {activeMovie.backdropUrl === "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" ? (
              <div className="absolute inset-0 flex items-center justify-center bg-[#050505]">
                <div className="absolute inset-0 opacity-10 bg-gradient-to-tr from-[#ff4e00] to-transparent"></div>
                <div className="flex flex-col items-center opacity-40">
                  <Lock className="h-20 w-20 text-[#ff4e00] animate-pulse" />
                  <span className="font-mono mt-4 font-black tracking-[0.3em] uppercase text-[#ff4e00]">Classified Source</span>
                </div>
              </div>
            ) : (
              <img
                src={activeMovie.backdropUrl}
                alt={activeMovie.title}
                referrerPolicy="no-referrer"
                className="h-full w-full object-cover opacity-30 filter brightness-90 saturate-120 transform scale-102"
                onError={(e) => {
                  e.currentTarget.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
                }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#030303] via-[#030303]/40 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#030303]/90 via-transparent to-transparent hidden md:block" />
            
          <div className="absolute inset-x-0 bottom-0 p-4 sm:p-8 flex items-end gap-4 sm:gap-6 z-10">
            <div className="relative group shrink-0 hidden sm:block">
                {activeMovie.posterUrl === "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" ? (
                  <div className="flex flex-col items-center justify-center h-48 w-34 rounded-xl border-2 border-dashed border-zinc-800 bg-[#0a0a0a] shadow-2xl p-2 text-center">
                    <div className="relative mb-2">
                       <div className="absolute inset-0 animate-ping opacity-20 bg-[#ff4e00] rounded-full blur-md border-dashed"></div>
                       <Lock className="h-6 w-6 text-zinc-600 animate-pulse relative z-10" />
                    </div>
                    <span className="font-mono text-[8px] uppercase font-black tracking-widest text-[#ff4e00] opacity-80 border-b border-[#ff4e00]/30 pb-0.5 mb-1">Classified</span>
                    <span className="text-[10px] font-bold text-zinc-500 leading-tight">Under<br/>Construction</span>
                  </div>
                ) : (
                  <img
                    src={activeMovie.posterUrl}
                    alt={activeMovie.title}
                    referrerPolicy="no-referrer"
                    className="h-48 w-34 rounded-xl border-2 border-white/10 shadow-2xl object-cover hover:border-[#ff4e00]/55 transition-all duration-300"
                    onError={(e) => {
                      e.currentTarget.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
                    }}
                  />
                )}
                {activeMovie.adult && (
                  <span className="absolute top-2 right-2 bg-red-600 text-[10px] font-mono font-bold text-white px-1.5 py-0.5 rounded border border-red-500 shadow-md">
                    18+
                  </span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-[#ff4e00] text-white text-[9px] font-mono font-black uppercase tracking-widest px-2.5 py-1 rounded shadow-lg shadow-[#ff4e00]/20">
                    {activeMovie.type === "tv" ? "TV SERIES" : "FEATURE FILM"}
                  </span>
                  {activeMovie.status && (
                    <span className="bg-white/10 text-zinc-300 text-[9px] font-mono font-semibold uppercase tracking-wider px-2 py-1 rounded border border-white/5">
                      Status: {activeMovie.status}
                    </span>
                  )}
                  {activeMovie.originalLanguage && (
                    <span className="bg-zinc-800/80 text-zinc-400 text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-zinc-700">
                      LANG: {activeMovie.originalLanguage.toUpperCase()}
                    </span>
                  )}
                </div>

                <h2 className="font-display text-xl xs:text-2xl md:text-5xl font-black tracking-tight text-white mt-3 leading-none drop-shadow-md">
                  {activeMovie.title}
                </h2>
                
                {activeMovie.originalTitle && activeMovie.originalTitle !== activeMovie.title && (
                  <p className="text-zinc-400/90 font-mono text-[9px] xs:text-[11px] mt-1 italic tracking-wide">
                    Original Name: {activeMovie.originalTitle}
                  </p>
                )}

                {activeMovie.tagline && (
                  <p className="text-[#ff4e00] font-sans italic text-[10px] sm:text-xs md:text-sm mt-2 font-medium drop-shadow leading-snug">
                    &ldquo;{activeMovie.tagline}&rdquo;
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-3 text-[9px] xs:text-[11px] md:text-xs text-zinc-300 font-mono">
                  <span className="flex items-center gap-1 text-[#f59e0b] font-extrabold tracking-tight">
                    <Star className="h-3 w-3 xs:h-4 xs:w-4 fill-[#f59e0b] text-[#f59e0b]" />
                    {activeMovie.rating ? activeMovie.rating.toFixed(1) : "7.0"} <span className="text-zinc-500 font-normal">/ 10</span>
                  </span>
                  {activeMovie.voteCount && activeMovie.voteCount > 0 && (
                    <span className="text-zinc-500 text-[8px] xs:text-[10px]">({activeMovie.voteCount.toLocaleString()} votes)</span>
                  )}
                  <span>•</span>
                  <span className="flex items-center gap-0.5"><Calendar className="h-3 w-3 xs:h-3.5 xs:w-3.5 text-zinc-400 shrink-0" /> {activeMovie.releaseDate || "N/A"}</span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5"><Clock className="h-3 w-3 xs:h-3.5 xs:w-3.5 text-zinc-400 shrink-0" /> {activeMovie.duration}</span>
                  {activeMovie.popularity && activeMovie.popularity > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-teal-400 font-bold flex items-center gap-0.5"><TrendingUp className="h-3.5 w-3.5" /> Popularity: {activeMovie.popularity.toFixed(0)}</span>
                    </>
                  )}
                </div>

                {activeMovie.genres && activeMovie.genres.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {Array.from(new Set(activeMovie.genres)).map(g => (
                      <span key={g} className="text-[10px] font-mono tracking-wider font-semibold border border-white/10 hover:border-[#ff4e00]/40 text-zinc-300 hover:text-white px-2.5 py-0.5 bg-black/35 rounded transition-all">
                        {g}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ▶️ SYSTEM MEDIA STREAMER MODULE */}
          <div className="p-3 sm:p-6 space-y-4 bg-zinc-950/20 border-b border-white/5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-3">
              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  id="tab-stream-player"
                  onClick={() => setActiveVideoTab("stream")}
                  className={`flex flex-1 sm:flex-initial items-center justify-center gap-1.5 px-3 sm:px-4.5 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg ${
                    activeVideoTab === "stream"
                      ? "bg-[#ff4e00] text-white shadow-[#ff4e00]/25"
                      : "bg-white/5 text-zinc-450 hover:text-zinc-200 border border-white/5 hover:bg-white/10"
                  }`}
                >
                  {!isPlayable(activeMovie.releaseDate) ? <Clock className="h-4 w-4 text-white" /> : <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current text-white" />}
                  {!isPlayable(activeMovie.releaseDate) ? "Soon" : "Stream"}
                </button>
                <button
                  type="button"
                  id="tab-trailer-player"
                  onClick={() => setActiveVideoTab("trailer")}
                  className={`flex flex-1 sm:flex-initial items-center justify-center gap-1.5 px-3 sm:px-4.5 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-lg ${
                    activeVideoTab === "trailer"
                      ? "bg-[#ff4e00] text-white shadow-[#ff4e00]/25"
                      : "bg-white/5 text-zinc-450 hover:text-zinc-200 border border-white/5 hover:bg-white/10"
                  }`}
                >
                  <Film className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-white" />
                  Trailer
                </button>
              </div>

              {/* Streaming Embed Frame Source selectors */}
              {activeVideoTab === "stream" && isPlayable(activeMovie.releaseDate) && (
                <div className="flex items-center gap-1.5 sm:gap-2.5 bg-[#030303] border border-white/10 rounded-xl px-2 sm:px-3 py-1.5 shadow-md overflow-hidden">
                  <span className="font-mono text-[8px] sm:text-[9px] text-[#ff4e00] uppercase tracking-widest font-black shrink-0">
                    <span className="hidden xs:inline">Streaming </span>Engine:
                  </span>
                  <select
                    value={streamSource}
                    onChange={(e) => setStreamSource(e.target.value)}
                    className="bg-transparent text-[10px] sm:text-xs text-zinc-100 border-none font-bold font-mono focus:outline-none focus:ring-0 cursor-pointer text-ellipsis flex-1 min-w-0"
                  >
                    {activeMovie.imdbId && <option value="playimdb">PlayIMDB (On-The-Fly)</option>}
                    <option value="vidsrc_to">VidSrc.To (Fast)</option>
                    <option value="vidsrc_me">VidSrc.Me (Multiplex)</option>
                    <option value="embed_su">Embed.Su (Stable HD)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Cinematic Frame Arena */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-white/10 shadow-2xl">
              {activeVideoTab === "trailer" ? (
                activeMovie.trailerUrl ? (
                  activeMovie.trailerUrl.includes(".mp4") || activeMovie.trailerUrl.includes(".webm") ? (
                    <VideoPlayer src={activeMovie.trailerUrl} />
                  ) : (
                    <iframe
                      src={`${activeMovie.trailerUrl}${activeMovie.trailerUrl.includes('?') ? '&' : '?'}controls=1&modestbranding=1&rel=0`}
                      title={`${activeMovie.title} Promo Trailer`}
                      className="absolute inset-0 h-full w-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                  )
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center text-zinc-500 font-sans text-xs gap-2">
                    <Video className="h-8 w-8 text-zinc-650 animate-bounce" />
                    <span>No promo trailer found. Defaulting to CineStream Player index.</span>
                  </div>
                )
              ) : !isPlayable(activeMovie.releaseDate) ? (() => {
                  const daysLeft = Math.ceil((new Date(activeMovie.releaseDate as string).getTime() - new Date("2026-06-21").getTime()) / (1000 * 3600 * 24));
                  return (
                    <div className="flex h-full w-full flex-col items-center justify-center bg-[#050505] text-zinc-300 font-sans p-6 text-center gap-4 border border-dashed border-[#ff4e00]/20 rounded-2xl relative overflow-hidden">
                      <div className="absolute inset-0 bg-cover bg-center opacity-10 blur-xl" style={{ backgroundImage: `url(${activeMovie.backdropUrl || activeMovie.posterUrl})` }}></div>
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#ff4e00]/40 to-transparent"></div>
                      <div className="relative z-10 flex flex-col items-center gap-4">
                        <Calendar className="h-14 w-14 text-[#ff4e00] opacity-80" />
                        <div>
                          <h3 className="font-display text-3xl font-black text-white tracking-tight drop-shadow-lg">Coming Soon</h3>
                          <p className="text-zinc-400 mt-2 text-sm max-w-md mx-auto">This title hasn't been released yet. It will become playable on our engines after its theatrical or streaming premiere.</p>
                        </div>
                        <div className="flex items-center gap-3 mt-2 flex-wrap justify-center">
                          <div className="bg-[#ff4e00]/10 border border-[#ff4e00]/30 px-5 py-2.5 rounded-xl flex items-center gap-2">
                            <span className="text-[10px] uppercase font-mono font-black text-[#ff4e00] tracking-widest">Expected Release:</span>
                            <span className="font-mono text-zinc-200 font-semibold">{new Date(activeMovie.releaseDate as string).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          </div>
                          {daysLeft > 0 && (
                            <div className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-inner shadow-black">
                              <span className="text-[10px] uppercase font-mono font-black text-zinc-500 tracking-widest">Countdown:</span>
                              <span className="font-mono text-white font-bold">{daysLeft} Days Left</span>
                            </div>
                          )}
                        </div>
                        {onToggleNotification && (
                          <button
                            type="button"
                            onClick={() => onToggleNotification(activeMovie.id)}
                            className={`mt-4 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                              isNotified
                                ? "bg-white text-black shadow-white/20"
                                : "bg-[#ff4e00]/20 text-[#ff4e00] border border-[#ff4e00]/50 hover:bg-[#ff4e00]/30 shadow-[#ff4e00]/10"
                            }`}
                          >
                            <Bell className={`h-4 w-4 ${isNotified ? "fill-black" : ""}`} /> 
                            {isNotified ? "Details Saved. We'll Notify You." : "Notify Me Upon Release"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })() : (
                <iframe
                  src={getStreamUrl()}
                  title={`${activeMovie.title} Multi Stream Server`}
                  className="absolute inset-0 h-full w-full"
                  allowFullScreen
                  scrolling="no"
                  allow="autoplay; encrypted-media"
                />
              )}
            </div>

            {/* Live Timeline Playback Progress Tracker */}
            <div className="bg-[#0b0b0b] border border-white/5 rounded-xl p-3.5 flex flex-col sm:flex-row items-center gap-4 shadow-lg">
              <div className="flex items-center gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 hover:text-white transition-all text-zinc-300 cursor-pointer border border-white/5"
                  title={isPlaying ? "Pause simulated playback tracker" : "Play simulated playback tracker"}
                >
                  {isPlaying ? (
                    <span className="flex items-center gap-1.5 text-[10px] font-mono font-black uppercase text-amber-500">
                      <span className="h-2 w-2 bg-amber-500 rounded-full animate-pulse" />
                      TRACKING LIVE
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-[10px] font-mono font-black uppercase text-zinc-400">
                      <span className="h-2 w-2 bg-zinc-650 rounded-full" />
                      TRACKER PAUSED
                    </span>
                  )}
                </button>

                <div className="text-xs font-mono font-medium text-zinc-350 bg-black/40 border border-white/5 px-2 py-1 rounded">
                  {formatPlaybackTime(currentTime)} <span className="text-zinc-600">/</span> {formatPlaybackTime(durationSec)}
                </div>
              </div>

              {/* Progress Slider Track */}
              <div 
                className="flex-1 w-full sm:w-auto h-3.5 rounded-full bg-white/5 relative cursor-pointer border border-white/5 overflow-hidden group"
                onClick={handleProgressBarClick}
                title="Click any point to seek timeline"
              >
                {/* Accent Fill */}
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[#ff4e00]/65 to-[#ff4e00] transition-all duration-300 rounded-full"
                  style={{ width: `${(currentTime / durationSec) * 100}%` }}
                />
                
                {/* Glow Overlay */}
                <div 
                  className="absolute left-0 top-0 bottom-0 bg-[#ff4e00] opacity-35 filter blur-[2px] transition-all"
                  style={{ width: `${(currentTime / durationSec) * 100}%` }}
                />
              </div>

              {/* Simulated Volume Controls */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase tracking-wider">Sim Vol:</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                  className="w-16 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#ff4e00]"
                />
                <span className="text-[10px] font-mono font-semibold text-zinc-400 w-6 text-right">{volume}%</span>
              </div>
            </div>

            {/* IMDb Resolver and Watchlist Toggles */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-2">
              {activeMovie.imdbId && activeVideoTab === "stream" ? (
                <div className="flex items-center gap-3 bg-zinc-950 p-3 rounded-xl border border-white/5 shadow-inner">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-ping shrink-0" />
                  <div className="font-mono text-[11px] leading-tight text-zinc-400">
                    <span className="font-bold text-[#ff4e00] uppercase tracking-wider block text-[9px] mb-0.5">Live IMDb Resolver Active</span>
                    IMDb Code: <a href={`https://www.imdb.com/title/${activeMovie.imdbId}/`} target="_blank" rel="noreferrer" className="underline hover:text-white text-[#ff4e00] font-bold">{activeMovie.imdbId}</a>
                  </div>
                </div>
              ) : <div className="text-[11px] text-zinc-550 italic font-mono">Select CineStream player above to instantly stream movies and TV episode guides.</div>}

              {/* Bookmark state */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    const shareData = {
                      title: activeMovie.title,
                      text: `Check out ${activeMovie.title} on CineStream! ${activeMovie.overview ? activeMovie.overview.slice(0, 100) + "..." : ""}`,
                      url: window.location.href,
                    };
                    if (navigator.share) {
                      try {
                        await navigator.share(shareData);
                      } catch (err) {
                        if ((err as Error).name !== "AbortError") {
                          toast.error("Could not share content.");
                        }
                      }
                    } else {
                      try {
                        await navigator.clipboard.writeText(`${shareData.title} - ${shareData.url}`);
                        toast.success("Movie link copied to clipboard!");
                      } catch (err) {
                        toast.error("Failed to copy link.");
                      }
                    }
                  }}
                  className="flex items-center justify-center gap-2 px-3.5 sm:px-5 py-2.5 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white border border-white/5"
                  title="Share Movie"
                >
                  <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Share</span>
                </button>
                <button
                  type="button"
                  onClick={() => onToggleWatchlist(activeMovie.id)}
                  className={`flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 text-[10px] sm:text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg w-full sm:w-auto ${
                    isBookmarked
                      ? "bg-white/10 text-[#ff4e00] border-2 border-[#ff4e00]/50 hover:bg-white/15"
                      : "bg-[#ff4e00] text-white hover:bg-[#ff4e00]/90 shadow-[#ff4e00]/20"
                  }`}
                >
                  <Heart className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isBookmarked ? "fill-current" : ""}`} />
                  {isBookmarked ? "BOOKMARKED" : "ADD TO LIST"}
                </button>
              </div>
            </div>
          </div>

          {/* 📌 SYSTEM NAVIGATION DECK (EXHAUSTIVE TABS) */}
          <div className="bg-[#080808] border-b border-white/15 px-4 md:px-6 sticky top-0 z-30 shadow-md backdrop-blur-md">
            <div className="flex items-center sm:flex-nowrap overflow-x-auto sm:overflow-x-visible whitespace-nowrap gap-1 md:gap-2 py-3 scrollbar-hide">
              <button
                onClick={() => setCurrentDetailTab("overview")}
                className={`px-2.5 sm:px-4 py-2 font-mono text-[8.5px] sm:text-[10px] md:text-xs uppercase tracking-wider font-bold rounded-lg transition-all ${
                  currentDetailTab === "overview"
                    ? "bg-[#ff4e00] text-white font-black"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                📖 Story<span className="hidden xs:inline"> & AI Intel</span>
              </button>
              <button
                onClick={() => setCurrentDetailTab("cast")}
                className={`px-2.5 sm:px-4 py-2 font-mono text-[8.5px] sm:text-[10px] md:text-xs uppercase tracking-wider font-bold rounded-lg transition-all ${
                  currentDetailTab === "cast"
                    ? "bg-[#ff4e00] text-white font-black"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                🎭 Cast<span className="hidden xs:inline"> & Crew</span>
              </button>
              {activeMovie.type === "tv" && (
                <button
                  onClick={() => setCurrentDetailTab("seasons")}
                  className={`px-2.5 sm:px-4 py-2 font-mono text-[8.5px] sm:text-[10px] md:text-xs uppercase tracking-wider font-bold rounded-lg transition-all ${
                    currentDetailTab === "seasons"
                      ? "bg-[#ff4e00] text-white font-black"
                      : "text-zinc-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  📺 Episodes
                </button>
              )}
              <button
                onClick={() => setCurrentDetailTab("media")}
                className={`px-2.5 sm:px-4 py-2 font-mono text-[8.5px] sm:text-[10px] md:text-xs uppercase tracking-wider font-bold rounded-lg transition-all ${
                  currentDetailTab === "media"
                    ? "bg-[#ff4e00] text-white font-black"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                🎥 Media<span className="hidden xs:inline"> & Gallery</span>
              </button>
              <button
                onClick={() => setCurrentDetailTab("production")}
                className={`px-2.5 sm:px-4 py-2 font-mono text-[8.5px] sm:text-[10px] md:text-xs uppercase tracking-wider font-bold rounded-lg transition-all ${
                  currentDetailTab === "production"
                    ? "bg-[#ff4e00] text-white font-black"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                🏢 Production
              </button>
              <button
                onClick={() => setCurrentDetailTab("similar")}
                className={`px-2.5 sm:px-4 py-2 font-mono text-[8.5px] sm:text-[10px] md:text-xs uppercase tracking-wider font-bold rounded-lg transition-all ${
                  currentDetailTab === "similar"
                    ? "bg-[#ff4e00] text-white font-black"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                🔥 Similar
              </button>
            </div>
          </div>

          {/* TAB CONTENT SPACES */}
          <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">

            {/* TAB 1: OVERVIEW & STORY */}
            {currentDetailTab === "overview" && (
              <div className="space-y-8 animate-fade-in">
                
                {/* Story and Extra Metadata Flag */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-[#ff4e00] font-mono text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-1.5">
                        <Info className="h-4 w-4" /> Plot Synopsis
                      </h3>
                      <p className="text-zinc-200 text-sm md:text-base leading-relaxed font-sans font-normal">
                        {activeMovie.overview || "No comprehensive synopsis is available at this time. Stream CineStream Player or verify connection logs."}
                      </p>
                    </div>

                    {/* Keywords tags */}
                    {activeMovie.keywords && activeMovie.keywords.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-zinc-500 font-mono text-[10px] uppercase font-bold tracking-widest flex items-center gap-1">
                          <Tag className="h-3 w-3 text-zinc-450" /> Plot Keywords
                        </h4>
                        <div className="flex flex-wrap gap-1 md:gap-1.5 pt-1">
                          {Array.from(new Set(activeMovie.keywords)).map((kw, idx) => (
                            <span key={`${kw}-${idx}`} className="bg-white/5 border border-white/5 text-zinc-400 hover:text-white hover:border-[#ff4e00]/25 rounded px-2 py-0.5 sm:px-2.5 sm:py-1 text-[9px] sm:text-[10px] font-sans transition-colors cursor-pointer capitalize">
                              #{kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Trivia Board */}
                    {triviaData && triviaData.trivia && triviaData.trivia.length > 0 && (
                      <div className="space-y-4 mt-8 pt-6 border-t border-white/5">
                        <h4 className="text-[#ff4e00] font-mono text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5">
                          <Sparkles className="h-4 w-4" /> CineSensei Trivia Challenge
                        </h4>
                        <div className="grid gap-3">
                          {triviaData.trivia.map((t, idx) => (
                             <div key={idx} className="group bg-zinc-900/50 hover:bg-zinc-800 border border-white/10 hover:border-[#ff4e00]/30 rounded-xl p-4 text-xs text-zinc-300 font-sans leading-relaxed transition-all cursor-help select-none">
                               <p className="flex items-start gap-3">
                                 <span className="font-bold text-[#ff4e00] shrink-0">0{idx + 1}.</span> 
                                 <span className="opacity-80 group-hover:opacity-100">{t}</span>
                               </p>
                             </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* User Rating Slider */}
                    <div className="space-y-4 mt-8 pt-6 border-t border-white/5">
                        <h4 className="text-[#ff4e00] font-mono text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5">
                          <Star className="h-4 w-4 fill-[#ff4e00]" /> Your Personal Rating
                        </h4>
                        <div className="flex items-center gap-4">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <button
                                key={s}
                                onClick={() => {
                                  const r = s * 2;
                                  setRating(r);
                                  localStorage.setItem(`rating-${activeMovie.id}`, r.toString());
                                }}
                                className={`transition-all hover:scale-110 cursor-pointer ${rating >= s * 2 ? 'text-[#ff4e00]' : 'text-zinc-600'}`}
                              >
                                <Star className={`h-8 w-8 ${rating >= s * 2 ? 'fill-[#ff4e00]' : 'fill-none'}`} />
                              </button>
                            ))}
                          </div>
                          <span className="font-mono font-bold text-2xl text-white">{rating / 2} / 5</span>
                        </div>
                    </div>
                  </div>

                  {/* Extra metadata aside panel */}
                  <div className="bg-zinc-950/40 border border-white/5 rounded-2xl p-5 space-y-4">
                    <h3 className="text-zinc-300 font-mono text-[11px] font-black uppercase tracking-wider border-b border-dashed border-white/10 pb-2">
                      🔎 Extra Micro Metadata
                    </h3>
                    <div className="space-y-3 font-mono text-[11px]">
                      <div className="flex justify-between">
                        <span className="text-zinc-500 uppercase">Original Language:</span>
                        <span className="text-zinc-300 font-bold uppercase">{activeMovie.originalLanguage || "EN"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500 uppercase">A18/Adult content:</span>
                        <span className={`font-bold ${activeMovie.adult ? "text-red-500" : "text-emerald-500"}`}>{activeMovie.adult ? "Adult 18+" : "All Audiences"}</span>
                      </div>
                      {activeMovie.spokenLanguages && activeMovie.spokenLanguages.length > 0 && (
                        <div>
                          <span className="text-zinc-500 uppercase block mb-1">Spoken Languages:</span>
                          <div className="flex flex-wrap gap-1">
                            {activeMovie.spokenLanguages.map(l => (
                              <span key={l} className="bg-white/5 text-zinc-300 border border-white/5 px-2 py-0.5 rounded text-[10px] font-sans">
                                {l}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {activeMovie.originCountry && activeMovie.originCountry.length > 0 && (
                        <div>
                          <span className="text-zinc-500 uppercase block mb-1">Origin Country:</span>
                          <span className="text-zinc-300 font-semibold">{activeMovie.originCountry.join(", ")}</span>
                        </div>
                      )}
                    </div>

                    {/* Top Billed Cast Visual List */}
                    <div className="mt-8 pt-6 border-t border-dashed border-white/10 space-y-4">
                      <h3 className="text-zinc-300 font-mono text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                        <User className="h-3 w-3 text-[#ff4e00]" /> Visual Cast Team
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                         {activeMovie.fullCast?.slice(0, 6).map((actor) => (
                           <button 
                             key={actor.id}
                             onClick={() => setSelectedPersonId(actor.id)}
                             className="flex flex-col items-center gap-1.5 group cursor-pointer"
                           >
                             <div className="relative h-12 w-12 rounded-full overflow-hidden border border-white/10 group-hover:border-[#ff4e00]/40 transition-all opacity-80 group-hover:opacity-100">
                               <img 
                                 src={actor.profilePath} 
                                 alt={actor.name} 
                                 className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all" 
                               />
                             </div>
                             <span className="text-[9px] text-zinc-500 group-hover:text-zinc-200 line-clamp-1 font-sans text-center transition-colors">
                               {actor.name.split(' ')[0]}
                             </span>
                           </button>
                         ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Franchise / Collection Banner */}
                {activeMovie.belongsToCollection && (
                  <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-gradient-to-r from-black to-[#ff4e00]/10 p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-xl">
                    {activeMovie.belongsToCollection.backdropUrl && activeMovie.belongsToCollection.backdropUrl !== "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" && (
                      <div className="absolute inset-0 z-0">
                        <img 
                          src={activeMovie.belongsToCollection.backdropUrl} 
                          alt="Collection backdrop" 
                          className="h-full w-full object-cover opacity-15 filter blur-xs"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                      </div>
                    )}
                    
                    <div className="relative z-10 shrink-0 md:w-28 text-center hidden md:block">
                      {activeMovie.belongsToCollection.posterUrl && activeMovie.belongsToCollection.posterUrl !== "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" ? (
                        <img 
                          src={activeMovie.belongsToCollection.posterUrl} 
                          alt={activeMovie.belongsToCollection.name}
                          className="w-24 rounded-lg shadow-lg border border-white/10 mx-auto"
                        />
                      ) : (
                        <Layers className="h-12 w-12 text-[#ff4e00]/30 mx-auto drop-shadow-md" />
                      )}
                    </div>

                    <div className="relative z-10 flex-1 space-y-2 text-center md:text-left">
                      <span className="text-[#ff4e00] font-mono text-[9px] font-black uppercase tracking-widest border border-[#ff4e00]/25 px-2.5 py-0.5 rounded-full inline-block">
                        FRANCHISE SECTIONS (COLL)
                      </span>
                      <h4 className="text-white font-display text-lg md:text-xl font-bold">
                        Part of the highly acclaimed <span className="text-[#ff4e00] text-xl font-extrabold">{activeMovie.belongsToCollection.name}</span> Franchise
                      </h4>
                      <p className="text-zinc-400 text-xs md:text-sm font-sans max-w-2xl leading-relaxed">
                        Explore other associated movies and direct spin-offs of this franchise by searching the master CineStream atmosphere database. We automatically organize collections.
                      </p>
                    </div>
                  </div>
                )}

                {/* AI Critical Report */}
                <div className="rounded-2xl border border-[#ff4e00]/15 bg-zinc-950 p-6 space-y-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-[400px] h-[100px] bg-[#ff4e00]/5 filter blur-[100px] pointer-events-none" />
                  
                  <div className="flex items-center justify-between border-b border-white/10 pb-3 relative z-10">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-[#ff4e00] shrink-0" />
                      <h4 className="font-display text-sm font-bold text-white uppercase tracking-wider">
                        AI Critical & Trivia Report
                      </h4>
                    </div>
                    <span className="font-mono text-[9px] bg-[#ff4e00]/15 text-[#ff4e00] border border-[#ff4e00]/30 rounded px-2.5 py-1 font-bold">
                      GEMINI DEEP-DIVE ENABLER
                    </span>
                  </div>

                  {isLoadingTrivia ? (
                    <div className="flex flex-col items-center justify-center py-10 gap-3">
                      <div className="h-7 w-7 animate-spin rounded-full border-2 border-white/5 border-t-[#ff4e00]" />
                      <p className="font-mono text-xs text-zinc-500">Retrieving specialized critical cinema index...</p>
                    </div>
                  ) : triviaData ? (
                    <div className="space-y-6 relative z-10">
                      {/* Critics Analysis */}
                      <div className="relative pl-4 border-l-2 border-[#ff4e00]/80">
                        <h5 className="font-display font-semibold text-xs text-zinc-400 tracking-widest uppercase">
                          Critical Summary
                        </h5>
                        <p className="mt-2 text-zinc-200 font-sans text-sm italic leading-relaxed">
                          &ldquo;{triviaData.review}&rdquo;
                        </p>
                        <p className="mt-2.5 text-[#ff4e00]/85 font-mono text-[10px] uppercase font-bold">
                          Critics consensus: {triviaData.ratingExplanation}
                        </p>
                      </div>

                      {/* Trivia & secrets */}
                      <div className="space-y-3">
                        <h5 className="font-display font-semibold text-xs text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                          <HelpCircle className="h-3.5 w-3.5 text-[#ff4e00]" />
                          Production Secrets & Hidden Trivia
                        </h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1">
                          {triviaData.trivia.map((t, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2.5 bg-[#030303]/60 p-4 rounded-xl border border-white/5 font-sans text-xs text-zinc-300 leading-relaxed hover:border-[#ff4e00]/20 transition-all duration-300 shadow"
                            >
                              <ChevronRight className="h-4 w-4 text-[#ff4e00] shrink-0 mt-0.5" />
                              <span>{t}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center font-sans text-xs text-zinc-550 py-4 italic">
                      AI systems are running localized cinema indexing. Connect your personal secret API key to release live real-time movie trivia.
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* TAB 2: CAST & FILMMAKERS */}
            {currentDetailTab === "cast" && (
              <div className="space-y-8 animate-fade-in text-zinc-300">
                
                {/* Crew Highlights bento columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Director & Writers */}
                  <div className="bg-zinc-950/45 border border-white/5 rounded-2xl p-5 space-y-4">
                    <h3 className="text-[#ff4e00] font-mono text-[11px] font-black uppercase tracking-widest border-b border-white/5 pb-2">
                      🎬 Main Direction Crew
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-zinc-500 font-mono text-[10px] uppercase block">Directors</span>
                        {activeMovie.directors && activeMovie.directors.length > 0 ? (
                          <div className="mt-1 space-y-2">
                            {activeMovie.directors.map(dir => (
                              <button
                                key={dir.id}
                                onClick={() => setSelectedPersonId(dir.id)}
                                className="flex items-center gap-2 hover:text-[#ff4e00] text-sm font-bold text-left cursor-pointer transition-colors w-full"
                              >
                                <img src={dir.profilePath} alt={dir.name} className="h-6 w-6 rounded-full object-cover shrink-0 border border-white/10" />
                                <span>{dir.name}</span>
                              </button>
                            ))}
                          </div>
                        ) : <span className="text-sm font-medium">Christopher Nolan Fallback (Static)</span>}
                      </div>

                      <div className="pt-2">
                        <span className="text-zinc-500 font-mono text-[10px] uppercase block">Screenplay Writers</span>
                        {activeMovie.writers && activeMovie.writers.length > 0 ? (
                          <div className="mt-1 space-y-2">
                            {activeMovie.writers.map(w => (
                              <button
                                key={w.id}
                                onClick={() => setSelectedPersonId(w.id)}
                                className="flex items-center gap-2 hover:text-[#ff4e00] text-sm font-bold text-left cursor-pointer transition-colors w-full"
                              >
                                <img src={w.profilePath} alt={w.name} className="h-6 w-6 rounded-full object-cover shrink-0 border border-white/10" />
                                <span>{w.name}</span>
                              </button>
                            ))}
                          </div>
                        ) : <span className="text-sm">Tarantino Style Collaborator</span>}
                      </div>
                    </div>
                  </div>

                  {/* Producers */}
                  <div className="bg-zinc-950/45 border border-white/5 rounded-2xl p-5 space-y-4">
                    <h3 className="text-[#ff4e00] font-mono text-[11px] font-black uppercase tracking-widest border-b border-white/5 pb-2">
                      💰 Producers & Finance
                    </h3>
                    <div>
                      <span className="text-zinc-500 font-mono text-[10px] uppercase block mb-1">Production Supervisors</span>
                      {activeMovie.producers && activeMovie.producers.length > 0 ? (
                        <div className="space-y-2.5">
                          {activeMovie.producers.map(p => (
                            <button
                              key={p.id}
                              onClick={() => setSelectedPersonId(p.id)}
                              className="flex items-center gap-2 hover:text-[#ff4e00] text-xs font-bold text-left cursor-pointer transition-colors w-full"
                            >
                              <img src={p.profilePath} alt={p.name} className="h-6 w-6 rounded-full object-cover shrink-0 border border-white/10" />
                              <span>{p.name}</span>
                            </button>
                          ))}
                        </div>
                      ) : <span className="text-xs">Representative Executive Producers</span>}
                    </div>
                  </div>

                  {/* Creative Leadership (DP, Composer etc.) */}
                  <div className="bg-zinc-950/45 border border-white/5 rounded-2xl p-5 space-y-4">
                    <h3 className="text-[#ff4e00] font-mono text-[11px] font-black uppercase tracking-widest border-b border-white/5 pb-2">
                      🎨 Creative Leadership
                    </h3>
                    {activeMovie.creativeTeam && activeMovie.creativeTeam.length > 0 ? (
                      <div className="space-y-3">
                        {activeMovie.creativeTeam.slice(0, 6).map((ct, idx) => (
                          <div key={idx} className="flex justify-between items-center text-xs">
                            <button 
                              onClick={() => setSelectedPersonId(ct.id)}
                              className="font-bold text-zinc-200 hover:text-[#ff4e00] flex items-center gap-1.5 cursor-pointer text-left"
                            >
                              <img src={ct.profilePath} alt={ct.name} className="h-5 w-5 rounded-full object-cover shrink-0 border border-white/10" />
                              <span className="line-clamp-1">{ct.name}</span>
                            </button>
                            <span className="text-[10px] font-mono text-zinc-500 shrink-0 uppercase">{ct.job}</span>
                          </div>
                        ))}
                      </div>
                    ) : <span className="text-xs">Hans Zimmer & Fraser Style Departmental Heads</span>}
                  </div>

                </div>

                {/* Direction Assistance Team and Second Unit */}
                {activeMovie.directionTeam && activeMovie.directionTeam.length > 0 && (
                  <div className="bg-zinc-950/20 border border-white/5 rounded-2xl p-5 space-y-3">
                    <h3 className="text-[#ff4e00] font-mono text-[11px] font-black uppercase tracking-wider">
                      🎞️ Production Direction Assistants & Second Unit Teams
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {activeMovie.directionTeam.slice(0, 8).map((dt, idx) => (
                        <div key={idx} className="bg-[#030303] border border-white/5 rounded-xl p-3 flex flex-col justify-between hover:border-[#ff4e00]/20 transition-all shadow">
                          <button
                            onClick={() => setSelectedPersonId(dt.id)}
                            className="font-semibold text-xs text-zinc-100 hover:text-[#ff4e00] text-left cursor-pointer line-clamp-1 flex items-center gap-1.5"
                          >
                            <img src={dt.profilePath} alt={dt.name} className="h-5 w-5 rounded-full object-cover shrink-0 border border-white/10" />
                            <span>{dt.name}</span>
                          </button>
                          <span className="font-mono text-[8px] uppercase text-zinc-500 mt-2 block tracking-wider">{dt.job}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Main Cast (Full Cast and Character details) */}
                <div className="space-y-4">
                  <h3 className="text-[#ff4e00] font-mono text-[11px] font-black uppercase tracking-widest border-b border-white/5 pb-2">
                    🎭 Screen Actors & Main Cast ({activeMovie.fullCast ? activeMovie.fullCast.length : 5} members)
                  </h3>
                  <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2 sm:gap-4">
                    {activeMovie.fullCast && activeMovie.fullCast.length > 0 ? (
                      activeMovie.fullCast.map(actor => (
                        <div
                          key={actor.id}
                          onClick={() => setSelectedPersonId(actor.id)}
                          className="group bg-zinc-950 border border-white/5 hover:border-[#ff4e00]/30 rounded-xl p-2.5 sm:p-3 space-y-1.5 sm:space-y-2 cursor-pointer transition-colors text-center relative hover:bg-white/5 shadow-md flex flex-col justify-between"
                        >
                          <div className="relative aspect-[1/1] w-14 h-14 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-[#ff4e00]/50 transition-colors mx-auto shrink-0 shadow-lg">
                            <img
                              src={actor.profilePath}
                              alt={actor.name}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-350"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                e.currentTarget.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
                              }}
                            />
                          </div>
                          <div>
                            <h4 className="font-sans text-xs font-bold text-zinc-100 group-hover:text-[#ff4e00] transition-colors line-clamp-1 leading-tight mt-1">
                              {actor.name}
                            </h4>
                            <p className="font-mono text-[10px] text-zinc-500 line-clamp-1 mt-0.5 leading-tight italic">
                              as {actor.character}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      activeMovie.cast.map((actor, idx) => (
                        <div
                          key={idx}
                          className="bg-zinc-950 border border-white/5 rounded-xl p-4 text-center space-y-2 shadow-md"
                        >
                          <div className="relative aspect-[1/1] w-12 h-12 rounded-full overflow-hidden mx-auto border border-white/10 bg-zinc-900 flex items-center justify-center">
                            <User className="h-6 w-6 text-zinc-650" />
                          </div>
                          <h4 className="font-sans text-xs font-bold text-zinc-200 line-clamp-1 mt-1">
                            {actor}
                          </h4>
                          <p className="font-mono text-[9px] text-zinc-500">Character Lead</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* TAB 3: TV EPISODES GUIDE (Only displayed for TV Series) */}
            {currentDetailTab === "seasons" && activeMovie.type === "tv" && (
              <div className="space-y-6 animate-fade-in text-zinc-350">
                
                {/* Seasons List Horizontal Scroll */}
                <div className="space-y-2">
                  <h4 className="text-zinc-500 font-mono text-[10px] uppercase font-bold tracking-widest">
                    Available Seasons
                  </h4>
                  <div className="flex gap-3 overflow-x-auto pb-4 pt-1">
                    {activeMovie.seasons && activeMovie.seasons.length > 0 ? (
                      activeMovie.seasons.map(s => (
                        <div
                          key={s.id}
                          onClick={() => {
                            setTvSeason(s.seasonNumber);
                            setTvEpisode(1);
                          }}
                          className={`flex items-center gap-3 bg-[#080808] border rounded-xl p-3 cursor-pointer shrink-0 min-w-[220px] transition-colors select-none ${
                            tvSeason === s.seasonNumber
                              ? "border-[#ff4e00] bg-[#ff4e00]/5 text-white"
                              : "border-white/5 text-zinc-300 hover:border-zinc-700 hover:bg-white/5"
                          }`}
                        >
                          <img
                            src={s.posterPath}
                            alt={s.name}
                            className="h-16 w-12 rounded shadow-md object-cover"
                            onError={(e) => {
                              e.currentTarget.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
                            }}
                          />
                          <div className="min-w-0">
                            <h5 className="font-bold text-xs line-clamp-1 leading-snug">{s.name}</h5>
                            <span className="font-mono text-[10px] text-[#ff4e00] uppercase font-bold mt-1 block">
                              {s.episodeCount} Episodes
                            </span>
                            <span className="font-mono text-[9px] text-zinc-550 block mt-0.5">
                              Air date: {s.airDate}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : <span className="font-mono text-xs italic">Seasons checklist empty.</span>}
                  </div>
                </div>

                {/* Episodes Guides section */}
                <div className="border-t border-white/5 pt-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <div className="flex items-center gap-2">
                      <Tv className="h-4 w-4 text-[#ff4e00]" />
                      <h4 className="font-mono text-xs uppercase font-extrabold text-white">
                        Season {tvSeason} Episode Guide
                      </h4>
                    </div>
                    <span className="font-mono text-[10px] text-zinc-550 italic">Currently displaying full cast episode listing</span>
                  </div>

                  {isLoadingEpisodes ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/5 border-t-[#ff4e00]" />
                      <span className="font-mono text-xs text-zinc-500">Retrieving episodic timeline summaries...</span>
                    </div>
                  ) : seasonEpisodes && seasonEpisodes.length > 0 ? (
                    <div className="space-y-4">
                      {seasonEpisodes.map(ep => {
                        const playable = isPlayable(ep.airDate);
                        return (
                        <div
                          key={ep.id}
                          onClick={() => {
                            if (!playable) return;
                            setTvEpisode(ep.episodeNumber);
                            setActiveVideoTab("stream");
                            document.getElementById("movie-detail-modal")?.scrollTo({ top: 300, behavior: "smooth" });
                          }}
                          className={`flex flex-col md:flex-row gap-5 p-4 rounded-xl border transition-all select-none bg-zinc-950/45 ${
                            !playable 
                              ? "opacity-60 cursor-not-allowed border-dashed border-white/5"
                              : tvEpisode === ep.episodeNumber
                                ? "border-[#ff4e00] bg-[#ff4e00]/5 text-white cursor-pointer"
                                : "border-white/5 text-zinc-350 hover:border-zinc-750 hover:bg-white/5 cursor-pointer"
                          }`}
                        >
                          <div className="w-full md:w-44 aspect-video bg-zinc-900 rounded-lg overflow-hidden shrink-0 border border-white/5 relative bg-center bg-cover">
                            {ep.stillPath ? (
                              <img src={ep.stillPath} alt={ep.name} className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-zinc-950 text-zinc-700">
                                <Film className="h-6 w-6" />
                              </div>
                            )}
                            {!playable ? (
                              <div className="absolute inset-0 bg-black/70 flex items-center justify-center backdrop-blur-[1px]">
                                <span className="font-mono text-[9px] font-black tracking-widest uppercase text-[#ff4e00] bg-black/60 px-2 py-1 rounded">Coming Soon</span>
                              </div>
                            ) : (
                              <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold text-[#ff4e00]">
                                EP {ep.episodeNumber}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 space-y-1.5">
                            <div className="flex items-start justify-between flex-wrap gap-2">
                              <h5 className="font-bold text-sm text-zinc-200">
                                Episode {ep.episodeNumber}: <span className="text-zinc-105 transition-colors">{ep.name}</span>
                              </h5>
                              <span className="font-mono text-[10px] font-bold text-[#f59e0b] bg-white/5 px-2 py-0.5 border border-white/5 rounded-md flex items-center gap-0.5">
                                ⭐ {ep.voteAverage ? ep.voteAverage.toFixed(1) : "8.0"}
                              </span>
                            </div>
                            <span className="font-mono text-[9px] text-[#ff4e00]/70 uppercase tracking-widest font-bold block">{ep.airDate ? new Date(ep.airDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric'}) : "Air Date Unknown"}</span>
                            <p className="text-zinc-400 text-xs md:text-sm leading-relaxed font-sans font-normal line-clamp-3">
                              {ep.overview || "No comprehensive segment summary has been registered for this televised block."}
                            </p>
                          </div>
                        </div>
                      )})}
                    </div>
                  ) : <span className="text-xs font-mono text-zinc-550">No episodes located. Please select another TV Season representation.</span>}
                </div>

              </div>
            )}

            {/* TAB 4: VIDEOS & IMAGE GALLERY */}
            {currentDetailTab === "media" && (
              <div className="space-y-8 animate-fade-in text-zinc-300">
                
                {/* Custom trailers clips checklist */}
                {movieVideos.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-[#ff4e05] font-mono text-[11px] uppercase tracking-widest font-black border-b border-white/5 pb-2">
                      ▶️ TMDb Video Channels & Clips
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {movieVideos.slice(0, 15).map((v, idx) => (
                        <div
                          key={v.key + idx}
                          onClick={() => {
                            setActiveMovie(prev => ({
                              ...prev,
                              trailerUrl: `https://www.youtube.com/embed/${v.key}`
                            }));
                            setActiveVideoTab("trailer");
                            document.getElementById("movie-detail-modal")?.scrollTo({ top: 300, behavior: "smooth" });
                          }}
                          className="bg-zinc-950 border border-white/5 hover:border-[#ff4e00]/40 p-4 rounded-xl flex items-center gap-3 cursor-pointer transition-colors hover:bg-white/5"
                        >
                          <Play className="h-5 w-5 text-[#ff4e00] shrink-0" />
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-zinc-200 line-clamp-1 leading-snug">{v.name}</h5>
                            <span className="font-mono text-[9px] text-[#ff4e00]/75 uppercase mt-1 block font-bold leading-none">{v.type} ({v.site})</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Galleries (posters, backdrops, logos) */}
                <div className="space-y-6">
                  <h3 className="text-[#ff4e05] font-mono text-[11px] uppercase tracking-widest font-black border-b border-white/5 pb-2">
                    🖼️ Aesthetic Backdrops & Media Assets (Logos & Posters)
                  </h3>

                  {/* Backdrop Sliders */}
                  {activeMovie.backdrops && activeMovie.backdrops.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-zinc-500 font-mono text-[10px] uppercase block">Stage Backdrop Wallpapers (HD)</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {activeMovie.backdrops.slice(0, 6).map((img, idx) => (
                          <div key={idx} className="aspect-video bg-zinc-950 rounded-xl overflow-hidden border border-white/5 shadow hover:scale-[1.02] hover:border-[#ff4e05]/30 transition-all cursor-pointer">
                            <img src={img} alt="HD Backdrop asset" className="h-full w-full object-cover" loading="lazy" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Posters Sliders */}
                  {activeMovie.posters && activeMovie.posters.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <span className="text-zinc-500 font-mono text-[10px] uppercase block">Regional Cinema Posters</span>
                      <div className="flex gap-4 overflow-x-auto pb-4 pt-1">
                        {activeMovie.posters.slice(0, 8).map((img, idx) => (
                          <div key={idx} className="w-28 shrink-0 aspect-[2/3] bg-zinc-950 rounded-lg overflow-hidden border border-white/5 shadow shadow-black hover:border-zinc-700 transition-colors cursor-pointer">
                            <img src={img} alt="Poster asset" className="h-full w-full object-cover" loading="lazy" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

              </div>
            )}

            {/* TAB 5: PRODUCTION & CORPORATE FINANCIALS */}
            {currentDetailTab === "production" && (
              <div className="space-y-8 animate-fade-in text-zinc-300">
                
                {/* Financial overview row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Budget card */}
                  <div className="bg-zinc-950/45 border border-white/5 rounded-2xl p-6 flex items-center gap-4 shadow-xl">
                    <div className="rounded-xl bg-orange-500/10 border border-orange-550/20 p-3 text-orange-500">
                      <DollarSign className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-zinc-500 font-mono text-[9px] uppercase block">Allocated Production Budget</span>
                      <h4 className="text-lg md:text-2xl font-mono font-black text-white mt-1">
                        {formatCurrency(activeMovie.budget)}
                      </h4>
                    </div>
                  </div>

                  {/* Revenue card */}
                  <div className="bg-zinc-950/45 border border-white/5 rounded-2xl p-6 flex items-center gap-4 shadow-xl">
                    <div className="rounded-xl bg-emerald-500/10 border border-emerald-555/20 p-3 text-emerald-400">
                      <DollarSign className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-zinc-500 font-mono text-[9px] uppercase block">Worldwide Box Office Revenue</span>
                      <h4 className="text-lg md:text-2xl font-mono font-black text-white mt-1">
                        {formatCurrency(activeMovie.revenue)}
                      </h4>
                    </div>
                  </div>

                  {/* ROI Analysis card */}
                  <div className="bg-zinc-950/45 border border-white/5 rounded-2xl p-6 flex items-center gap-4 shadow-xl">
                    <div className="rounded-xl bg-[#ff4e00]/10 border border-[#ff4e00]/25 p-3 text-[#ff4e00]">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    {activeMovie.budget && activeMovie.revenue && activeMovie.budget > 0 ? (
                      <div>
                        <span className="text-zinc-500 font-mono text-[9px] uppercase block">ROI Net Margin / Returns</span>
                        <h4 className={`text-base md:text-lg font-mono font-black mt-1 ${activeMovie.revenue - activeMovie.budget >= 0 ? "text-emerald-400" : "text-rose-500"}`}>
                          {formatCurrency(activeMovie.revenue - activeMovie.budget)} 
                          <span className="font-normal text-[11px] uppercase block mt-1 text-zinc-400">
                            ({((activeMovie.revenue / activeMovie.budget) * 100 - 100).toFixed(0)}% ROI Yield)
                          </span>
                        </h4>
                      </div>
                    ) : (
                      <div>
                        <span className="text-zinc-500 font-mono text-[9px] uppercase block">ROI Analysis</span>
                        <h4 className="text-sm font-semibold text-zinc-400 mt-1">N/A (Budgets missing)</h4>
                      </div>
                    )}
                  </div>

                </div>

                {/* Production Brands */}
                {activeMovie.productionCompanies && activeMovie.productionCompanies.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-[#ff4e00] font-mono text-[11px] font-black uppercase tracking-widest border-b border-white/10 pb-2">
                      🏢 Registered Studios & Production Companies
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {activeMovie.productionCompanies.map((company, idx) => (
                        <div
                          key={idx}
                          className="bg-zinc-950 border border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:border-[#ff4e00]/25 transition-all text-center h-34 shadow"
                        >
                          <div className="h-14 flex items-center justify-center p-2 rounded-xl bg-black/40 border border-white/5">
                            {company.logoUrl ? (
                              <img
                                src={company.logoUrl}
                                alt={company.name}
                                className="max-h-full max-w-full object-contain filter invert brightness-200 select-none grayscale"
                              />
                            ) : (
                              <Building className="h-6 w-6 text-zinc-750" />
                            )}
                          </div>
                          <div>
                            <h5 className="font-semibold text-xs text-zinc-200 line-clamp-1 mt-3 leading-tight">{company.name}</h5>
                            <span className="font-mono text-[8px] text-zinc-450 uppercase block tracking-wider mt-1">{company.originCountry || "Origin Unknown"}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* TAB 6: SIMILAR RECOMENDATIONS */}
            {currentDetailTab === "similar" && (
              <div className="space-y-6 animate-fade-in text-zinc-300">
                <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                  <Film className="h-4 w-4 text-[#ff4e00]" />
                  <h4 className="font-mono text-xs uppercase font-extrabold text-white">
                    Highly Correlated Cinematic Recommendations
                  </h4>
                </div>

                {activeMovie.similar && activeMovie.similar.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
                    {activeMovie.similar.map(simMovie => (
                      <div
                        key={simMovie.id}
                        onClick={() => handleSelectSimilar(simMovie)}
                        className="group cursor-pointer space-y-2 relative"
                      >
                        <div className="relative aspect-[2/3] w-full rounded-xl overflow-hidden border border-white/10 bg-[#0a0a0a] group-hover:border-[#ff4e00]/60 transition-all shadow-md">
                          {simMovie.posterUrl === "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" ? (
                            <div className="flex flex-col items-center justify-center p-2 text-center h-full w-full border-2 border-dashed border-zinc-800 bg-[#0a0a0a] shadow-inner">
                              <div className="relative mb-2">
                                <div className="absolute inset-0 animate-ping opacity-20 bg-[#ff4e00] rounded-full blur-md border-dashed"></div>
                                <Lock className="h-6 w-6 text-zinc-600 animate-pulse relative z-10" />
                              </div>
                              <span className="font-mono text-[8px] uppercase font-black tracking-widest text-[#ff4e00] opacity-80 border-b border-[#ff4e00]/30 pb-0.5 mb-1">Classified</span>
                              <span className="text-[9px] font-bold text-zinc-500 leading-tight">Under<br/>Construction</span>
                            </div>
                          ) : (
                            <img
                              src={simMovie.posterUrl}
                              alt={simMovie.title}
                              className="h-full w-full object-cover transition-transform duration-350 group-hover:scale-103"
                              referrerPolicy="no-referrer"
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
                              }}
                            />
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Play className="h-8 w-8 text-[#ff4e00] fill-current animate-pulse shrink-0" />
                          </div>
                          <span className="absolute top-2 left-2 bg-black/80 px-1 py-0.5 rounded text-[8px] font-mono font-bold text-white uppercase border border-white/5 shadow-md">
                            {simMovie.type.toUpperCase()}
                          </span>
                        </div>
                        <h4 className="font-sans text-[11px] font-black text-zinc-200 group-hover:text-[#ff4e00] transition-colors line-clamp-1 leading-tight">
                          {simMovie.title}
                        </h4>
                        <p className="font-mono text-[9px] text-zinc-450 flex items-center justify-between leading-none">
                          <span>⭐ {simMovie.rating ? simMovie.rating.toFixed(1) : "7.0"}</span>
                          <span>{simMovie.releaseDate ? simMovie.releaseDate.split("-")[0] : ""}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 font-mono text-xs italic text-zinc-550">
                    Establishing similar recommendations indices...
                  </div>
                )}
              </div>
            )}

          </div>

          {/* Core lower trigger to lock/close detail modal */}
          <div className="p-6 border-t border-white/10 bg-[#080808] flex items-center justify-center shrink-0">
            <button
              onClick={onClose}
              className="px-8 py-3 rounded-full border border-white/10 hover:border-[#ff4e00]/60 text-xs font-mono font-bold uppercase tracking-widest text-zinc-350 hover:text-white bg-white/5 hover:bg-[#ff4e00]/15 transition-all cursor-pointer flex items-center gap-2 shadow-lg"
            >
              ← CLOSE CINEMA DETAIL OVERLAY
            </button>
          </div>

        </div>
      </motion.div>

      {/* 👤 MODIFIER INTERACTIVE ACTOR/PERSON DETAILS DRAWER OVERLAY */}
      <AnimatePresence>
        {selectedPersonId && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4 backdrop-blur-lg bg-black/90">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 350 }}
              className="relative w-full max-w-2xl bg-[#080808] border border-white/15 rounded-3xl shadow-2xl overflow-hidden shadow-black/100 max-h-[88vh] flex flex-col"
            >
              <button
                onClick={() => setSelectedPersonId(null)}
                className="absolute right-4 top-4 z-50 rounded-full bg-black/80 border border-white/10 p-2 text-zinc-450 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              <div className="overflow-y-auto p-6 md:p-8 space-y-6 flex-1 custom-scrollbar">
                
                {isLoadingPerson ? (
                  <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/5 border-t-[#ff4e00]" />
                    <p className="font-mono text-xs text-zinc-400">Loading production person files...</p>
                  </div>
                ) : personData ? (
                  <div className="space-y-6">
                    {/* Actor Identity card */}
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-white/5 pb-6">
                      <div className="relative shrink-0 select-none">
                        <img
                          src={personData.profileUrl}
                          alt={personData.name}
                          className="h-32 w-28 rounded-2xl border-2 border-white/15 shadow-xl object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            e.currentTarget.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
                          }}
                        />
                        <span className="absolute bottom-2 left-2 bg-black/85 text-[8px] border border-white/5 text-teal-400 font-mono tracking-wider px-2 py-0.5 rounded uppercase font-black shadow">
                          {personData.knownForDepartment}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-center sm:text-left min-w-0">
                        <h4 className="font-display font-black text-2xl md:text-3.5xl text-white tracking-tight leading-none">
                          {personData.name}
                        </h4>
                        
                        <div className="text-[11px] font-mono text-zinc-405 space-y-1 pt-1.5 uppercase">
                          {personData.birthday && (
                            <p className="flex items-center gap-1.5 justify-center sm:justify-start">
                              <Calendar className="h-3.5 w-3.5 text-[#ff4e00]" />
                              Born: {personData.birthday} {personData.deathday ? `(Died: ${personData.deathday})` : ""}
                            </p>
                          )}
                          {personData.placeOfBirth && (
                            <p className="flex items-center gap-1.5 justify-center sm:justify-start line-clamp-1">
                              <Globe className="h-3.5 w-3.5 text-teal-400" />
                              Born In: {personData.placeOfBirth}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Biography */}
                    <div className="space-y-2">
                      <h5 className="text-[#ff4e00] font-mono text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                        <User className="h-3.5 w-3.5" /> Biography & Achievements
                      </h5>
                      <p className="text-zinc-350 text-xs md:text-sm leading-relaxed font-sans font-normal max-h-[160px] overflow-y-auto pr-2 custom-scrollbar whitespace-pre-wrap">
                        {personData.biography || "No detailed biography has been uploaded to the registry files."}
                      </p>
                    </div>

                    {/* Person filmography ("Known For") */}
                    {personData.credits && personData.credits.length > 0 && (
                      <div className="space-y-3.5 border-t border-white/5 pt-5">
                        <h5 className="text-[#ff4e00] font-mono text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                          <Layers className="h-3.5 w-3.5" /> Highly Rated Filmography ("Known For")
                        </h5>
                        <div className="flex gap-4.5 overflow-x-auto pb-4 pt-1 mask-linear-r select-none scrollbar-hide">
                          {personData.credits.map((cred, idx) => (
                            <div
                              key={cred.id + idx}
                              onClick={() => {
                                handleSelectSimilar({
                                  id: cred.id,
                                  title: cred.title,
                                  type: cred.type,
                                  overview: "CineStream dynamic load",
                                  rating: cred.rating,
                                  releaseDate: "",
                                  posterUrl: cred.posterUrl,
                                  backdropUrl: "",
                                  genres: ["Drama"],
                                  trailerUrl: "",
                                  duration: "2h",
                                  cast: []
                                });
                              }}
                              className="group w-24 shrink-0 space-y-1.5 cursor-pointer"
                            >
                              <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden border border-white/15 bg-zinc-950 shadow hover:border-[#ff4e00]/50 transition-colors">
                                {cred.posterUrl === "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" ? (
                                  <div className="flex flex-col items-center justify-center p-2 text-center h-full w-full border-2 border-dashed border-zinc-800 bg-[#0a0a0a] shadow-inner">
                                    <div className="relative mb-1">
                                      <div className="absolute inset-0 animate-ping opacity-20 bg-[#ff4e00] rounded-full blur-sm border-dashed"></div>
                                      <Lock className="h-4 w-4 text-zinc-600 animate-pulse relative z-10" />
                                    </div>
                                    <span className="font-mono text-[7px] uppercase font-black tracking-widest text-[#ff4e00] opacity-80 border-b border-[#ff4e00]/30 pb-0.5 mb-1">Classified</span>
                                  </div>
                                ) : (
                                  <img
                                    src={cred.posterUrl}
                                    alt={cred.title}
                                    className="h-full w-full object-cover group-hover:scale-103 transition-transform duration-300"
                                    referrerPolicy="no-referrer"
                                    onError={(e) => {
                                      e.currentTarget.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
                                    }}
                                  />
                                )}
                                <div className="absolute top-1 left-1 bg-black/85 px-1 py-0.5 rounded text-[7px] font-mono font-extrabold text-white uppercase border border-white/5">
                                  {cred.type.toUpperCase()}
                                </div>
                              </div>
                              <h6 className="font-sans text-[10px] font-bold text-zinc-300 group-hover:text-[#ff4e00] line-clamp-1 leading-snug">
                                {cred.title}
                              </h6>
                              {cred.character && (
                                <p className="font-mono text-[8px] text-zinc-550 italic line-clamp-1 leading-none mt-0.5">
                                  as {cred.character}
                                </p>
                              )}
                              {cred.job && (
                                <p className="font-mono text-[8px] text-zinc-550 font-bold uppercase tracking-wider line-clamp-1 leading-none mt-0.5 text-[#ff4e00]">
                                  {cred.job}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center font-sans text-xs text-zinc-550 italic py-10">
                    Failed to sync details.
                  </div>
                )}

                {/* Actor overlay footer trigger */}
                <div className="pt-4 border-t border-white/5 text-center">
                  <button
                    onClick={() => setSelectedPersonId(null)}
                    className="px-6 py-2 rounded-full border border-white/10 hover:border-[#ff4e00]/50 text-[10px] font-mono uppercase tracking-wider text-zinc-400 hover:text-white hover:bg-white/5 font-black cursor-pointer"
                  >
                    ← Back to Movie details
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
