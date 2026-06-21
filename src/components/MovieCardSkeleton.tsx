import React from "react";

export default function MovieCardSkeleton() {
  return (
    <div className="relative flex flex-col overflow-hidden rounded-xl bg-[#111111]/40 border border-white/5 shadow-md animate-pulse">
      {/* Poster Container Shimmer */}
      <div className="relative aspect-[2/3] w-full bg-white/5" />

      {/* Info Block Shimmer */}
      <div className="flex flex-1 flex-col p-3 space-y-2">
        <div className="h-4 w-3/4 rounded bg-white/10" />
        <div className="h-3 w-1/2 rounded bg-white/5" />
        <div className="pt-3 flex items-center justify-between border-t border-white/5">
          <div className="h-3 w-1/3 rounded bg-white/5" />
          <div className="h-4 w-4 rounded-full bg-white/5" />
        </div>
      </div>
    </div>
  );
}
