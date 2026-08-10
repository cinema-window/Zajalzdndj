import { MovieItem } from '../types';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || 'fea62da470cde92d5beb77af630a0854';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';

export const searchTmdbMovies = searchTmdbMoviesClient;
export const fetchTmdbMovieDetails = fetchTmdbMovieDetailsClient;

export async function searchTmdbMoviesClient(query: string, language = 'ar-SA'): Promise<any[]> {
  if (!query.trim()) return [];

  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&language=${language}&page=1&include_adult=false`
    );
    const data = await res.json();

    if (data.results && Array.isArray(data.results)) {
      return data.results.map((item: any) => ({
        tmdbId: item.id,
        mediaType: item.media_type || (item.first_air_date ? 'tv' : 'movie'),
        titleAr: item.title || item.name || 'بدون عنوان',
        originalTitle: item.original_title || item.original_name || '',
        releaseYear: (item.release_date || item.first_air_date || '').split('-')[0] || new Date().getFullYear().toString(),
        overview: item.overview || '',
        posterUrl: item.poster_path ? `${TMDB_IMAGE_BASE}/w500${item.poster_path}` : '',
        backdropUrl: item.backdrop_path ? `${TMDB_IMAGE_BASE}/w1280${item.backdrop_path}` : '',
        rating: item.vote_average ? Math.round(item.vote_average * 10) / 10 : 8.0,
      }));
    }
  } catch (err) {
    console.error('TMDB search error:', err);
  }

  return [];
}

export async function fetchTmdbPopularMoviesClient(category: 'trending' | 'popular' | 'popular_tv' | 'top_rated' | 'top_rated_tv' = 'trending'): Promise<any[]> {
  try {
    let endpoint = '/trending/all/day';
    if (category === 'popular') endpoint = '/movie/popular';
    if (category === 'popular_tv') endpoint = '/tv/popular';
    if (category === 'top_rated') endpoint = '/movie/top_rated';
    if (category === 'top_rated_tv') endpoint = '/tv/top_rated';

    const res = await fetch(`${TMDB_BASE_URL}${endpoint}?api_key=${TMDB_API_KEY}&language=ar-SA&page=1`);
    const data = await res.json();

    if (data.results && Array.isArray(data.results)) {
      return data.results.slice(0, 15).map((item: any) => ({
        tmdbId: item.id,
        mediaType: item.media_type || (item.first_air_date ? 'tv' : 'movie'),
        titleAr: item.title || item.name || 'بدون عنوان',
        originalTitle: item.original_title || item.original_name || '',
        releaseYear: (item.release_date || item.first_air_date || '').split('-')[0] || new Date().getFullYear().toString(),
        overview: item.overview || '',
        posterUrl: item.poster_path ? `${TMDB_IMAGE_BASE}/w500${item.poster_path}` : '',
        backdropUrl: item.backdrop_path ? `${TMDB_IMAGE_BASE}/w1280${item.backdrop_path}` : '',
        rating: item.vote_average ? Math.round(item.vote_average * 10) / 10 : 8.0,
      }));
    }
  } catch (err) {
    console.error('TMDB popular fetch error:', err);
  }

  return [];
}

export async function fetchTmdbMovieDetailsClient(
  tmdbId: number,
  language = 'ar-SA',
  mediaType: 'movie' | 'tv' = 'movie'
): Promise<Partial<MovieItem> | null> {
  try {
    const res = await fetch(
      `${TMDB_BASE_URL}/${mediaType}/${tmdbId}?api_key=${TMDB_API_KEY}&language=${language}`
    );
    const data = await res.json();

    if (!data || data.status_code) return null;

    const poster = data.poster_path ? `${TMDB_IMAGE_BASE}/w500${data.poster_path}` : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800';
    const backdrop = data.backdrop_path ? `${TMDB_IMAGE_BASE}/w1280${data.backdrop_path}` : poster;
    const titleAr = data.title || data.name || 'فيلم سينمائي';
    const genresList = Array.isArray(data.genres) ? data.genres.map((g: any) => g.name) : ['سينما'];

    return {
      tmdbId: data.id,
      id: `tmdb-${data.id}`,
      titleAr,
      titleEn: data.original_title || data.original_name || titleAr,
      originalTitle: data.original_title || data.original_name || '',
      descriptionAr: data.overview || `مشاهدة ${titleAr} بجودة عالية مترجم اون لاين.`,
      descriptionEn: data.overview || '',
      thumbnail: poster,
      posterUrl: poster,
      backdropUrl: backdrop,
      category: mediaType === 'tv' ? 'Series' : 'Movies',
      categoryAr: mediaType === 'tv' ? 'مسلسلات' : 'أفلام سينمائية',
      seriesId: mediaType === 'tv' ? `tv-${data.id}` : 'indie-movies',
      seriesNameAr: mediaType === 'tv' ? titleAr : 'أفلام سينمائية',
      releaseYear: (data.release_date || data.first_air_date || '').split('-')[0] || new Date().getFullYear().toString(),
      rating: data.vote_average ? Math.round(data.vote_average * 10) / 10 : 8.5,
      quality: '1080p FHD',
      genreBadge: genresList[0] || 'متميز',
      genres: genresList,
      tags: [titleAr, ...(data.original_title ? [data.original_title] : [])],
      isFeatured: true,
      viewsCount: '500'
    };
  } catch (err) {
    console.error('TMDB details fetch error:', err);
    return null;
  }
}
