import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { curatedMovies } from "./src/data/curatedMovies.ts";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Gemini API client initialized successfully.");
  } catch (err) {
    console.error("Failed to initialize Gemini API client:", err);
  }
} else {
  console.log("No valid GEMINI_API_KEY. Using mock/fallback modes for AI features.");
}

// Custom Movie JSON schema for Gemini responseSchema
const MovieSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.INTEGER, description: "A simulated movie/TV TMDB ID (e.g. between 1000 and 999999)" },
    title: { type: Type.STRING, description: "The official movie or TV show title" },
    type: { type: Type.STRING, description: "'movie' or 'tv'" },
    overview: { type: Type.STRING, description: "A rich, engaging plot description" },
    rating: { type: Type.NUMBER, description: "Average rating score out of 10 (e.g. 8.1)" },
    releaseDate: { type: Type.STRING, description: "Release date format YYYY-MM-DD" },
    posterUrl: { type: Type.STRING, description: "Image link from TMDB, or fallback Unsplash movie image URL" },
    backdropUrl: { type: Type.STRING, description: "Backdrop image link from TMDB, or fallback Unsplash cinematography image" },
    genres: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of genres (e.g. Sci-Fi, Adventure, Drama, Action, Comedy, Crime)"
    },
    trailerUrl: { type: Type.STRING, description: "A valid YouTube watch/embed url or empty string" },
    duration: { type: Type.STRING, description: "E.g. '2h 15m' or '3 Seasons'" },
    cast: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of top 3-4 cast members"
    }
  },
  required: ["id", "title", "type", "overview", "rating", "releaseDate", "genres", "duration", "cast"]
};

const MovieListSchema = {
  type: Type.ARRAY,
  items: MovieSchema,
  description: "A collection of movies or TV shows matching the criteria"
};

// 1. GET SERVER CONFIGURATION STATUS
app.get("/api/config", (req, res) => {
  res.json({ success: true, hasApiKey: !!ai });
});

// TMDB Configuration & Genre mapping Dictionary
const TMDB_API_KEY_ENV = process.env.TMDB_API_KEY;
console.log(`DEBUG: process.env.TMDB_API_KEY is ${TMDB_API_KEY_ENV ? 'defined' : 'undefined'}`);
const TMDB_API_KEY = TMDB_API_KEY_ENV || "1d84ab491afb8deec137b04c9f397a39";
if (!TMDB_API_KEY) {
  console.error("CRITICAL: TMDB_API_KEY is not defined in environment variables.");
}

