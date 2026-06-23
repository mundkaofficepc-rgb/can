import React from "react";

export default function MovieCardSkeleton() {
  return (
    <div 
      className="relative flex flex-col overflow-hidden rounded-lg sm:rounded-xl bg-[#111111]/40 border border-white/5 shadow-md animate-pulse shrink-0 snap-start"
      style={{ width: "clamp(84px, 24vw, 165px)" }}
    >
      {/* Poster Container Shimmer */}
      <div className="relative aspect-[2/3] w-full bg-white/5" />

      {/* Info Block Shimmer */}
      <div className="flex flex-1 flex-col p-2 sm:p-3 space-y-1 sm:space-y-2">
        <div className="h-3 sm:h-4 w-3/4 rounded bg-white/10" />
        <div className="h-2 sm:h-3 w-1/2 rounded bg-white/5" />
        <div className="pt-2 sm:pt-3 flex items-center justify-between border-t border-white/5">
          <div className="h-2 sm:h-3 w-1/3 rounded bg-white/5" />
          <div className="h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-white/5" />
        </div>
      </div>
    </div>
  );
}
