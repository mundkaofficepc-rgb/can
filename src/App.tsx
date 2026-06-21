import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import MovieGrid from "./components/MovieGrid";
import MovieRow from "./components/MovieRow";
import MovieDetailModal from "./components/MovieDetailModal";
import MoodRecommender from "./components/MoodRecommender";
import CinemaSensei from "./components/CinemaSensei";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";
import { Movie } from "./types";
import { Sparkles, Bookmark, Play, Clock, X, MessageSquare, Lock, Flame, Rocket, Palette, Skull, Grid, Theater, Music } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { curatedMovies } from "./data/curatedMovies";
import { isPlayable } from "./utils";
const emptyStateImage = "https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=2070&auto=format&fit=crop";

const TMDB_API_KEY = "1d84ab491afb8deec137b04c9f397a39";

const CLIENT_GENRE_MAP: { [key: number]: string } = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  22: "Family",
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
  37: "Western"
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
          posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
          backdropUrl: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
          genres: genres.length > 0 ? genres : ["Drama"],
          trailerUrl: `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(title + " official trailer")}`,
          duration: isTv ? "Season 1" : "2h",
          cast: ["Featured Cast"],
        };
      });
      list.push(...trendingItems);
    }
  } catch (err) {
    console.error("Client TMDB trending load error:", err);
  }
  return list;
}

const GUARANTEED_UPCOMING: Movie[] = [
  {
    id: 990101,
    title: "Avatar: Fire and Ash",
    type: "movie",
    overview: "The third installment of the blockbuster sci-fi franchise. Jake Sully and Neytiri encounter an aggressive, volcanic clan of Na'vi known as the 'Ash People'.",
    rating: 0.0,
    releaseDate: "2026-12-18",
    posterUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    backdropUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    genres: ["Sci-Fi", "Adventure", "Fantasy"],
    trailerUrl: "https://www.youtube.com/embed?listType=search&list=Avatar%20Fire%20and%20Ash%20official%20trailer",
    duration: "TBD",
    cast: ["Sam Worthington", "Zoe Saldana", "Sigourney Weaver"],
    originalLanguage: "en"
  },
  {
    id: 990102,
    title: "Avengers: Doomsday",
    type: "movie",
    overview: "The legendary superhero ensemble returns as the Avengers face off against Victor von Doom in a battle across the multiverse.",
    rating: 0.0,
    releaseDate: "2027-05-01",
    posterUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    backdropUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    genres: ["Action", "Sci-Fi", "Adventure"],
    trailerUrl: "https://www.youtube.com/embed?listType=search&list=Avengers%20Doomsday%20teaser%20trailer",
    duration: "TBD",
    cast: ["Robert Downey Jr.", "Pedro Pascal", "Vanessa Kirby"],
    originalLanguage: "en"
  },
  {
    id: 990103,
    title: "Stranger Things (Season 5)",
    type: "tv",
    overview: "The final, epic season of the horror and retro sci-fi web series. Vecna's rift has fully opened into Hawkins, and Eleven and the group must make their final stand to save their world.",
    rating: 0.0,
    releaseDate: "2026-10-31",
    posterUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    backdropUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    genres: ["Sci-Fi", "Thriller", "Drama"],
    trailerUrl: "https://www.youtube.com/embed?listType=search&list=Stranger%20Things%20Season%205%20official%20trailer",
    duration: "8 Episodes",
    cast: ["Millie Bobby Brown", "Finn Wolfhard", "David Harbour"],
    originalLanguage: "en"
  },
  {
    id: 990104,
    title: "The Batman: Part II",
    type: "movie",
    overview: "Bruce Wayne continues to navigate the grim corruption of Gotham City in this highly anticipated detective action sequel directed by Matt Reeves.",
    rating: 0.0,
    releaseDate: "2026-10-02",
    posterUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    backdropUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    genres: ["Action", "Drama", "Thriller"],
    trailerUrl: "https://www.youtube.com/embed?listType=search&list=The%20Batman%20Part%202%20trailer",
    duration: "TBD",
    cast: ["Robert Pattinson", "Andy Serkis", "Colin Farrell"],
    originalLanguage: "en"
  },
  {
    id: 990105,
    title: "Metroid Prime: Web Series",
    type: "tv",
    overview: "A groundbreaking space horror web series mapping Samus Aran's desolate exploration of Tallon IV. Unreleased sci-fi masterwork scheduled for autumn.",
    rating: 0.0,
    releaseDate: "2026-11-12",
    posterUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    backdropUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    genres: ["Sci-Fi", "Action", "Thriller"],
    trailerUrl: "https://www.youtube.com/embed?listType=search&list=Metroid%20Prime%20teaser",
    duration: "10 Episodes",
    cast: ["Brie Larson"],
    originalLanguage: "en"
  }
];

