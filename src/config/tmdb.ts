export const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';
export const TMDB_POSTER_SIZES = {
  small: 'w185',
  medium: 'w342',
  large: 'w500',
  original: 'original'
};

export function getTMDBImageUrl(path: string, size: keyof typeof TMDB_POSTER_SIZES = 'medium') {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}${TMDB_POSTER_SIZES[size]}${path}`;
} 