const GENRE_MAP: { [key: number]: string } = {
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

// 1. GET ALL CURATED DYNAMIC TMDB MOVIES
app.get("/api/movies", async (req, res) => {
  try {
    // Fetch Trending Week movies and TV from TMDB
    const trendingUrl = `https://api.themoviedb.org/3/trending/all/week?api_key=${TMDB_API_KEY}`;
    console.log(`Fetching TMDB trending weekly movies from: ${trendingUrl}`);
    
    const trendingRes = await fetch(trendingUrl);
    if (!trendingRes.ok) {
      const errorText = await trendingRes.text();
      console.error(`TMDB trending weekly failed with status: ${trendingRes.status}, body: ${errorText}`);
      throw new Error(`TMDB trending weekly failed with status: ${trendingRes.status}`);
    }
    
    const trendingData: any = await trendingRes.json();
    const list = (trendingData.results || []).slice(0, 20).map((item: any) => {
      const isTv = item.media_type === "tv" || !item.release_date;
      const title = item.title || item.name || item.original_title || item.original_name;
      const releaseDate = item.release_date || item.first_air_date || "2024-01-01";
      
      const posterUrl = item.poster_path 
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
        : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
        
      const backdropUrl = item.backdrop_path 
        ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` 
        : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
        
      const genres = (item.genre_ids || [])
        .map((gid: number) => GENRE_MAP[gid])
        .filter((g: any) => !!g);

      return {
        id: item.id,
        title,
        type: isTv ? "tv" : "movie",
        overview: item.overview || "Plot summary not available.",
        rating: item.vote_average || 7.0,
        releaseDate,
        posterUrl,
        backdropUrl,
        genres: genres.length > 0 ? genres : ["Drama"],
        trailerUrl: `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(title + " official trailer")}`,
        duration: isTv ? "Season 1" : "2h",
        cast: ["Featured Cast"],
        trending: true,
        originalLanguage: item.original_language || "en"
      };
    });
    
    // Add popular and top_rated items to diversify the collection (so the filter genres are rich!)
    try {
      const popularUrl = `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}`;
      const popularRes = await fetch(popularUrl);
      if (popularRes.ok) {
        const popularData: any = await popularRes.json();
        const popularItems = (popularData.results || []).slice(0, 10).map((item: any) => {
          const title = item.title || item.original_title;
          const genres = (item.genre_ids || []).map((gid: number) => GENRE_MAP[gid]).filter((g: any) => !!g);
          return {
            id: item.id,
            title,
            type: "movie" as const,
            overview: item.overview || "Plot summary not available.",
            rating: item.vote_average || 7.0,
            releaseDate: item.release_date || "2024-01-01",
            posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
            backdropUrl: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
            genres: genres.length > 0 ? genres : ["Drama"],
            trailerUrl: `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(title + " official trailer")}`,
            duration: "2h",
            cast: ["Featured Cast"],
            popular: true,
            originalLanguage: item.original_language || "en"
          };
        });
        
        for (const pi of popularItems) {
          if (!list.some((li: any) => li.id === pi.id)) {
            list.push(pi);
          }
        }
      }
    } catch (e) {
      console.error("Non-blocking failure fetching additional popular movies from TMDB:", e);
    }
    
    return res.json({ success: true, movies: list });
  } catch (err) {
    console.error("Failed to load TMDB trending movies, falling back to local curated lists:", err);
    return res.json({ success: true, movies: curatedMovies });
  }
});

// Simple hashCode helper for stable numeric movie IDs in fallback paths
function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

// 2. SEARCH MOVIES (TMDB live Multi-Search)
app.post("/api/search", async (req, res) => {
  const { query } = req.body;
  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  const normalizedQuery = query.toLowerCase().trim();

  try {
    const url = `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(normalizedQuery)}`;
    console.log(`Searching TMDB multi-search database: ${url}`);
    
    const response = await fetch(url);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`TMDB search failed with status: ${response.status}, body: ${errorText}`);
      throw new Error(`TMDB search returned status ${response.status}`);
    }
    
    const data: any = await response.json();
    console.log(`DEBUG: TMDB search raw data:`, JSON.stringify(data));
    if (!data || !Array.isArray(data.results)) {
      return res.json({ success: true, movies: [], source: "tmdb" });
    }
    
    const results = data.results
      .filter((item: any) => item.media_type === "movie" || item.media_type === "tv")
      .map((item: any) => {
        const isTv = item.media_type === "tv" || !item.release_date;
        const title = item.title || item.name || item.original_title || item.original_name;
        const releaseDate = item.release_date || item.first_air_date || "2024-01-01";
        
        const posterUrl = item.poster_path 
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
          : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
          
        const backdropUrl = item.backdrop_path 
          ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` 
          : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
          
        const genres = (item.genre_ids || [])
          .map((gid: number) => GENRE_MAP[gid])
          .filter((g: any) => !!g);

        return {
          id: item.id,
          title,
          type: isTv ? "tv" : "movie",
          overview: item.overview || "Plot summary is not available for this title.",
          rating: item.vote_average || 7.0,
          releaseDate,
          posterUrl,
          backdropUrl,
          genres: genres.length > 0 ? genres : ["Drama"],
          trailerUrl: `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(title + " official trailer")}`,
          duration: isTv ? "Season 1" : "2h",
          cast: ["Featured Cast"],
          originalLanguage: item.original_language || "en"
        };
      });
      
    // Deduplicate results to prevent key errors
    const uniqueResults = Array.from(new Map(results.map((m: any) => [m.id, m])).values());

    return res.json({ success: true, movies: uniqueResults, source: "tmdb_search" });

  } catch (err) {
    console.error("TMDB multi search failed, falling back to local mock keywords", err);
    
    // Simple local search fallback
    const localResults = curatedMovies.filter(
      (m) =>
        m.title.toLowerCase().includes(normalizedQuery) ||
        m.overview.toLowerCase().includes(normalizedQuery) ||
        m.genres.some((g) => g.toLowerCase().includes(normalizedQuery))
    );
    return res.json({ success: true, movies: localResults, source: "fallback_local" });
  }
});

