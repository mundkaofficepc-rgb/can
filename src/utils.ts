export const isPlayable = (releaseDate?: string): boolean => {
  if (!releaseDate) return true;
  return releaseDate <= "2026-06-21";
};
