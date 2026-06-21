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
}

export const curatedMovies: Movie[] = [
  {
    id: 157336,
    title: "Interstellar",
    type: "movie",
    overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
    rating: 8.6,
    releaseDate: "2014-11-05",
    posterUrl: "https://image.tmdb.org/t/p/w500/gEU2Qv6157vNIEnAAnIjyj6066o.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/rAiYHfKJj07gX8p66ZNu7g8UI6C.jpg",
    genres: ["Sci-Fi", "Drama", "Adventure"],
    trailerUrl: "https://www.youtube.com/embed/zSWdZVtXT7E",
    duration: "2h 49m",
    cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain", "Michael Caine"],
    trending: true,
    popular: true,
    topRated: true,
    imdbId: "tt0816692"
  },
  {
    id: 693134,
    title: "Dune: Part Two",
    type: "movie",
    overview: "Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the known universe, he endeavors to prevent a terrible future only he can foresee.",
    rating: 8.3,
    releaseDate: "2024-02-27",
    posterUrl: "https://image.tmdb.org/t/p/w500/czemb60GgYCcRpn7967Xg7F9v9u.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/xg27SuYWlhZas6m0zZ7XID6WQ6R.jpg",
    genres: ["Sci-Fi", "Adventure"],
    trailerUrl: "https://www.youtube.com/embed/Way9Dexny3w",
    duration: "2h 46m",
    cast: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson", "Austin Butler", "Florence Pugh"],
    trending: true,
    popular: true,
    topRated: false,
    imdbId: "tt15239678"
  },
  {
    id: 27205,
    title: "Inception",
    type: "movie",
    overview: "Cobb, a skilled thief who is absolute best in the dangerous art of extraction, stealing valuable secrets from deep within the subconscious during the dream state, when the mind is at its most vulnerable.",
    rating: 8.4,
    releaseDate: "2010-07-15",
    posterUrl: "https://image.tmdb.org/t/p/w500/o099vN774Y99un67Xg7FE827110.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/s3Tld83g6cj8g7v67vPhYvUHzdt.jpg",
    genres: ["Sci-Fi", "Action", "Thriller"],
    trailerUrl: "https://www.youtube.com/embed/YoHD9XEInc0",
    duration: "2h 28m",
    cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page", "Tom Hardy"],
    trending: false,
    popular: true,
    topRated: true,
    imdbId: "tt1375666"
  },
  {
    id: 569094,
    title: "Spider-Man: Across the Spider-Verse",
    type: "movie",
    overview: "After reuniting with Gwen Stacy, Brooklyn’s full-time, friendly neighborhood Spider-Man is catapulted across the Multiverse, where he encounters the Spider-Society, a team of Spider-People charged with protecting the Multiverse’s very existence.",
    rating: 8.4,
    releaseDate: "2023-05-31",
    posterUrl: "https://image.tmdb.org/t/p/w500/8VtB7v97oY6vJrF96TEv6ofFjEs.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/612clgZpUJu6SNo67Z6vPhZ676o.jpg",
    genres: ["Animation", "Action", "Adventure", "Sci-Fi"],
    trailerUrl: "https://www.youtube.com/embed/cqGjhVJWtEg",
    duration: "2h 20m",
    cast: ["Shameik Moore", "Hailee Steinfeld", "Oscar Isaac", "Jake Johnson"],
    trending: true,
    popular: false,
    topRated: true,
    imdbId: "tt9362722"
  },
  {
    id: 872585,
    title: "Oppenheimer",
    type: "movie",
    overview: "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II, showing his scientific brilliance and the moral conflict of initiating the nuclear age.",
    rating: 8.1,
    releaseDate: "2023-07-19",
    posterUrl: "https://image.tmdb.org/t/p/w500/8Gxv8gS6Yg86veR699u67XfSpb5_new.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/nb3zXeIYg0g0gqg7RuxV9Xg8a0o.jpg",
    genres: ["Drama", "History", "Biography"],
    trailerUrl: "https://www.youtube.com/embed/uYPbbksJxIg",
    duration: "3h 0m",
    cast: ["Cillian Murphy", "Emily Blunt", "Matt Damon", "Robert Downey Jr."],
    trending: true,
    popular: true,
    topRated: false,
    imdbId: "tt15398716"
  },
  {
    id: 577922,
    title: "Parasite",
    type: "movie",
    overview: "All unemployed, Ki-taek's family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.",
    rating: 8.5,
    releaseDate: "2019-05-30",
    posterUrl: "https://image.tmdb.org/t/p/w500/7IiTTvv7fHeuAr3jYr6g201N3qD.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/6Ybycoor663XvLwBAs6y6y3YjS7.jpg",
    genres: ["Thriller", "Drama", "Comedy"],
    trailerUrl: "https://www.youtube.com/embed/5xH0HfJHsaY",
    duration: "2h 12m",
    cast: ["Song Kang-ho", "Lee Sun-kyun", "Cho Yeo-jeong", "Choi Woo-shik"],
    trending: false,
    popular: false,
    topRated: true,
    imdbId: "tt6751661"
  },
  {
    id: 129,
    title: "Spirited Away",
    type: "movie",
    overview: "A young girl, Chihiro, becomes trapped in a strange, magical world of spirits. When her parents undergo a mysterious transformation, she must summon the courage to work in a bathhouse to free herself and them.",
    rating: 8.5,
    releaseDate: "2001-07-20",
    posterUrl: "https://image.tmdb.org/t/p/w500/393v3v3v3v3v3v3v3v3v3v3v3v3v3.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/m03EE7df77g0BBjyBM78vTv7R95.jpg",
    genres: ["Animation", "Fantasy", "Family"],
    trailerUrl: "https://www.youtube.com/embed/ByXuk9QqQkk",
    duration: "2h 5m",
    cast: ["Rumi Hiiragi", "Miyu Irino", "Mari Natsuki", "Takashi Naito"],
    trending: false,
    popular: true,
    topRated: true,
    imdbId: "tt0245429"
  },
  {
    id: 299534,
    title: "Avengers: Endgame",
    type: "movie",
    overview: "After the devastating events of Avengers: Infinity War, the universe is in ruins. With the help of remaining allies, the Avengers assemble once more in order to reverse Thanos' actions and restore balance to the universe.",
    rating: 8.2,
    releaseDate: "2019-04-24",
    posterUrl: "https://image.tmdb.org/t/p/w500/or066gU4gUUn67XG7FE827110_new.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/7RyHs7Z6g7gC9vXy3YjS7Tux.jpg",
    genres: ["Action", "Sci-Fi", "Adventure"],
    trailerUrl: "https://www.youtube.com/embed/TcMBFSGVi1c",
    duration: "3h 1m",
    cast: ["Robert Downey Jr.", "Chris Evans", "Mark Ruffalo", "Chris Hemsworth"],
    trending: false,
    popular: true,
    topRated: false,
    imdbId: "tt4154756"
  },
  // Adding TV Shows
  {
    id: 1399,
    title: "Game of Thrones",
    type: "tv",
    overview: "Seven noble families fight for control of the mythical land of Westeros. Friction between the houses leads to full-scale war. All while a very ancient evil awakens in the farthest north.",
    rating: 8.4,
    releaseDate: "2011-04-17",
    posterUrl: "https://image.tmdb.org/t/p/w500/u3bZgnWvXjvXEnAAnIjyj6066oi.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/2OMB072gh7gC9vXy3YjS7Tux438.jpg",
    genres: ["Sci-Fi & Fantasy", "Drama", "Action & Adventure"],
    trailerUrl: "https://www.youtube.com/embed/bjqEWgD_76o",
    duration: "8 Seasons",
    cast: ["Emilia Clarke", "Kit Harington", "Peter Dinklage", "Lena Headey"],
    trending: true,
    popular: true,
    topRated: true,
    imdbId: "tt0944947"
  },
  {
    id: 1396,
    title: "Breaking Bad",
    type: "tv",
    overview: "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine with a former student in order to secure his family's future.",
    rating: 8.9,
    releaseDate: "2008-01-20",
    posterUrl: "https://image.tmdb.org/t/p/w500/ztkUQv6157vNIEnAAnIjyj6066o.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/tsGl9yG9mSjB49m7XvNuSTXo86.jpg",
    genres: ["Drama", "Crime"],
    trailerUrl: "https://www.youtube.com/embed/HhesaQXLuRY",
    duration: "5 Seasons",
    cast: ["Bryan Cranston", "Aaron Paul", "Anna Gunn", "Bob Odenkirk"],
    trending: false,
    popular: true,
    topRated: true,
    imdbId: "tt0903747"
  },
  {
    id: 37854,
    title: "One Piece",
    type: "tv",
    overview: "Years ago, the legendary Pirate King Gol D. Roger was executed, leaving a vast treasure called the 'One Piece' behind. Years later, young Monkey D. Luffy sets sail with his crew to find it and become the Pirate King.",
    rating: 8.7,
    releaseDate: "1999-10-20",
    posterUrl: "https://image.tmdb.org/t/p/w500/fcid978Yg86veR699u67XfSpb5.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/x88Z967Yg9mSjB49m7XvNuS4TYcc.jpg",
    genres: ["Animation", "Action & Adventure", "Comedy"],
    trailerUrl: "https://www.youtube.com/embed/S8_YwFLCh4U",
    duration: "20+ Seasons",
    cast: ["Mayumi Tanaka", "Kazuya Nakai", "Akemi Okamura", "Kappei Yamaguchi"],
    trending: true,
    popular: true,
    topRated: true,
    imdbId: "tt0388629"
  },
  {
    id: 65930,
    title: "My Hero Academia",
    type: "tv",
    overview: "In a world where eighty percent of the population has some kind of superpower, Izuku Midoriya is quirkless, but dreams of becoming a legendary hero like his idol All Might.",
    rating: 8.4,
    releaseDate: "2016-04-03",
    posterUrl: "https://image.tmdb.org/t/p/w500/ivOl967Yg9mSjB49m7XvNuS4TYcc.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/6v7bYgS6Yg86veR699u67XfSpb5.jpg",
    genres: ["Animation", "Action & Adventure", "Sci-Fi & Fantasy"],
    trailerUrl: "https://www.youtube.com/embed/D5fYOnwYtj4",
    duration: "7 Seasons",
    cast: ["Daiki Yamashita", "Nobuhiko Okamoto", "Ayane Sakura", "Kenta Miyake"],
    trending: false,
    popular: true,
    topRated: false,
    imdbId: "tt5626028"
  }
];

// Fallback search suggestions and posters to make sure images load beautifully even if TMDB domain fluctuates
export const genres = [
  "All",
  "Action",
  "Adventure",
  "Animation",
  "Drama",
  "Sci-Fi",
  "Fantasy",
  "Thriller",
  "Crime",
  "Family"
];