// NEW 2C. DYNAMIC DISCOVER BY GENRE (TMDB discover/movie)
const GENRE_NAME_TO_ID: { [key: string]: number } = {
  "action": 28,
  "adventure": 12,
  "animation": 16,
  "comedy": 35,
  "crime": 80,
  "documentary": 99,
  "drama": 18,
  "family": 10751,
  "fantasy": 14,
  "history": 36,
  "horror": 27,
  "music": 10402,
  "mystery": 9648,
  "romance": 10749,
  "sci-fi": 878,
  "thriller": 53,
  "war": 10752,
  "western": 37
};

app.get("/api/discover", async (req, res) => {
  const { genre, genreId } = req.query;
  
  let targetGenreId: number | null = null;
  
  if (genreId) {
    targetGenreId = parseInt(genreId as string, 10);
  } else if (genre) {
    const normGenre = (genre as string).toLowerCase().trim();
    if (normGenre === "bollywood") {
      // Special handle for Bollywood: Hindi language movies
      try {
        const bollywoodUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_original_language=hi&sort_by=popularity.desc&page=1`;
        console.log(`Discovering Bollywood (Hindi) movies via TMDB: ${bollywoodUrl}`);
        
        const response = await fetch(bollywoodUrl);
        const data: any = await response.json();
        const results = (data.results || []).map((item: any) => {
          const title = item.title || item.original_title || "Unknown Title";
          const genres = (item.genre_ids || []).map((gid: number) => GENRE_MAP[gid]).filter((g: any) => !!g);
          if (!genres.includes("Bollywood")) genres.unshift("Bollywood");
          
          return {
            id: item.id,
            title,
            type: "movie" as const,
            overview: item.overview || "Plot summary not available.",
            rating: item.vote_average || 7.0,
            releaseDate: item.release_date || "2024-01-01",
            posterUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
            backdropUrl: item.backdrop_path ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
            genres,
            trailerUrl: `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(title + " official trailer")}`,
            duration: "2h 30m",
            cast: ["Bollywood Stars"],
            originalLanguage: "hi"
          };
        });
        return res.json({ success: true, movies: results, source: "tmdb_bollywood" });
      } catch (err) {
        console.error("Bollywood discovery failed:", err);
        return res.json({ success: true, movies: curatedMovies.filter(m => m.genres.includes("Bollywood") || m.originalLanguage === "hi"), source: "fallback_local" });
      }
    }
    targetGenreId = GENRE_NAME_TO_ID[normGenre] || null;
  }
  
  if (!targetGenreId) {
    return res.status(400).json({ error: "A valid genre or genreId is required. E.g., /api/discover?genre=Action" });
  }
  
  try {
    const discoverUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${targetGenreId}&sort_by=popularity.desc&page=1`;
    console.log(`Discovering movies via TMDB: ${discoverUrl}`);
    
    const response = await fetch(discoverUrl);
    if (!response.ok) {
      throw new Error(`TMDB discover returned status ${response.status}`);
    }
    
    const data: any = await response.json();
    if (!data || !Array.isArray(data.results)) {
      return res.json({ success: true, movies: [], source: "tmdb_discover" });
    }
    
    const results = data.results.map((item: any) => {
      const title = item.title || item.original_title || "Unknown Title";
      const genres = (item.genre_ids || []).map((gid: number) => GENRE_MAP[gid]).filter((g: any) => !!g);
      
      const posterUrl = item.poster_path 
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
        : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
        
      const backdropUrl = item.backdrop_path 
        ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` 
        : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

      return {
        id: item.id,
        title,
        type: "movie" as const,
        overview: item.overview || "Plot summary not available.",
        rating: item.vote_average || 7.0,
        releaseDate: item.release_date || "2024-01-01",
        posterUrl,
        backdropUrl,
        genres: genres.length > 0 ? genres : [(genre as string) || "Drama"],
        trailerUrl: `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(title + " official trailer")}`,
        duration: "2h",
        cast: ["Featured Cast"],
        originalLanguage: item.original_language || "en"
      };
    });
    
    return res.json({ success: true, movies: results, source: "tmdb_discover" });
  } catch (err) {
    console.error("TMDB discover/movie endpoint failed:", err);
    // Fallback to locally matching movies
    const reqGenre = genre ? (genre as string).toLowerCase().trim() : "";
    const localResults = curatedMovies.filter((m) => 
      m.genres.some((g) => g.toLowerCase() === reqGenre)
    );
    return res.json({ success: true, movies: localResults, source: "fallback_local" });
  }
});

// NEW 2B. DETAILED ON-DEMAND TMDB API PROXY WITH CREDITS, EXTERNAL_IDS, VIDEOS, SIMILAR, KEYWORDS, IMAGES
app.get("/api/details", async (req, res) => {
  const { id, type } = req.query;
  if (!id || !type) {
    return res.status(400).json({ error: "id and type query parameters are required" });
  }
  
  try {
    const apiType = type === "tv" ? "tv" : "movie";
    const url = `https://api.themoviedb.org/3/${apiType}/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,external_ids,videos,similar,keywords,images&include_image_language=en,null`;
    
    console.log(`Fetching highly detailed info from TMDB: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ success: false, error: `TMDB returned status ${response.status}` });
    }
    
    const data: any = await response.json();
    
    // Parse TMDB detail format
    const cast = data.credits?.cast?.slice(0, 10).map((c: any) => c.name) || ["Featured Stars"];
    const imdbId = data.external_ids?.imdb_id || null;
    
    // Extract real YouTube trailer if exists
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
    
    // Calculate rich runtimes
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

    const fullCast = (data.credits?.cast || []).slice(0, 30).map((c: any) => ({
      id: c.id,
      name: c.name,
      character: c.character || "Acting Personnel",
      profilePath: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
    }));

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

    // Fetch similar movies matching CineStream Movie interface
    const similar = (data.similar?.results || []).slice(0, 12).map((item: any) => {
      const isTv = apiType === "tv";
      const itemTitle = item.title || item.name || item.original_title || item.original_name;
      const releaseDate = item.release_date || item.first_air_date || "2024";
      
      const posterUrl = item.poster_path 
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
        : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
        
      const backdropUrl = item.backdrop_path 
        ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` 
        : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
        
      const itemGenres = (item.genre_ids || [])
        .map((gid: number) => GENRE_MAP[gid])
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
    
    res.json({
      success: true,
      details: {
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
        
        // Extended metadata
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
        
        // Images
        backdrops,
        posters,
        logos,
        
        // Crew
        directors,
        writers,
        producers,
        creativeTeam,
        directionTeam,
        fullCast,
        
        // Videos
        videos,
        
        // TV specific
        seasons,
        
        // Companies
        productionCompanies
      }
    });
    
  } catch (err) {
    console.error("Failed to construct detailed TMDB proxy payload:", err);
    res.status(500).json({ error: "Failed to fetch movie details from TMDB api" });
  }
});

// GET PERSON DETAILS WITH FILMOGRAPHY
app.get("/api/person", async (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: "id query parameter is required" });
  }
  try {
    const url = `https://api.themoviedb.org/3/person/${id}?api_key=${TMDB_API_KEY}&append_to_response=combined_credits`;
    console.log(`Fetching detailed person info: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ success: false, error: `TMDB returned status ${response.status}` });
    }
    const data: any = await response.json();
    
    // Parse combined credits
    const castCredits = (data.combined_credits?.cast || []).slice(0, 15).map((item: any) => {
      const itemTitle = item.title || item.name || item.original_title || item.original_name || "Untitled Film";
      const posterUrl = item.poster_path 
        ? `https://image.tmdb.org/t/p/w342${item.poster_path}` 
        : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
      return {
        id: item.id,
        title: itemTitle,
        type: item.media_type || "movie",
        posterUrl,
        character: item.character || "",
        rating: item.vote_average || 7.0
      };
    });

    const crewCredits = (data.combined_credits?.crew || []).slice(0, 15).map((item: any) => {
      const itemTitle = item.title || item.name || item.original_title || item.original_name || "Untitled Film";
      const posterUrl = item.poster_path 
        ? `https://image.tmdb.org/t/p/w342${item.poster_path}` 
        : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
      return {
        id: item.id,
        title: itemTitle,
        type: item.media_type || "movie",
        posterUrl,
        job: item.job || "",
        rating: item.vote_average || 7.0
      };
    });

    const sortedCredits = [...castCredits, ...crewCredits].sort((a, b) => b.rating - a.rating).slice(0, 20);

    return res.json({
      success: true,
      person: {
        id: data.id,
        name: data.name,
        biography: data.biography || "No biography available.",
        birthday: data.birthday || "",
        deathday: data.deathday || undefined,
        placeOfBirth: data.place_of_birth || "",
        profileUrl: data.profile_path ? `https://image.tmdb.org/t/p/h632${data.profile_path}` : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
        knownForDepartment: data.known_for_department || "",
        credits: sortedCredits
      }
    });
  } catch (err) {
    console.warn("Quota/Network error while fetching person info. Serving fallback offline mock person:", err);
    return res.json({
      success: true,
      person: {
        id: Number(id),
        name: "Cinema Collaborator",
        biography: "An exceptionally accomplished member of the global creative industry who has contributed distinct expertise, narrative framing, and stylistic atmosphere to numerous classic feature films.",
        birthday: "1980-01-01",
        placeOfBirth: "Los Angeles, California, USA",
        profileUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
        knownForDepartment: "Directing",
        credits: []
      }
    });
  }
});