async function fetchUpcomingFromTMDB(): Promise<Movie[]> {
  const CURRENT_DATE = "2026-06-21";
  const list: Movie[] = [...GUARANTEED_UPCOMING];
  
  try {
    const res = await fetch(`https://api.themoviedb.org/3/movie/upcoming?api_key=${TMDB_API_KEY}&language=en-US&page=1`);
    if (res.ok) {
      const data = await res.json();
      const tmdbUpcoming = (data.results || [])
        .filter((item: any) => {
          const rd = item.release_date || "";
          return !isPlayable(rd);
        })
        .map((item: any) => {
          const title = item.title || item.original_title;
          const genres = (item.genre_ids || []).map((gid: number) => CLIENT_GENRE_MAP[gid]).filter((g: any) => !!g);
          return {
            id: item.id,
            title,
            type: "movie" as const,
            overview: item.overview || "This highly anticipated release is scheduled to hit theaters soon. Check back for official showtimes.",
            rating: item.vote_average || 0.0,
            releaseDate: item.release_date || "Upcoming Release",
            posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
            backdropUrl: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
            genres: genres.length > 0 ? genres : ["Upcoming", "Drama"],
            trailerUrl: `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(title + " official teaser trailer")}`,
            duration: "TBD",
            cast: ["Cast information coming soon"],
            originalLanguage: item.original_language || "en"
          };
        });
      
      // Append TMDB ones that aren't duplicates
      for (const item of tmdbUpcoming) {
        if (!list.some(existing => existing.id === item.id)) {
          list.push(item);
        }
      }
    }
  } catch (err) {
    console.error("TMDB upcoming load error:", err);
  }
  return list;
}

