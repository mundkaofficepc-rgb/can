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
const TMDB_API_KEY = process.env.TMDB_API_KEY || "1d84ab491afb8deec137b04c9f397a39";

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
      throw new Error(`TMDB trending weekly failed with status: ${trendingRes.status}`);
    }
    
    const trendingData: any = await trendingRes.json();
    const list = (trendingData.results || []).slice(0, 20).map((item: any) => {
      const isTv = item.media_type === "tv" || !item.release_date;
      const title = item.title || item.name || item.original_title || item.original_name;
      const releaseDate = item.release_date || item.first_air_date || "2024-01-01";
      
      const posterUrl = item.poster_path 
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
        : "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=500";
        
      const backdropUrl = item.backdrop_path 
        ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` 
        : "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200";
        
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
        trending: true
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
      throw new Error(`TMDB search returned status ${response.status}`);
    }
    
    const data: any = await response.json();
    if (!data || !Array.isArray(data.results)) {
      return res.json({ success: true, movies: [], source: "tmdb" });
    }
    
    const results = data.results
      .filter((item: any) => item.media_type === "movie" || item.media_type === "tv")
      .map((item: any) => {
        const isTv = item.media_type === "tv";
        const title = item.title || item.name || item.original_title || item.original_name;
        const releaseDate = item.release_date || item.first_air_date || "2024-01-01";
        
        const posterUrl = item.poster_path 
          ? `https://image.tmdb.org/t/p/w500${item.poster_path}` 
          : "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=500";
          
        const backdropUrl = item.backdrop_path 
          ? `https://image.tmdb.org/t/p/original${item.backdrop_path}` 
          : "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200";
          
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
          cast: ["Featured Cast"]
        };
      });
      
    return res.json({ success: true, movies: results, source: "tmdb_search" });

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

// NEW 2B. DETAILED ON-DEMAND TMDB API PROXY WITH CREDITS, EXTERNAL_IDS, VIDEOS, SIMILAR
app.get("/api/details", async (req, res) => {
  const { id, type } = req.query;
  if (!id || !type) {
    return res.status(400).json({ error: "id and type query parameters are required" });
  }
  
  try {
    const apiType = type === "tv" ? "tv" : "movie";
    const url = `https://api.themoviedb.org/3/${apiType}/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,external_ids,videos,similar`;
    
    console.log(`Fetching highly detailed info from TMDB: ${url}`);
    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ success: false, error: `TMDB returned status ${response.status}` });
    }
    
    const data: any = await response.json();
    
    // Parse TMDB detail format
    const cast = data.credits?.cast?.slice(0, 5).map((c: any) => c.name) || ["Featured Stars"];
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
    
    // Fetch similar movies matching CineStream Movie interface
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
        posterUrl: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=500",
        backdropUrl: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1200",
        genres,
        duration,
        cast,
        imdbId,
        trailerUrl,
        similar
      }
    });
    
  } catch (err) {
    console.error("Failed to construct detailed TMDB proxy payload:", err);
    res.status(500).json({ error: "Failed to fetch movie details from TMDB api" });
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
          m.posterUrl = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=500";
        }
        if (!m.backdropUrl) {
          m.backdropUrl = "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1200";
        }
      }
      return res.json({ success: true, ...data, source: "ai" });
    }
  } catch (err) {
    console.error("Gemini recommendation failed:", err);
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
  } catch (err) {
    console.error("Gemini trivia generation failed:", err);
    res.status(500).json({ error: "Failed to generate trivia" });
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
    console.error("Gemini chat failed:", err);
    res.status(500).json({ error: "Failed to generate chat response" });
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