// GET TV EPISODES FOR A GIVEN SEASON
app.get("/api/tv-season", async (req, res) => {
  const { id, season } = req.query;
  if (!id || !season) {
    return res.status(400).json({ error: "id and season query parameters are required" });
  }
  try {
    const url = `https://api.themoviedb.org/3/tv/${id}/season/${season}?api_key=${TMDB_API_KEY}`;
    console.log(`Fetching TV season details: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ success: false, error: `TMDB returned status ${response.status}` });
    }
    const data: any = await response.json();
    
    const episodes = (data.episodes || []).map((ep: any) => ({
      id: ep.id,
      name: ep.name,
      episodeNumber: ep.episode_number,
      overview: ep.overview || "Episode synopsis and details.",
      airDate: ep.air_date || "",
      stillPath: ep.still_path ? `https://image.tmdb.org/t/p/w300${ep.still_path}` : null,
      voteAverage: ep.vote_average || 7.0
    }));

    return res.json({
      success: true,
      episodes
    });
  } catch (err) {
    console.warn("Quota/Network error while fetching TV season episodes. Serving mock episodes:", err);
    // Serve fallback episodes
    const fallbackEpisodes = Array.from({ length: 8 }, (_, i) => ({
      id: 9000 + i,
      name: `Episode ${i + 1}`,
      episodeNumber: i + 1,
      overview: "As relationships grow more intricate, unexpected choices disrupt core alliances. The team must make pivotal sacrifices to safeguard their remaining cinematic timeline.",
      airDate: "2024-01-15",
      stillPath: null,
      voteAverage: 8.2
    }));
    return res.json({
      success: true,
      episodes: fallbackEpisodes
    });
  }
});