async function fetchTrendingWeekFromTMDB(): Promise<Movie[]> {
  try {
    const res = await fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${TMDB_API_KEY}`);
    if (res.ok) {
      const data = await res.json();
      const items = (data.results || []).map((item: any) => {
        const title = item.title || item.original_title;
        const genres = (item.genre_ids || []).map((gid: number) => CLIENT_GENRE_MAP[gid]).filter((g: any) => !!g);
        return {
          id: item.id,
          title,
          type: "movie",
          overview: item.overview || "Spotlight feature this week.",
          rating: item.vote_average || 7.5,
          releaseDate: item.release_date || "2026",
          posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
          backdropUrl: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
          genres: genres.length > 0 ? genres : ["Trending"],
          trailerUrl: `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(title + " trailer")}`,
          duration: "2h",
          cast: ["Featured Stars"],
        };
      });
      // Deduplicate by ID
      return Array.from(new Map(items.map(m => [m.id, m])).values()).slice(0, 8) as Movie[];
    }
  } catch (err) {
    console.error("TMDB trending week load error:", err);
  }
  return [];
}

export default function App() {
  const [movies, setMovies] = useState<Movie[]>(curatedMovies);
  const [activeTab, setActiveTab] = useState<string>("movies");
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [watchlist, setWatchlist] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem("cinestream_watchlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  
  // Persistent storage for movie objects added to watchlist
  const [watchlistFull, setWatchlistFull] = useState<Movie[]>(() => {
    try {
      const saved = localStorage.getItem("cinestream_watchlist_objects");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [notifications, setNotifications] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem("cinestream_notifications");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [selectedGenre, setSelectedGenre] = useState<string>("All");
  const [sortBy, setSortBy] = useState<string>("popularity");
  const [isGenreLoading, setIsGenreLoading] = useState<boolean>(false);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [isSenseiOpen, setIsSenseiOpen] = useState<boolean>(false);

  // Sorting logic
  const sortedMovies = React.useMemo(() => {
    return [...movies].sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "releaseDate":
          return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
        case "popularity":
        default:
          return (b.popularity || 0) - (a.popularity || 0);
      }
    });
  }, [movies, sortBy]);

  // Language live search filter state
  const [searchLanguageFilter, setSearchLanguageFilter] = useState<string>("All");

  // Continue watching states
  const [continueWatching, setContinueWatching] = useState<Movie[]>(() => {
    try {
      const saved = localStorage.getItem("cinestream_continue_watching");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Upcoming movies state
  const [upcomingMovies, setUpcomingMovies] = useState<Movie[]>([]);
  const [isUpcomingLoading, setIsUpcomingLoading] = useState<boolean>(false);

  // Trending week carousel hero state
  const [trendingWeekMovies, setTrendingWeekMovies] = useState<Movie[]>([]);
  const [currentSlideIdx, setCurrentSlideIdx] = useState<number>(0);

  // Search results Live Filters - Genre, Year, Rating
  const [searchGenreFilter, setSearchGenreFilter] = useState<string>("All");
  const [searchYearFilter, setSearchYearFilter] = useState<string>("All");
  const [searchRatingFilter, setSearchRatingFilter] = useState<string>("All");

  // Dynamic Live Filter options computed from current searchResults details
  const searchResultGenres = React.useMemo(() => {
    const genres = new Set<string>();
    searchResults.forEach((m) => {
      m.genres.forEach((g) => {
        if (g) genres.add(g);
      });
    });
    return ["All", ...Array.from(genres)];
  }, [searchResults]);

  const searchResultYears = React.useMemo(() => {
    const years = new Set<string>();
    searchResults.forEach((m) => {
      if (m.releaseDate) {
        const y = m.releaseDate.substring(0, 4);
        if (y && y.length === 4) years.add(y);
      }
    });
    return ["All", ...Array.from(years).sort().reverse()];
  }, [searchResults]);

  const ratingFilters = [
    { label: "All Ratings", value: "All" },
    { label: "8.0+ ★", value: "8" },
    { label: "7.0+ ★", value: "7" },
    { label: "6.0+ ★", value: "6" },
  ];

  // Derive filtered search lists
  const filteredSearchResults = React.useMemo(() => {
    return searchResults.filter((movie) => {
      if (searchGenreFilter !== "All" && !movie.genres.some(g => g.toLowerCase() === searchGenreFilter.toLowerCase())) {
        return false;
      }
      if (searchYearFilter !== "All") {
        const year = movie.releaseDate ? movie.releaseDate.substring(0, 4) : "";
        if (year !== searchYearFilter) return false;
      }
      if (searchRatingFilter !== "All") {
        const ratingThreshold = parseFloat(searchRatingFilter);
        if (movie.rating < ratingThreshold) return false;
      }
      if (searchLanguageFilter !== "All") {
        const isEnglish = (movie.originalLanguage || "en") === "en";
        if (searchLanguageFilter === "English" && !isEnglish) return false;
        if (searchLanguageFilter === "Original" && isEnglish) return false;
      }
      return true;
    });
  }, [searchResults, searchGenreFilter, searchYearFilter, searchRatingFilter, searchLanguageFilter]);
  
  const sortedSearchResults = React.useMemo(() => {
    return [...filteredSearchResults].sort((a, b) => {
      switch (sortBy) {
        case "rating":
          return b.rating - a.rating;
        case "releaseDate":
          return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
        case "popularity":
        default:
          return (b.popularity || 0) - (a.popularity || 0);
      }
    });
  }, [filteredSearchResults, sortBy]);

  // Genres deck
  const genresList = ["All", "Action", "Sci-Fi", "Drama", "Fantasy", "Animation", "Thriller", "Bollywood"];

  // 1. Fetch AI credentials & baseline movies on mount
  useEffect(() => {
    // Check config
    fetch("/api/config")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setHasApiKey(data.hasApiKey);
        }
      })
      .catch((err) => console.log("Config verification unavailable. Defaulting to local mode.", err));

    // Load trending catalog
    setIsGenreLoading(true);
    fetch("/api/movies")
      .then((res) => {
        if (!res.ok) throw new Error("Backend query failed");
        return res.json();
      })
      .then((data) => {
        if (data.success && Array.isArray(data.movies) && data.movies.length > 0) {
          setMovies(data.movies);
        } else {
          throw new Error("No payload found on server database");
        }
      })
      .catch((err) => {
        console.warn("Backend catalog unavailable, switching to online TMDB/fallback fetch...", err);
        fetchFromTMDBClient().then((clientMovies) => {
          if (clientMovies.length > 0) {
            // Deduplicate against curatedMovies just in case
            const unique = [...clientMovies];
            setMovies((prev) => {
                const combined = [...unique, ...prev];
                return Array.from(new Map(combined.map(m => [m.id, m])).values());
            });
          } else {
            setMovies(curatedMovies);
          }
        });
      })
      .finally(() => setIsGenreLoading(false));

    // Load Upcoming from TMDB
    setIsUpcomingLoading(true);
    fetchUpcomingFromTMDB()
      .then((upcoming) => {
        if (upcoming && upcoming.length > 0) {
          setUpcomingMovies(upcoming);
        }
      })
      .catch((err) => console.error("Error loading upcoming movies on mount", err))
      .finally(() => setIsUpcomingLoading(false));

    // Load Trending Week spotlight carousel movies
    fetchTrendingWeekFromTMDB()
      .then((tempTrend) => {
        if (tempTrend && tempTrend.length > 0) {
          setTrendingWeekMovies(tempTrend);
        }
      })
      .catch((err) => console.error("Error loading trending week spotlight movies", err));

    // Restore Watchlist
    const savedWatchlist = localStorage.getItem("cinestream_watchlist");
    if (savedWatchlist) {
      try {
        setWatchlist(JSON.parse(savedWatchlist));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // 2. Discover by Category/Genre
  useEffect(() => {
    if (activeTab !== "movies") return;

    setIsGenreLoading(true);
    if (selectedGenre === "All") {
      fetch("/api/movies")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.movies) && data.movies.length > 0) {
            setMovies(data.movies);
          }
        })
        .catch(() => {
        fetchFromTMDBClient().then((clientMovies) => {
          if (clientMovies.length > 0) {
            setMovies(Array.from(new Map(clientMovies.map(m => [m.id, m])).values()));
          } else {
            setMovies(curatedMovies);
          }
        });
        })
        .finally(() => setIsGenreLoading(false));
    } else {
      fetch(`/api/discover?genre=${encodeURIComponent(selectedGenre)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.movies)) {
            setMovies(data.movies);
          }
        })
        .catch(() => {
          // Local offline fallback
          const filtered = curatedMovies.filter((m) =>
            m.genres.some((g) => g.toLowerCase() === selectedGenre.toLowerCase())
          );
          setMovies(filtered);
        })
        .finally(() => setIsGenreLoading(false));
    }
  }, [selectedGenre, activeTab]);

  // Track continue watching items when movie detail modal opens
  useEffect(() => {
    if (selectedMovie) {
      setContinueWatching((prev) => {
        const filtered = prev.filter((m) => m.id !== selectedMovie.id);
        const updated = [selectedMovie, ...filtered].slice(0, 5);
        localStorage.setItem("cinestream_continue_watching", JSON.stringify(updated));
        return updated;
      });
    }
  }, [selectedMovie]);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. 'S' or 's' to focus the search bar
      if (e.key.toLowerCase() === "s") {
        const active = document.activeElement;
        const isInputField = active && (
          active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.hasAttribute("contenteditable")
        );
        if (!isInputField) {
          e.preventDefault();
          const searchInput = document.getElementById("search-input");
          if (searchInput) {
            (searchInput as HTMLInputElement).focus();
          }
        }
      }

      // 2. 'Esc' to close any open modals
      if (e.key === "Escape") {
        setSelectedMovie(null);
        setIsSenseiOpen(false);
      }

      // 3. 'Left/Right' arrow keys to navigate the trending hero carousel
      if (e.key === "ArrowLeft") {
        setTrendingWeekMovies((prevTrend) => {
          if (prevTrend.length > 0) {
            setCurrentSlideIdx((curr) => (curr === 0 ? prevTrend.length - 1 : curr - 1));
          }
          return prevTrend;
        });
      } else if (e.key === "ArrowRight") {
        setTrendingWeekMovies((prevTrend) => {
          if (prevTrend.length > 0) {
            setCurrentSlideIdx((curr) => (curr >= prevTrend.length - 1 ? 0 : curr + 1));
          }
          return prevTrend;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Search trigger from Header
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setSearchGenreFilter("All");
    setSearchYearFilter("All");
    setSearchRatingFilter("All");
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    setActiveTab("movies"); // Auto return to catalog tab to present listings

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      if (data.success && data.movies) {
        // Ensure uniqueness from search API
        const unique = Array.from(new Map(data.movies.map((m: any) => [m.id, m])).values()) as Movie[];
        setSearchResults(unique);
      } else {
        throw new Error();
      }
    } catch {
      // Offline local search fallback
      const q = query.toLowerCase().trim();
      const backupFiltered = curatedMovies.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.overview.toLowerCase().includes(q) ||
          m.genres.some((g) => g.toLowerCase().includes(q))
      );
      setSearchResults(backupFiltered);
    } finally {
      setIsSearching(false);
    }
  };

  // Bookmark controller
  const handleToggleWatchlist = (movieID: number) => {
    let updatedList: number[];
    const allKnownMovies = [
      ...curatedMovies,
      ...movies,
      ...upcomingMovies,
      ...trendingWeekMovies,
      ...searchResults
    ];
    const movie = allKnownMovies.find(m => m.id === movieID);
    const title = movie?.title || "Movie";

    if (watchlist.includes(movieID)) {
      updatedList = watchlist.filter((id) => id !== movieID);
      const updatedFull = watchlistFull.filter(m => m.id !== movieID);
      setWatchlistFull(updatedFull);
      localStorage.setItem("cinestream_watchlist_objects", JSON.stringify(updatedFull));
      
      toast.error(`Removed from Watchlist`, {
        description: `"${title}" has been removed.`,
      });
    } else {
      updatedList = [...watchlist, movieID];
      if (movie) {
        const updatedFull = [...watchlistFull, movie];
        setWatchlistFull(updatedFull);
        localStorage.setItem("cinestream_watchlist_objects", JSON.stringify(updatedFull));
      }
      
      toast.success(`Saved to Watchlist`, {
        description: `"${title}" is now in your collection.`,
      });
    }
    setWatchlist(updatedList);
    localStorage.setItem("cinestream_watchlist", JSON.stringify(updatedList));
  };

  const handleToggleNotification = (movieID: number) => {
    let updatedList: number[];
    const allKnownMovies = [
      ...curatedMovies,
      ...movies,
      ...upcomingMovies,
      ...trendingWeekMovies,
      ...searchResults
    ];
    const movie = allKnownMovies.find(m => m.id === movieID);
    const title = movie?.title || "Movie";

    if (notifications.includes(movieID)) {
      updatedList = notifications.filter((id) => id !== movieID);
      toast.error("Alert Disabled", {
        description: `Notifications for "${title}" turned off.`,
      });
    } else {
      updatedList = [...notifications, movieID];
      toast.success("Alert Enabled", {
        description: `We'll notify you when "${title}" becomes available.`,
      });
    }
    setNotifications(updatedList);
    localStorage.setItem("cinestream_notifications", JSON.stringify(updatedList));
  };

  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie);
  };

  // Generic deduplication helper for robust multi-source lists
  const dedupeMovies = (movieList: Movie[]) => {
    return Array.from(new Map(movieList.map(m => [m.id, m])).values());
  };

  // Saved books list matching objects
  // Use the persistent watchlistFull for non-curated movies, and fall back to scanning lists for notifications
  const allCurrentMovies = [
    ...curatedMovies,
    ...movies,
    ...upcomingMovies,
    ...trendingWeekMovies,
    ...searchResults,
    ...watchlistFull
  ];
  
  // Ensure we have unique movies by ID for the watchlist display
  const uniqueMoviesCatalog = Array.from(new Map(allCurrentMovies.map(m => [m.id, m])).values());

  const savedWatchlistMovies = uniqueMoviesCatalog.filter((m) => watchlist.includes(m.id));
  const notifiedMovies = uniqueMoviesCatalog.filter((m) => notifications.includes(m.id));

  // Handle Home Click Reset
  const handleResetCatalog = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchGenreFilter("All");
    setSearchYearFilter("All");
    setSearchRatingFilter("All");
    setSelectedGenre("All");
    setActiveTab("movies");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col selection:bg-[#ff4e00] selection:text-white relative pb-10">
      
      {/* Absolute Ambient Background Glow Decor */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#ff4e00]/5 to-transparent pointer-events-none z-0" />

      {/* Persistent Sticky Top Header */}
      <Header
        onSearch={handleSearch}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasApiKey={hasApiKey}
        watchlistCount={watchlist.length}
        selectedGenre={selectedGenre}
        onBackToHome={handleResetCatalog}
      />

      {/* Main Container View Deck - Edge-to-edge spacing configuration */}
      <main className="flex-1 w-full px-2 sm:px-6 md:px-8 py-4 relative z-10">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: CINEMATIC CATALOG */}
          {activeTab === "movies" && (
            <motion.div
              key="movies-catalogue-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {searchQuery ? (
                // Search result space grid with Live Filters
                <div className="space-y-6">
                  {!isSearching && searchResults.length > 0 && (
                    <div className="bg-[#111111]/60 border border-white/5 rounded-2xl p-5 mb-2 backdrop-blur-xl animate-fade-in">
                      <div className="flex items-center gap-2 mb-4 border-b border-white/5 pb-3">
                        <span className="p-1.5 rounded bg-[#ff4e00]/20 text-[#ff4e00]">
                          <Sparkles className="h-4 w-4" />
                        </span>
                        <h3 className="font-display text-xs font-bold tracking-wider uppercase text-zinc-200">
                          Live Filter Search Results
                        </h3>
                        <div className="ml-auto font-mono text-[10px] text-zinc-500">
                          Matched: <span className="text-white font-bold">{filteredSearchResults.length}</span> of {searchResults.length} titles
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Genre Filter Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="w-16 shrink-0 font-mono text-[9px] text-[#ff4e00]/80 font-bold uppercase tracking-wider">Genre</span>
                          <div className="flex flex-wrap gap-1.5">
                            {searchResultGenres.map((gen) => (
                              <button
                                key={gen}
                                type="button"
                                onClick={() => setSearchGenreFilter(gen)}
                                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                                  searchGenreFilter.toLowerCase() === gen.toLowerCase()
                                    ? "bg-[#ff4e00] text-white shadow-md shadow-[#ff4e00]/25 font-bold scale-[1.03]"
                                    : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-white/5"
                                }`}
                              >
                                {gen}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Year Filter Row */}
                        {searchResultYears.length > 1 && (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <span className="w-16 shrink-0 font-mono text-[9px] text-[#ff4e00]/80 font-bold uppercase tracking-wider">Year</span>
                            <div className="flex flex-wrap gap-1.5">
                              {searchResultYears.map((yr) => (
                                <button
                                  key={yr}
                                  type="button"
                                  onClick={() => setSearchYearFilter(yr)}
                                  className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                                    searchYearFilter === yr
                                      ? "bg-[#ff4e00] text-white shadow-md shadow-[#ff4e00]/25 font-bold scale-[1.03]"
                                      : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-white/5"
                                  }`}
                                >
                                  {yr}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Rating Filter Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="w-16 shrink-0 font-mono text-[9px] text-[#ff4e00]/80 font-bold uppercase tracking-wider">Rating</span>
                          <div className="flex flex-wrap gap-1.5">
                            {ratingFilters.map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setSearchRatingFilter(opt.value)}
                                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                                  searchRatingFilter === opt.value
                                    ? "bg-[#ff4e00] text-white shadow-md shadow-[#ff4e00]/25 font-bold scale-[1.03]"
                                    : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-white/5"
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Language Filter Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <span className="w-16 shrink-0 font-mono text-[9px] text-[#ff4e00]/80 font-bold uppercase tracking-wider">Language</span>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              { label: "All Languages", value: "All" },
                              { label: "English Dub/Orig", value: "English" },
                              { label: "Original Multi-Lang", value: "Original" }
                            ].map((opt) => (
                              <button
                                key={opt.value}
                                type="button"
                                onClick={() => setSearchLanguageFilter(opt.value)}
                                className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-all cursor-pointer ${
                                  searchLanguageFilter === opt.value
                                    ? "bg-[#ff4e00] text-white shadow-md shadow-[#ff4e00]/25 font-bold scale-[1.03]"
                                    : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-white/5"
                                }`}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <MovieGrid
                    movies={sortedSearchResults}
                    title={
                      searchGenreFilter !== "All" || searchYearFilter !== "All" || searchRatingFilter !== "All"
                        ? `Filtered Search Results for "${searchQuery}"`
                        : `All Search Results for "${searchQuery}"`
                    }
                    onSelectMovie={handleSelectMovie}
                    onToggleWatchlist={handleToggleWatchlist}
                    watchlist={watchlist}
                    selectedGenre="All"
                    isLoading={isSearching}
                    sortBy={sortBy}
                    onSortByChange={setSortBy}
                  />
                </div>
              ) : (
                <>
                  {/* TMDB WEEKLY TRENDING SPOTLIGHT HERO CAROUSEL */}
                  {trendingWeekMovies.length > 0 && (
                    <div className="relative mb-8 rounded-3xl overflow-hidden aspect-[21/9] md:aspect-[24/10] w-full bg-black border border-white/5 shadow-2xl group">
                      {/* Backdrop Images with Crossfades */}
                      <div className="absolute inset-0 z-0">
                        {trendingWeekMovies[currentSlideIdx].backdropUrl === "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" ? (
                          <div className="absolute inset-0 flex items-center justify-center bg-[#050505]">
                            <div className="absolute inset-0 opacity-10 bg-gradient-to-tr from-[#ff4e00] to-transparent"></div>
                            <div className="flex flex-col items-center opacity-40">
                              <Lock className="h-20 w-20 text-[#ff4e00] animate-pulse" />
                              <span className="font-mono mt-4 font-black tracking-[0.3em] uppercase text-[#ff4e00]">Classified Source</span>
                            </div>
                          </div>
                        ) : (
                          <img
                            src={trendingWeekMovies[currentSlideIdx].backdropUrl}
                            alt={trendingWeekMovies[currentSlideIdx].title}
                            className="w-full h-full object-cover object-top opacity-50 transition-all duration-1000 scale-[1.02] group-hover:scale-[1.05]"
                          />
                        )}
                        {/* Dark Vignettes Layer */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/20 to-transparent" />
                      </div>

                      {/* Left & Right Nav Targets */}
                      <button
                        onClick={() => setCurrentSlideIdx((prev) => (prev === 0 ? trendingWeekMovies.length - 1 : prev - 1))}
                        type="button"
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/40 border border-white/10 hover:bg-black/80 text-white/70 hover:text-white transition-all hover:scale-110 active:scale-95 cursor-pointer backdrop-blur"
                      >
                        ←
                      </button>
                      <button
                        onClick={() => setCurrentSlideIdx((prev) => (prev === trendingWeekMovies.length - 1 ? 0 : prev + 1))}
                        type="button"
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/40 border border-white/10 hover:bg-black/80 text-white/70 hover:text-white transition-all hover:scale-110 active:scale-95 cursor-pointer backdrop-blur"
                      >
                        →
                      </button>

                      {/* Spotlight Info Card */}
                      <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 z-10 max-w-3xl space-y-3.5 text-left">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[9px] bg-[#ff4e00]/20 border border-[#ff4e00]/40 text-[#ff4e00] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                            <Sparkles className="h-3 w-3 animate-spin" /> TRENDING THIS WEEK
                          </span>
                          {trendingWeekMovies[currentSlideIdx].genres.map((g) => (
                            <span key={g} className="font-mono text-[9px] bg-white/5 border border-white/10 text-zinc-300 font-semibold uppercase tracking-wider px-2 py-0.5 rounded">
                              {g}
                            </span>
                          ))}
                        </div>

                        <h2 className="font-display font-black text-2xl sm:text-4xl md:text-5xl text-white tracking-tight leading-none drop-shadow-lg">
                          {trendingWeekMovies[currentSlideIdx].title}
                        </h2>

                        <p className="text-zinc-300 text-xs sm:text-sm line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-2xl font-sans drop-shadow">
                          {trendingWeekMovies[currentSlideIdx].overview}
                        </p>

                        <div className="flex items-center gap-3 pt-2">
                          <button
                            onClick={() => handleSelectMovie(trendingWeekMovies[currentSlideIdx])}
                            className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                              !isPlayable(trendingWeekMovies[currentSlideIdx].releaseDate)
                                ? "bg-[#ff4e00]/20 text-[#ff4e00] border border-[#ff4e00]/50 hover:bg-[#ff4e00]/30 shadow-[#ff4e00]/10"
                                : "bg-[#ff4e00] text-white hover:bg-[#ff4e00]/90 shadow-[#ff4e00]/20"
                            }`}
                          >
                            {!isPlayable(trendingWeekMovies[currentSlideIdx].releaseDate) ? (
                              <>
                                <Clock className="h-4 w-4 shrink-0" /> Coming Soon: {new Date(trendingWeekMovies[currentSlideIdx].releaseDate as string).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                              </>
                            ) : (
                              <>
                                <Play className="h-4 w-4 fill-current shrink-0" /> Play Trailer & Intel
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleToggleWatchlist(trendingWeekMovies[currentSlideIdx].id)}
                            className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all cursor-pointer shadow ${
                              watchlist.includes(trendingWeekMovies[currentSlideIdx].id)
                                ? "bg-white/10 text-[#ff4e00] border-[#ff4e00]/50"
                                : "bg-[#0b0b0b]/60 border-white/10 hover:border-white/30 text-zinc-300 hover:text-white hover:bg-black/80"
                            }`}
                          >
                            {watchlist.includes(trendingWeekMovies[currentSlideIdx].id) ? "✓ Added To List" : "+ Add to List"}
                          </button>
                        </div>
                      </div>

                      {/* Dot Progress Indicator Indicators */}
                      <div className="absolute bottom-4 right-6 flex items-center gap-1.5 z-20">
                        {trendingWeekMovies.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCurrentSlideIdx(idx)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              currentSlideIdx === idx ? "w-6 bg-[#ff4e00]" : "w-1.5 bg-white/20 hover:bg-white/40"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Continue Watching section */}
                  {continueWatching.length > 0 && (
                    <div className="mb-10 animate-fade-in relative z-10 px-1 sm:px-2">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="p-1.5 rounded-lg bg-[#ff4e00]/15 text-[#ff4e00]">
                          <Clock className="h-4 w-4" />
                        </span>
                        <div>
                          <h2 className="font-display font-black text-lg text-white tracking-tight">
                            Continue Watching
                          </h2>
                          <p className="text-[11px] text-zinc-500 font-sans">
                            Pick up right where you left off on these recently viewed titles.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                        {continueWatching.map((movie) => (
                          <div
                            key={movie.id}
                            onClick={() => handleSelectMovie(movie)}
                            className="group relative flex flex-col overflow-hidden rounded-xl bg-[#111111]/40 border border-white/5 hover:border-[#ff4e00]/50 shadow-md transition-all duration-300 cursor-pointer"
                          >
                            <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#121212]">
                              <img
                                src={movie.backdropUrl || movie.posterUrl}
                                alt={movie.title}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-80 animate-fade-in" />
                              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                                {!isPlayable(movie.releaseDate) ? (
                                  <div className="rounded-xl bg-[#ff4e00]/95 px-2.5 py-1 text-white shadow-xl shadow-[#ff4e00]/40 text-center backdrop-blur-xs transform scale-75 group-hover:scale-100 transition-transform">
                                    <span className="block text-[8px] font-mono font-black uppercase tracking-widest text-[#ff4e00] bg-black/40 px-1 py-[1px] rounded mb-0.5">Soon</span>
                                    <span className="block text-[10px] font-bold leading-tight">
                                      {new Date(movie.releaseDate as string).toLocaleDateString(undefined, { month: 'short', year: '2-digit' })}
                                    </span>
                                  </div>
                                ) : (
                                  <div className="rounded-full bg-[#ff4e00]/95 p-2.5 text-white shadow-xl shadow-[#ff4e00]/40 backdrop-blur-xs transform scale-75 group-hover:scale-100 transition-transform">
                                    <Play className="h-4 w-4 fill-white" />
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="p-2.5 flex flex-col justify-between flex-1">
                              <h3 className="line-clamp-1 font-sans text-xs font-semibold text-zinc-200 group-hover:text-[#ff4e00] transition-colors">
                                {movie.title}
                              </h3>
                              <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                                {movie.genres[0]} • {movie.type.toUpperCase()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Default full category discover */}
                  {selectedGenre === "All" ? (
                    <div className="flex flex-col relative z-10 w-full overflow-hidden pb-12">
                      <div className="mb-6 flex flex-wrap gap-2 justify-center py-2 border-b border-white/5 pb-4 mt-2">
                        {genresList.map((genre) => {
                          const getGenreIcon = (g: string) => {
                            const normalized = g.toLowerCase();
                            switch (normalized) {
                              case "action": return <Flame className="h-3.5 w-3.5 text-orange-400" />;
                              case "sci-fi": return <Rocket className="h-3.5 w-3.5 text-blue-400" />;
                              case "drama": return <Theater className="h-3.5 w-3.5 text-pink-400" />;
                              case "fantasy": return <Sparkles className="h-3.5 w-3.5 text-purple-400" />;
                              case "animation": return <Palette className="h-3.5 w-3.5 text-yellow-400" />;
                              case "thriller": return <Skull className="h-3.5 w-3.5 text-red-500" />;
                              case "bollywood": return <Music className="h-3.5 w-3.5 text-[#ff4e00]" />;
                              default: return <Grid className="h-3.5 w-3.5 text-zinc-400" />;
                            }
                          };
                          return (
                            <button
                              key={genre}
                              onClick={() => setSelectedGenre(genre)}
                              className={`rounded-full px-4.5 py-2 text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer flex items-center gap-1.5 ${
                                selectedGenre.toLowerCase() === genre.toLowerCase()
                                  ? "bg-[#ff4e00] text-white shadow-lg shadow-[#ff4e00]/30 font-bold scale-[1.02]"
                                  : "bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white border border-white/5"
                              }`}
                            >
                              {getGenreIcon(genre)}
                              <span>{genre}</span>
                            </button>
                          );
                        })}
                      </div>
                      
                      <div className="space-y-6">
                        <MovieRow
                          movies={dedupeMovies(trendingWeekMovies)}
                          title="Trending Now"
                          onSelectMovie={handleSelectMovie}
                          onToggleWatchlist={handleToggleWatchlist}
                          watchlist={watchlist}
                        />

                        {/* Bollywood row improved with state movies merge and dedupe */}
                        <MovieRow
                          movies={dedupeMovies([
                            ...curatedMovies.filter(m => m.originalLanguage === "hi" || m.genres.includes("Bollywood")),
                            ...movies.filter(m => m.originalLanguage === "hi" || m.genres.includes("Bollywood"))
                          ])}
                          title="Bollywood Hits"
                          onSelectMovie={handleSelectMovie}
                          onToggleWatchlist={handleToggleWatchlist}
                          watchlist={watchlist}
                        />

                        <MovieRow
                          movies={dedupeMovies([...movies].sort((a, b) => b.rating - a.rating).slice(0, 10))}
                          title="Top 10 Today"
                          onSelectMovie={handleSelectMovie}
                          onToggleWatchlist={handleToggleWatchlist}
                          watchlist={watchlist}
                        />
                        
                        <MovieRow
                          movies={dedupeMovies(movies.filter(m => m.genres.some(g => g === "Action" || g === "Sci-Fi" || g === "Adventure")))}
                          title="Action & Adventure"
                          onSelectMovie={handleSelectMovie}
                          onToggleWatchlist={handleToggleWatchlist}
                          watchlist={watchlist}
                        />

                        <MovieRow
                          movies={dedupeMovies(movies.filter(m => m.genres.some(g => g === "Animation" || g === "Family" || g === "Comedy")))}
                          title="Comedy & Animation"
                          onSelectMovie={handleSelectMovie}
                          onToggleWatchlist={handleToggleWatchlist}
                          watchlist={watchlist}
                        />

                        <MovieRow
                          movies={dedupeMovies(movies.filter(m => m.genres.some(g => g === "Thriller" || g === "Crime" || g === "Horror")))}
                          title="Dark & Thrilling"
                          onSelectMovie={handleSelectMovie}
                          onToggleWatchlist={handleToggleWatchlist}
                          watchlist={watchlist}
                        />

                        <MovieRow
                          movies={dedupeMovies(movies.filter(m => m.genres.some(g => g === "Drama" || g === "Romance")))}
                          title="Drama & Romance"
                          onSelectMovie={handleSelectMovie}
                          onToggleWatchlist={handleToggleWatchlist}
                          watchlist={watchlist}
                        />
                      </div>
                    </div>
                  ) : (
                    <MovieGrid
                      movies={sortedMovies}
                      title={`${selectedGenre} Masterpieces`}
                      onSelectMovie={handleSelectMovie}
                      onToggleWatchlist={handleToggleWatchlist}
                      watchlist={watchlist}
                      selectedGenre={selectedGenre}
                      onGenreSelect={setSelectedGenre}
                      genresList={genresList}
                      isLoading={isGenreLoading}
                      sortBy={sortBy}
                      onSortByChange={setSortBy}
                    />
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* TAB 2: AI CONSULTATIONS (MOOD MATCHER) */}
          {activeTab === "mood" && (
            <motion.div
              key="mood-recommendations-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <MoodRecommender
                onSelectMovie={handleSelectMovie}
                onToggleWatchlist={handleToggleWatchlist}
                watchlist={watchlist}
                genresList={genresList}
              />
            </motion.div>
          )}

          {/* TAB 3: USER SAVED BOOKMARKS LIST */}
          {activeTab === "watchlist" && (
            <motion.div
              key="watchlist-bookmarks-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-12"
            >
              {notifiedMovies.length > 0 && (
                <MovieGrid
                  movies={notifiedMovies}
                  title="🔔 Saved Notifications for Upcoming Releases"
                  onSelectMovie={handleSelectMovie}
                  onToggleWatchlist={handleToggleWatchlist}
                  watchlist={watchlist}
                  selectedGenre="All"
                />
              )}

              {savedWatchlistMovies.length === 0 && notifiedMovies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center gap-6 bg-[#0a0a0a]/50 backdrop-blur rounded-2xl border border-white/5 border-dashed p-6 w-full max-w-2xl mx-auto mt-8 animate-fade-in relative overflow-hidden">
                  <div className="relative w-full max-w-sm aspect-[16/9] rounded-xl overflow-hidden border border-white/10 shadow-2xl shadow-black/80 group">
                    <img src={emptyStateImage} alt="Empty Notifications & Watchlist" className="h-full w-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500 scale-102" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent"></div>
                  </div>
                  <div className="relative z-10 -mt-8">
                    <h4 className="font-display text-2xl font-black text-white tracking-tight drop-shadow-md">No Intel Gathered</h4>
                    <p className="text-sm text-zinc-500 max-w-md mt-2 mx-auto leading-relaxed">
                      Your watchlist and notifications core are empty. Track upcoming classified releases or bookmark standard catalog items to fill this sector.
                    </p>
                  </div>
                  <button
                    onClick={handleResetCatalog}
                    className="mt-2 text-xs font-bold uppercase tracking-widest px-6 py-3 bg-[#ff4e00]/20 border border-[#ff4e00]/40 hover:bg-[#ff4e00]/30 rounded-xl text-[#ff4e00] hover:text-white transition-all cursor-pointer shadow-lg shadow-[#ff4e00]/10 flex items-center justify-center gap-2"
                  >
                    Initiate Main Catalog Scan
                  </button>
                </div>
              ) : savedWatchlistMovies.length > 0 ? (
                <MovieGrid
                  movies={savedWatchlistMovies}
                  title="My Curated Bookmarks"
                  onSelectMovie={handleSelectMovie}
                  onToggleWatchlist={handleToggleWatchlist}
                  watchlist={watchlist}
                  selectedGenre="All"
                />
              ) : null}
            </motion.div>
          )}

          {/* TAB 4: UPCOMING RELEASES */}
          {activeTab === "upcoming" && (
            <motion.div
              key="upcoming-releases-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <MovieGrid
                movies={upcomingMovies}
                title="🔥 Upcoming Theater Catalog Releases"
                onSelectMovie={handleSelectMovie}
                onToggleWatchlist={handleToggleWatchlist}
                watchlist={watchlist}
                selectedGenre="All"
                isLoading={isUpcomingLoading}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Pristine Minimal Footer */}
      <footer className="w-full py-10 text-center text-zinc-600 text-[10px] font-mono select-none px-4 max-w-7xl mx-auto border-t border-white/5 mt-12">
        <p>© 2026 CINESTREAM atmosphere pro. All rights reserved.</p>
        <p className="mt-1 text-zinc-700">Powered by high-precision server-side Google Gemini models and TMDB directory indexing.</p>
      </footer>

      {/* Floating Cinema Sensei Panel Toggle Trigger */}
      <button
        onClick={() => setIsSenseiOpen(!isSenseiOpen)}
        className="fixed bottom-6 right-6 z-40 rounded-full bg-[#ff4e00] p-4 text-white hover:bg-[#ff4e00]/90 shadow-2xl shadow-[#ff4e00]/30 border border-white/10 flex items-center justify-center cursor-pointer transition-transform duration-300 hover:scale-105 active:scale-95"
        id="trigger-sensei-chat"
        title="Chat with Cinema Sensei"
      >
        {isSenseiOpen ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5 fill-current" />}
      </button>

      {/* CineStream Sensei Overlay Panel */}
      <AnimatePresence>
        {isSenseiOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 right-6 z-45 max-w-xs w-[90%] shadow-2xl shadow-black/80"
          >
            <CinemaSensei
              currentMovie={selectedMovie}
              onClose={() => setIsSenseiOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cinematic Detail Player modal overlay pop */}
      <AnimatePresence>
        {selectedMovie && (
          <MovieDetailModal
            movie={selectedMovie}
            onClose={() => setSelectedMovie(null)}
            onToggleWatchlist={handleToggleWatchlist}
            isBookmarked={watchlist.includes(selectedMovie.id)}
            onToggleNotification={handleToggleNotification}
            isNotified={notifications.includes(selectedMovie.id)}
          />
        )}
      </AnimatePresence>

      <Toaster position="top-center" expand={false} richColors />
    </div>
  );
}
