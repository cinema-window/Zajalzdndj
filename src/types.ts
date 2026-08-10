export type LanguageCode = 'ar' | 'en' | 'ja' | 'fr' | 'es' | 'de' | 'zh' | 'tr' | 'ru' | 'pt' | 'it' | 'hi' | 'ko' | 'id' | 'fa' | 'ur';

export interface VideoSource {
  id: string;
  name: string; // e.g. "Server VIP 1", "Fast Stream"
  url: string;
  quality?: string; // e.g. "1080p HD", "4K"
}

export interface SubtitleTrack {
  id: string;
  lang: string; // e.g. "ar", "en"
  label: string; // e.g. "العربية", "English"
  url: string;
}

export interface MovieItem {
  id: string;
  originalTitle?: string;
  titleAr: string;
  titleEn: string;
  descriptionAr: string;
  descriptionEn: string;
  
  // Visuals
  thumbnail: string;
  posterUrl?: string;
  backdropUrl?: string;
  
  // Video & Streams
  embedUrl: string;
  videoSources?: VideoSource[];
  subtitles?: SubtitleTrack[];
  youtubeId?: string;
  trailerUrl?: string;
  
  // Metadata & Categorization
  seriesId?: string;
  seriesNameAr?: string;
  category: string;
  categoryAr: string;
  genres?: string[];
  genreBadge?: string;
  quality?: string;
  releaseYear: string;
  releaseDate?: string;
  rating: number; // 0.0 - 10.0
  viewsCount?: string;
  tags: string[];
  triviaAr?: string[];
  isFeatured?: boolean;
  published?: boolean;
  tmdbId?: number;
  createdAt?: string;
}

export interface EpisodeItem {
  id: string;
  seriesId: string;
  seriesNameAr?: string;
  seasonNumber: number;
  episodeNumber: number;
  episodeSlug?: string;
  title: string;
  videoUrl?: string;
  embedUrl?: string;
  videoSources?: VideoSource[];
  description?: string;
  posterUrl?: string;
  backdropUrl?: string;
  releaseYear?: string;
  categoryAr?: string;
  rating?: number;
  published?: boolean;
  createdAt?: string;
}

export interface Category {
  id: string;
  nameAr: string;
  nameEn?: string;
  slug?: string;
  icon?: string;
  description?: string;
}

export type CategoryItem = Category;

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  isAdmin?: boolean;
  avatar?: string;
  favorites: string[];
  watched: string[];
  watchHistory: Record<string, number>;
  createdAt: string;
}

export interface DashboardStats {
  totalMovies: number;
  totalSeries: number;
  totalEpisodes: number;
  totalCategories: number;
  totalUsers: number;
  totalViews: number;
  recentMovies: MovieItem[];
  recentUsers: User[];
  isSupabaseConnected: boolean;
}

export type AdminRoute =
  | 'dashboard'
  | 'movies'
  | 'series'
  | 'episodes'
  | 'categories'
  | 'users'
  | 'tmdb'
  | 'telegram'
  | 'seo'
  | 'health'
  | 'security';