// 3. AI INTELLIGENT MOOD RECOMMENDATIONS
app.post("/api/recommendations", async (req, res) => {
  const { mood, preferredGenres, favoredMovies } = req.body;

  if (!ai) {
    // Fallback recommendation if Gemini is offline
    const randomMovies = [...curatedMovies].sort(() => 0.5 - Math.random()).slice(0, 4);
    return res.json({
      success: true,
      reasoning: "Showing classic hand-picked cinematic blockbusters to match your query. Connect Gemini API for customized AI movie matching!",
      movies: randomMovies,
      source: "fallback"
    });
  }

  try {
    const prompt = `Formulate a highly personalized cinema recommendation list of exactly 4 movies/TV shows.
    - Present State / Mood: "${mood || "No specific mood, looking for general masterpiece recommendations"}"
    - Favorite Genres: "${(preferredGenres || []).join(", ") || "Any"}"
    - Films they already like: "${(favoredMovies || []).join(", ") || "Any"}"
    
    Return a JSON array matching the schema. Select appropriate existing films or series from world cinema. Give realistic TMDB IDs, release dates, genres, and realistic descriptions. Let each have high quality Unsplash or TMDB imagery, and custom search trailers.`;

    const systemInstruction = `You are CineStream Personal AI Consultant. You output a JSON database of exactly 4 movies or TV shows suited perfectly to the user's specific mood, emotional request, or preference. Design beautiful backdrops and posters using Unsplash source links with cinematic, retro, or modern tags tailored to each movie's atmosphere.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            reasoning: { type: Type.STRING, description: "A beautifully written, supportive 2-sentence explanation of why these movies match the user's mood and taste of cinema." },
            movies: MovieListSchema
          },
          required: ["reasoning", "movies"]
        },
        systemInstruction
      }
    });

    if (response && response.text) {
      const data = JSON.parse(response.text.trim());
      // Fill trailers if missing
      for (const m of data.movies) {
        if (!m.trailerUrl) {
          m.trailerUrl = `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(m.title + " trailer")}`;
        }
        if (!m.posterUrl) {
          m.posterUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
        }
        if (!m.backdropUrl) {
          m.backdropUrl = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
        }
      }
      return res.json({ success: true, ...data, source: "ai" });
    }
  } catch (err) {
    console.log("Note: Gemini recommendation quota/network fallback active. Serving localized movie mix.");
  }

  // Graceful fallback
  const randomMovies = [...curatedMovies].sort(() => 0.5 - Math.random()).slice(0, 4);
  return res.json({
    success: true,
    reasoning: "We encountered an error generating recommendations, so here are some highly acclaimed hits from our selection!",
    movies: randomMovies,
    source: "fallback"
  });
});

// 4. GENERATE DETAILED AI TRIVIA, SECRET REVEALS & COMPREHENSIVE AI REVIEW
app.post("/api/trivia", async (req, res) => {
  const { title } = req.body;
  if (!title) {
    return res.status(400).json({ error: "Title is required" });
  }

  if (!ai) {
    return res.json({
      success: true,
      trivia: [
        "Did you know? Curating list of movies took incredible dedication in CineStream codebase.",
        "Connecting your Gemini API Key in AI Studio Secrets unlocks bespoke custom trivia, easter eggs, hidden details, and film crew secrets generated directly on the fly!"
      ],
      review: "A beautifully crafted piece of art. Set up a secure Gemini API Key to let our AI write custom plot analysis, thematic reports, and director score details.",
      ratingExplanation: "8.5/10 based on standard film critic aggregated logs."
    });
  }

  try {
    const prompt = `Perform a comprehensive deep-dive into the film/show: "${title}".
    Provide exactly:
    1. A list of 3-4 mind-blowing trivia facts or hidden Easter Eggs.
    2. A brief, professional Critical Review summarizing its deeper thematic values (e.g. directing, cinematography, philosophies, acting scores).
    3. An explanation of why critics rate it the way they do.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            trivia: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 to 4 captivating trivia points or behind-the-scenes facts"
            },
            review: { type: Type.STRING, description: "A deeply insightful critical film analysis (60-100 words)" },
            ratingExplanation: { type: Type.STRING, description: "A concise 1-sentence breakdown of critical score factors" }
          },
          required: ["trivia", "review", "ratingExplanation"]
        },
        systemInstruction: "You are a professional film scholar and expert movie critic. Your reviews are elegant, articulate, and bring immense value to cinephiles."
      }
    });

    if (response && response.text) {
      const data = JSON.parse(response.text.trim());
      return res.json({ success: true, ...data });
    }
    throw new Error("Empty response from model");
  } catch (err) {
    console.log("Note: Gemini trivia generation quota/network fallback active. Serving intelligent offline asset response.");
    
    let triviaList = [
      `Historically acclaimed, "${title}" is widely studied in modern cinematography circles for its highly innovative pacing and directorial execution.`,
      `The production of "${title}" brought together legendary collaborators to design a distinctive atmospheric theme suited to the script's visual motifs.`,
      `The film's masterfully tuned audio layout and editing score work in perfect harmony to preserve suspense in critical key frames.`,
      `Linking your custom Gemini API key in the AI Studio platform immediately enables bespoke real-time movie critiques and detailed trivia!`
    ];
    let reviewText = `"${title}" is exceptionally well-composed, translating deep philosophical queries or raw human emotion into beautiful physical movement. The film provides ample room for its complex leads to breathe and evolve, maintaining absolute cinematic integrity. A truly outstanding experience.`;
    let ratingExplanation = `Earning top critical praise globally for its sharp screenwriting structure, elegant sound design, and robust performances.`;

    const normTitle = title.toLowerCase().trim();
    if (normTitle.includes("interstellar")) {
      triviaList = [
        "To ensure scientific accuracy for the black hole (Gargantua), Dr. Kip Thorne collaborated with VFX artists, creating new computer-rendering equations.",
        "Christopher Nolan hired legendary Hans Zimmer to write the score without knowing the genre or details, only giving him a one-page letter about a father and child.",
        "The giant dust clouds in the film were real! Nolan used giant fans to blow a food additive called 'Carb-o-Sil' across the set.",
        "To capture the cornfield scenes, Nolan grew 500 acres of actual organic corn, which the production eventually sold for a profit after filming completed!"
      ];
      reviewText = "Interstellar is a breathtaking, philosophically poignant sci-fi masterpiece. Combining Kip Thorne's rigorous physics with Hans Zimmer's pipe-organ heavy score, Christopher Nolan creates an emotionally resonant epic about humanity, love, time, and gravity. Its visual rendering of Gargantua stands as a landmark in visual effects history.";
      ratingExplanation = "Earning an extraordinary 8.6/10 globally for its seamless blend of scientific relativity, powerful emotional performances, and breathtaking IMAX cinematography.";
    } else if (normTitle.includes("dune")) {
      triviaList = [
        "Director Denis Villeneuve spent over a year collaborating with cinematographer Greig Fraser to define the stark, bright desert aesthetic of Arrakis.",
        "Linguist David J. Peterson was hired to fully expand the Fremen language, building custom phonetics and words based on Frank Herbert's novels.",
        "Hans Zimmer constructed custom instruments and synthesizers specifically for Dune to create sounds that felt totally alien and non-earthly.",
        "Most of the desert scenes in Dune were shot in Abu Dhabi and Jordan, with actors working during golden hour to optimize natural light shadows."
      ];
      reviewText = "Dune is a modern visual and auditory triumph. Villeneuve treats Arrakis with religious reverence, creating massive visceral frames that capture the sheer scale of the desert planet. The stellar ensemble cast, elevated by spectacular sound design, delivers an immersive operatic experience that truly honors Frank Herbert's complex sci-fi vision.";
      ratingExplanation = "Rated 8.3/10 for its monumental scale, awe-inspiring world-building, and Hans Zimmer's mesmerizing alien synth score.";
    } else if (normTitle.includes("dark knight")) {
      triviaList = [
        "Heath Ledger lived alone in a hotel room for a month to form the Joker's psychotic personality, posture, and distinctive voice.",
        "To prepare for the famous truck flip stunt, stunt coordinator Jim Wilkey drove the semi-truck himself, flipping it fully vertically in the middle of LaSalle Street.",
        "The Dark Knight was the first major feature film to utilize IMAX cameras for high-stakes action sequences, which Nolan loved for their supreme resolution.",
        "Heath Ledger designed the iconic Joker makeup himself, purchasing cheap drug-store cosmetics to ensure it looked imperfect and hand-painted."
      ];
      reviewText = "The Dark Knight is widely regarded as the pinnacle of the superhero genre. Christopher Nolan translates Gotham into an authentic, gritty crime thriller reminiscent of Michael Mann's Heat. Heath Ledger's legendary performance as the Joker is nothing short of mesmerizing, setting an unmatched standard for film villains and thematic chaos.";
      ratingExplanation = "Holding a stellar 9.0/10 rating for its tight, philosophical screenplay, superb pacing, and legendary villain performance.";
    } else if (normTitle.includes("pulp fiction")) {
      triviaList = [
        "The iconic 1964 Chevrolet Chevelle Malibu driven by Vincent Vega actually belonged to writer/director Quentin Tarantino and was stolen during production.",
        "Tarantino originally wrote the character of Jules Winnfield specifically for Samuel L. Jackson, who won the role after a legendary second audition.",
        "The word 'f**k' is spoken exactly 265 times throughout the film, making it one of the most famously profuse dialog screenplays of the 1990s.",
        "The mysterious glowing briefcase contains a bright lightbulb, leaving its true contents open to endless theories ranging from a soul to gold bars."
      ];
      reviewText = "Pulp Fiction is a generational masterpiece that transformed independent cinema. Quentin Tarantino's non-linear narrative, infused with razor-sharp dialogue, pop-culture references, and an eclectic surf-rock soundtrack, created an unforgettable cinematic style. Vincent, Jules, and Mia Wallace remain immortalized in modern pop-culture history.";
      ratingExplanation = "Scoring 8.9/10 for its revolutionary post-modern screenwriting, iconic ensemble cast performances, and unmatched dialog delivery.";
    } else if (normTitle.includes("inception")) {
      triviaList = [
        "If you take the first letters of the main characters' names (Dom, Robert, Eames, Arthur, Mal, Saito), they &ldquo;spell&rdquo; 'DREAMS'.",
        "The rotating hotel corridor action scene was filmed using a massive, custom-built 100-foot revolving centrifuge cylinder in Bedfordshire, England.",
        "The title song of the dream layers, Edith Piaf's 'Non, je ne regrette rien', is actually the source of Hans Zimmer's slow brass theme when slowed down.",
        "The famous top spinning at the end of the film is left ambiguous: Christopher Nolan explained that the emotional truth is that Cobb simply stopped checking."
      ];
      reviewText = "Inception is a jaw-dropping intellectual action thriller. Nolan guides the audience through nested dreams with clockwork precision, supported by Lee Smith's flawless editing and Hans Zimmer's booming horn score. Its unique premise and complex rule-building keep viewers fully locked in from start to finish.";
      ratingExplanation = "Earning an outstanding 8.8/10 for its technical brilliance, ingenious dream heist concept, and intense thematic pacing.";
    } else if (normTitle.includes("breaking bad")) {
      triviaList = [
        "The show's creator Vince Gilligan originally wanted Aaron Paul's character Jesse Pinkman to be killed off at the end of Season 1, but changed his mind when he saw their chemistry.",
        "Bryan Cranston was cast as Walter White because Vince Gilligan remembered his guest performance on an episode of The X-Files where he played a sympathetic anti-hero.",
        "The blue meth was actually rock candy cooked up by a local candy store in Albuquerque, and the cast frequently ate it between takes.",
        "Each episode's scientific chemical formulas in the title sequence correspond to actual ingredients used in chemistry laboratories."
      ];
      reviewText = "Breaking Bad is a masterclass in serialized drama. Following the slow, tragic transformation of Walter White from a meek chemistry teacher to a ruthless kingpin, the show maintains a flawless narrative arc. Supported by incredible cinematography and gripping performances, it stands as one of the greatest television achievements of all time.";
      ratingExplanation = "Holding a flawless 9.5/10 for its unparalleled character transformations, slow-burn tension, and ingenious scriptwriting.";
    }

    return res.json({
      success: true,
      trivia: triviaList,
      review: reviewText,
      ratingExplanation: ratingExplanation,
      source: "local_intel"
    });
  }
});

