import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const isPlayable = (releaseDate: string): boolean => {
  if (!releaseDate) return true;
  const release = new Date(releaseDate);
  const now = new Date();
  return release <= now;
};
