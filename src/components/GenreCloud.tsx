import React from "react";
import { motion } from "motion/react";
import { 
  Flame, Rocket, Theater, Sparkles, Palette, Skull, 
  Grid, Music, Zap, Heart, Ghost, Sword, Coffee 
} from "lucide-react";

interface GenreCloudProps {
  genres: string[];
  selectedGenre: string;
  onGenreSelect: (genre: string) => void;
}

const GENRE_ICONS: Record<string, React.ReactNode> = {
  "Action": <Flame className="h-3.5 w-3.5" />,
  "Adventure": <Sword className="h-3.5 w-3.5" />,
  "Animation": <Palette className="h-3.5 w-3.5" />,
  "Comedy": <Zap className="h-3.5 w-3.5" />,
  "Crime": <Skull className="h-3.5 w-3.5" />,
  "Drama": <Theater className="h-3.5 w-3.5" />,
  "Family": <Heart className="h-3.5 w-3.5" />,
  "Fantasy": <Sparkles className="h-3.5 w-3.5" />,
  "Horror": <Ghost className="h-3.5 w-3.5" />,
  "Music": <Music className="h-3.5 w-3.5" />,
  "Romance": <Heart className="h-3.5 w-3.5" />,
  "Sci-Fi": <Rocket className="h-3.5 w-3.5" />,
  "Thriller": <Skull className="h-3.5 w-3.5" />,
  "Mystery": <Ghost className="h-3.5 w-3.5" />,
  "Documentary": <Coffee className="h-3.5 w-3.5" />,
  "Western": <Sword className="h-3.5 w-3.5" />,
  "War": <Skull className="h-3.5 w-3.5" />,
  "History": <Theater className="h-3.5 w-3.5" />,
};

export default function GenreCloud({ genres, selectedGenre, onGenreSelect }: GenreCloudProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03
      }
    }
  };

  const item = {
    hidden: { opacity: 0, scale: 0.8 },
    show: { opacity: 1, scale: 1 }
  };

  return (
    <div className="w-full py-2 sm:py-6">
      <div className="flex items-center gap-2 mb-3 sm:mb-4">
        <div className="h-1 w-8 sm:w-12 bg-[#ff4e00] rounded-full" />
        <h3 className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Explore Genres</h3>
      </div>
      
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="flex flex-row overflow-x-auto gap-2 pb-2 sm:flex sm:flex-wrap sm:gap-2.5"
      >
        <motion.button
          variants={item}
          onClick={() => onGenreSelect("All")}
          className={`flex-shrink-0 flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2 rounded-lg sm:rounded-full text-[9px] sm:text-xs font-bold transition-all cursor-pointer border ${
            selectedGenre === "All"
              ? "bg-[#ff4e00] border-[#ff4e00] text-white shadow-lg shadow-[#ff4e00]/20"
              : "bg-white/5 border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
          }`}
        >
          <Grid className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          <span>All</span>
        </motion.button>

        {genres.filter(g => g !== "All").map((genre) => (
          <motion.button
            key={genre}
            variants={item}
            onClick={() => onGenreSelect(genre)}
            className={`flex-shrink-0 flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2 rounded-lg sm:rounded-full text-[9px] sm:text-xs font-bold transition-all cursor-pointer border ${
              selectedGenre === genre
                ? "bg-[#ff4e00] border-[#ff4e00] text-white shadow-lg shadow-[#ff4e00]/20"
                : "bg-white/5 border-white/10 text-zinc-400 hover:border-white/20 hover:text-white"
            }`}
          >
            {GENRE_ICONS[genre] || <Grid className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
            <span className="truncate">{genre}</span>
          </motion.button>
        ))}
      </motion.div>
    </div>
  );
}