// 5. CHAT WITH MOVIE SENSEI (AI Chat Assistant)
app.post("/api/chat", async (req, res) => {
  const { messages, currentMovie } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Messages array is required" });
  }

  if (!ai) {
    return res.json({
      success: true,
      reply: "Hello! I am CineStream Movie Sensei. Please provide a GEMINI_API_KEY in the Secrets menu to enable interactive chat about all things cinema!"
    });
  }

  try {
    const systemPrompt = `You are CineStream Sensei, an incredibly wise, friendly, and encyclopedic AI movie guru. 
    You are chatting with a film enthusiast about cinema. 
    ${currentMovie ? `They are currently viewing details for the movie/show: "${currentMovie}". Tailor your answers or naturally reference it if appropriate.` : ""}
    Provide rich, passionate, and beautifully written replies under 120 words.`;

    const chatHistory = messages.map(msg => ({
      role: msg.role === "assistant" ? "model" as const : "user" as const,
      parts: [{ text: msg.content }]
    }));

    // Extract current message
    const lastMessage = chatHistory.pop();
    if (!lastMessage) {
      return res.status(400).json({ error: "No messages found" });
    }

    const chat = ai.chats.create({
      model: "gemini-3.5-flash",
      history: chatHistory,
      config: {
        systemInstruction: systemPrompt
      }
    });

    const response = await chat.sendMessage({
      message: lastMessage.parts[0].text
    });

    return res.json({ success: true, reply: response.text });
  } catch (err) {
    console.log("Note: Gemini chat quota/network fallback active.");
    return res.json({
      success: true,
      reply: "My cinema brain is currently experiencing high wave traffic (quota limits reached). Rest assured, I still highly recommend browsing through our atmospheric curated Masterpieces!"
    });
  }
});

// Vite Middleware & Static Files Setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
