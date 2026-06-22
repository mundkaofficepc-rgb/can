import React from "react";
import { X, Maximize2, Play, Pause } from "lucide-react";
import { Movie } from "../types";
import { motion, AnimatePresence } from "motion/react";

interface MiniPlayerProps {
  movie: Movie;
  onClose: () => void;
  onExpand: () => void;
}

export default function MiniPlayer({ movie, onClose, onExpand }: MiniPlayerProps) {
  const [isPlaying, setIsPlaying] = React.useState(true);

  // Formulate Stream Embed URL (simplified for miniplayer)
  const getStreamUrl = () => {
    const id = movie.id;
    // Defaulting to a safe player for miniplayer
    if (movie.type === "tv") {
      return `https://vidsrc.to/embed/tv/${id}/1/1`;
    }
    return `https://vidsrc.to/embed/movie/${id}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 50 }}
      className="fixed bottom-4 right-4 z-[100] w-72 md:w-80 aspect-video bg-black rounded-lg border border-white/10 shadow-2xl overflow-hidden group"
    >
      {/* Video Content */}
      <div className="relative w-full h-full">
        <iframe
          src={`${getStreamUrl()}?autoplay=1&mute=0`}
          title={`${movie.title} Mini Player`}
          className="absolute inset-0 w-full h-full"
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture"
        />
        
        {/* Overlay Controls (visible on hover) */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2 pointer-events-none">
          <div className="flex justify-between items-start pointer-events-auto">
            <h4 className="text-[10px] font-bold text-white truncate max-w-[150px] drop-shadow-md">
              {movie.title}
            </h4>
            <div className="flex gap-1.5">
              <button
                onClick={onExpand}
                className="p-1 rounded-full bg-black/60 text-white hover:bg-[#ff4e00] transition-colors cursor-pointer"
                title="Expand to full screen"
              >
                <Maximize2 size={12} />
              </button>
              <button
                onClick={onClose}
                className="p-1 rounded-full bg-black/60 text-white hover:bg-red-500 transition-colors cursor-pointer"
                title="Close Player"
              >
                <X size={12} />
              </button>
            </div>
          </div>
          
          <div className="flex justify-center pointer-events-auto">
             <button
               onClick={() => setIsPlaying(!isPlaying)}
               className="p-2 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-[#ff4e00] transition-all scale-75"
             >
               {isPlaying ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
             </button>
          </div>

          <div className="pointer-events-none">
             <div className="h-0.5 w-full bg-white/20 rounded-full overflow-hidden mt-1">
                <div className="h-full bg-[#ff4e00] w-1/3 animate-pulse" />
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
