export interface Movie {
  id: number;
  title: string;
  type: 'movie' | 'tv';
  overview: string;
  rating: number;
  releaseDate: string;
  posterUrl: string;
  backdropUrl: string;
  genres: string[];
  trailerUrl: string;
  duration: string;
  cast: string[];
  trending?: boolean;
  popular?: boolean;
  topRated?: boolean;
  imdbId?: string;
  similar?: Movie[];
  soon?: boolean;
  
  // Exhaustive IMAX / IMDb style sections requested
  originalTitle?: string;
  tagline?: string;
  voteCount?: number;
  popularity?: number;
  keywords?: string[];
  adult?: boolean;
  spokenLanguages?: string[];
  originalLanguage?: string;
  originCountry?: string[];
  belongsToCollection?: {
    name: string;
    posterUrl: string;
    backdropUrl: string;
  } | null;
  budget?: number;
  revenue?: number;
  status?: string;
  
  // Production and Gallery images
  backdrops?: string[];
  posters?: string[];
  logos?: string[];
  
  // Detailed Crew structures
  directors?: Array<{ id: number; name: string; profilePath: string }>;
  writers?: Array<{ id: number; name: string; profilePath: string }>;
  producers?: Array<{ id: number; name: string; profilePath: string }>;
  creativeTeam?: Array<{ id: number; name: string; job: string; profilePath: string }>;
  directionTeam?: Array<{ id: number; name: string; job: string; profilePath: string }>;
  fullCast?: Array<{ id: number; name: string; character: string; profilePath: string }>;
  
  // Categorized video streams
  videos?: Array<{ key: string; name: string; type: string; site: string }>;
  
  // Television hierarchy
  seasons?: Array<{
    id: number;
    name: string;
    seasonNumber: number;
    episodeCount: number;
    airDate: string;
    posterPath: string;
    overview: string;
  }>;
  
  // Industry companies
  productionCompanies?: Array<{ name: string; logoUrl: string; originCountry: string }>;
}

export interface Person {
  id: number;
  name: string;
  biography: string;
  birthday: string;
  deathday?: string;
  placeOfBirth: string;
  profileUrl: string;
  knownForDepartment: string;
  credits: Array<{
    id: number;
    title: string;
    type: 'movie' | 'tv';
    posterUrl: string;
    character?: string;
    job?: string;
    rating: number;
  }>;
}

export interface TVEpisode {
  id: number;
  name: string;
  episodeNumber: number;
  overview: string;
  airDate: string;
  stillPath: string | null;
  voteAverage: number;
}

export interface RecommendationResponse {
  success: boolean;
  reasoning: string;
  movies: Movie[];
  source: string;
}

export interface TriviaResponse {
  success: boolean;
  trivia: string[];
  review: string;
  ratingExplanation: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
