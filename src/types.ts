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
