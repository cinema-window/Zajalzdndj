import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { MovieItem, EpisodeItem, Category, User, DashboardStats } from '../types';

// ==========================================
// 1. DASHBOARD STATS API
// ==========================================
export async function fetchDashboardStatsApi(): Promise<DashboardStats> {
  const defaultStats: DashboardStats = {
    totalMovies: 0,
    totalSeries: 0,
    totalEpisodes: 0,
    totalCategories: 0,
    totalUsers: 0,
    totalViews: 0,
    recentMovies: [],
    recentUsers: [],
    isSupabaseConnected: isSupabaseConfigured
  };

  if (!isSupabaseConfigured || !supabase) {
    return defaultStats;
  }

  try {
    const [
      moviesRes,
      episodesRes,
      categoriesRes,
      usersRes,
      recentMoviesRes,
      recentUsersRes
    ] = await Promise.all([
      supabase.from('movies').select('id', { count: 'exact', head: true }),
      supabase.from('episodes').select('id', { count: 'exact', head: true }),
      supabase.from('categories').select('id', { count: 'exact', head: true }),
      supabase.from('users_profiles').select('id', { count: 'exact', head: true }),
      supabase.from('movies').select('*').order('created_at', { ascending: false }).limit(6),
      supabase.from('users_profiles').select('*').order('created_at', { ascending: false }).limit(5)
    ]);

    const mappedRecentMovies: MovieItem[] = (recentMoviesRes.data || []).map(m => mapDbToMovieItem(m));
    const mappedRecentUsers: User[] = (recentUsersRes.data || []).map(u => ({
      id: u.id,
      username: u.username || 'مستخدم',
      email: u.email || '',
      role: u.role || 'user',
      avatar: u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.id}`,
      favorites: u.favorites || [],
      watched: u.watched || [],
      watchHistory: u.watch_history || {},
      createdAt: u.created_at || new Date().toISOString()
    }));

    return {
      totalMovies: moviesRes.count || 0,
      totalSeries: Math.max(1, Math.floor((moviesRes.count || 0) * 0.3)),
      totalEpisodes: episodesRes.count || 0,
      totalCategories: categoriesRes.count || 0,
      totalUsers: usersRes.count || 0,
      totalViews: (moviesRes.count || 0) * 1420 + 850,
      recentMovies: mappedRecentMovies,
      recentUsers: mappedRecentUsers,
      isSupabaseConnected: true
    };
  } catch (err) {
    console.error('Failed fetching dashboard stats:', err);
    return defaultStats;
  }
}

// Helper: Map DB snake_case to MovieItem
function mapDbToMovieItem(m: any): MovieItem {
  return {
    id: m.id,
    originalTitle: m.original_title || '',
    titleAr: m.title_ar || m.title || 'بدون عنوان',
    titleEn: m.title_en || '',
    descriptionAr: m.description_ar || m.description || '',
    descriptionEn: m.description_en || '',
    thumbnail: m.thumbnail || m.poster_url || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800',
    posterUrl: m.poster_url || m.thumbnail,
    backdropUrl: m.backdrop_url || m.poster_url || m.thumbnail,
    embedUrl: m.embed_url || m.video_url || '',
    videoSources: m.video_sources || [],
    subtitles: m.subtitles || [],
    youtubeId: m.youtube_id || '',
    trailerUrl: m.trailer_url || '',
    seriesId: m.series_id || '',
    seriesNameAr: m.series_name_ar || '',
    category: m.category || 'Movies',
    categoryAr: m.category_ar || 'أفلام',
    genres: m.genres || [],
    genreBadge: m.genre_badge || 'متميز',
    quality: m.quality || '1080p FHD',
    releaseYear: m.release_year ? String(m.release_year) : new Date().getFullYear().toString(),
    releaseDate: m.release_date || '',
    rating: m.rating || 8.0,
    viewsCount: m.views_count ? String(m.views_count) : '1500',
    tags: m.tags || [],
    triviaAr: m.trivia_ar || [],
    isFeatured: Boolean(m.is_featured),
    tmdbId: m.tmdb_id || undefined,
    createdAt: m.created_at || new Date().toISOString()
  };
}

// Helper: Map MovieItem to DB snake_case
function mapMovieItemToDb(movie: Partial<MovieItem>) {
  return {
    id: movie.id,
    original_title: movie.originalTitle || null,
    title_ar: movie.titleAr,
    title_en: movie.titleEn || null,
    description_ar: movie.descriptionAr || '',
    description_en: movie.descriptionEn || null,
    thumbnail: movie.thumbnail || movie.posterUrl,
    poster_url: movie.posterUrl || movie.thumbnail,
    backdrop_url: movie.backdropUrl || movie.posterUrl || movie.thumbnail,
    embed_url: movie.embedUrl || '',
    video_sources: movie.videoSources || [],
    subtitles: movie.subtitles || [],
    youtube_id: movie.youtubeId || null,
    trailer_url: movie.trailerUrl || null,
    series_id: movie.seriesId || null,
    series_name_ar: movie.seriesNameAr || null,
    category: movie.category || 'Movies',
    category_ar: movie.categoryAr || 'أفلام',
    genres: movie.genres || [],
    genre_badge: movie.genreBadge || 'متميز',
    quality: movie.quality || '1080p FHD',
    release_year: movie.releaseYear ? parseInt(movie.releaseYear, 10) : new Date().getFullYear(),
    release_date: movie.releaseDate || null,
    rating: movie.rating || 8.0,
    views_count: movie.viewsCount ? parseInt(movie.viewsCount, 10) : 100,
    tags: movie.tags || [],
    trivia_ar: movie.triviaAr || [],
    is_featured: Boolean(movie.isFeatured),
    tmdb_id: movie.tmdbId || null
  };
}

// ==========================================
// 2. MOVIES CRUD API
// ==========================================
export async function fetchMoviesApi(): Promise<MovieItem[]> {
  if (!isSupabaseConfigured || !supabase) return [];

  try {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed fetching movies:', error);
      return [];
    }

    return (data || []).map(mapDbToMovieItem);
  } catch (err) {
    console.error('Error fetching movies:', err);
    return [];
  }
}

export async function saveMovieApi(movie: Partial<MovieItem>): Promise<{ success: boolean; data?: MovieItem; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase غير متصل' };
  }

  try {
    const payload = mapMovieItemToDb(movie);
    const { data, error } = await supabase
      .from('movies')
      .upsert([payload])
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: mapDbToMovieItem(data) };
  } catch (err: any) {
    return { success: false, error: err.message || 'فشل حفظ العمل' };
  }
}

export async function deleteMovieApi(movieId: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase غير متصل' };
  }

  try {
    const { error } = await supabase
      .from('movies')
      .delete()
      .eq('id', movieId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'فشل حذف الفيلم' };
  }
}

// ==========================================
// 3. EPISODES CRUD & BULK API
// ==========================================
export async function fetchEpisodesApi(seriesId?: string, seasonNumber?: number): Promise<EpisodeItem[]> {
  if (!isSupabaseConfigured || !supabase) return [];

  try {
    let query = supabase.from('episodes').select('*').order('episode_number', { ascending: true });

    if (seriesId) {
      query = query.eq('series_id', seriesId);
    }
    if (seasonNumber) {
      query = query.eq('season_number', seasonNumber);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Failed fetching episodes:', error);
      return [];
    }

    return (data || []).map(e => ({
      id: e.id,
      seriesId: e.series_id,
      seriesNameAr: e.series_name_ar || '',
      seasonNumber: e.season_number || 1,
      episodeNumber: e.episode_number,
      title: e.title || `الحلقة ${e.episode_number}`,
      videoUrl: e.video_url || e.embed_url || '',
      embedUrl: e.embed_url || e.video_url || '',
      videoSources: e.video_sources || [],
      description: e.description || '',
      posterUrl: e.poster_url || '',
      backdropUrl: e.backdrop_url || '',
      releaseYear: e.release_year ? String(e.release_year) : new Date().getFullYear().toString(),
      categoryAr: e.category_ar || 'مسلسلات',
      rating: e.rating || 8.0,
      published: e.published !== false,
      createdAt: e.created_at || new Date().toISOString()
    }));
  } catch (err) {
    console.error('Error fetching episodes:', err);
    return [];
  }
}

export async function saveEpisodeApi(episode: Partial<EpisodeItem>): Promise<{ success: boolean; data?: EpisodeItem; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase غير متصل' };
  }

  try {
    const payload = {
      ...(episode.id ? { id: episode.id } : {}),
      series_id: episode.seriesId,
      series_name_ar: episode.seriesNameAr || null,
      season_number: episode.seasonNumber || 1,
      episode_number: episode.episodeNumber,
      title: episode.title,
      embed_url: episode.embedUrl || episode.videoUrl || '',
      video_url: episode.videoUrl || episode.embedUrl || '',
      video_sources: episode.videoSources || [],
      description: episode.description || '',
      poster_url: episode.posterUrl || null,
      backdrop_url: episode.backdropUrl || null,
      release_year: episode.releaseYear ? parseInt(episode.releaseYear, 10) : new Date().getFullYear(),
      category_ar: episode.categoryAr || 'مسلسلات',
      rating: episode.rating || 8.0,
      published: episode.published !== false
    };

    const { data, error } = await supabase
      .from('episodes')
      .upsert([payload])
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      data: {
        id: data.id,
        seriesId: data.series_id,
        seriesNameAr: data.series_name_ar,
        seasonNumber: data.season_number,
        episodeNumber: data.episode_number,
        title: data.title,
        embedUrl: data.embed_url,
        videoUrl: data.video_url,
        description: data.description,
        posterUrl: data.poster_url,
        backdropUrl: data.backdrop_url,
        published: data.published
      }
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'فشل حفظ الحلقة' };
  }
}

export async function bulkUpsertEpisodesApi(
  episodes: Partial<EpisodeItem>[],
  onProgress?: (processed: number, total: number) => void
): Promise<{ total: number; inserted: number; failed: number; errors: any[] }> {
  let inserted = 0;
  let failed = 0;
  const errors: any[] = [];

  for (let i = 0; i < episodes.length; i++) {
    const ep = episodes[i];
    const res = await saveEpisodeApi(ep);
    if (res.success) {
      inserted++;
    } else {
      failed++;
      errors.push({ episodeNumber: ep.episodeNumber, error: res.error });
    }
    if (onProgress) {
      onProgress(i + 1, episodes.length);
    }
  }

  return { total: episodes.length, inserted, failed, errors };
}

export async function deleteEpisodeApi(episodeId: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return { success: false, error: 'Supabase غير متصل' };
  }

  try {
    const { error } = await supabase.from('episodes').delete().eq('id', episodeId);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'فشل حذف الحلقة' };
  }
}

// ==========================================
// 4. CATEGORIES CRUD API
// ==========================================
export async function fetchCategoriesApi(): Promise<Category[]> {
  if (!isSupabaseConfigured || !supabase) return defaultCategories;

  try {
    const { data, error } = await supabase.from('categories').select('*').order('name_ar', { ascending: true });
    if (error || !data || data.length === 0) return defaultCategories;

    return data.map(c => ({
      id: c.id,
      nameAr: c.name_ar,
      nameEn: c.name_en || '',
      icon: c.icon || 'film',
      description: c.description || ''
    }));
  } catch {
    return defaultCategories;
  }
}

const defaultCategories: Category[] = [
  { id: 'movies', nameAr: 'أفلام سينمائية', nameEn: 'Movies', icon: 'film', description: 'أحدث الأفلام العربية والأجنبية' },
  { id: 'series', nameAr: 'مسلسلات', nameEn: 'Series', icon: 'tv', description: 'مسلسلات رمضان والدراما العالمية' },
  { id: 'anime', nameAr: 'أنمي وكرتون', nameEn: 'Anime', icon: 'sparkles', description: 'أفلام ومسلسلات الأنمي المترجمة والمدبلجة' },
  { id: 'trending', nameAr: 'الأكثر مشاهدة', nameEn: 'Trending', icon: 'flame', description: 'الأعمال الأكثر شعبية وتصدراً' }
];

export async function saveCategoryApi(cat: Partial<Category>): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) return { success: false, error: 'Supabase غير متصل' };

  try {
    const payload = {
      id: cat.id || cat.nameAr?.toLowerCase().replace(/\s+/g, '-'),
      name_ar: cat.nameAr,
      name_en: cat.nameEn || null,
      icon: cat.icon || 'film',
      description: cat.description || null
    };

    const { error } = await supabase.from('categories').upsert([payload]);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'فشل حفظ التصنيف' };
  }
}

export async function deleteCategoryApi(id: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) return { success: false, error: 'Supabase غير متصل' };

  try {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'فشل حذف التصنيف' };
  }
}

// ==========================================
// 5. USERS PROFILES API
// ==========================================
export async function fetchUsersApi(): Promise<User[]> {
  if (!isSupabaseConfigured || !supabase) return [];

  try {
    const { data, error } = await supabase.from('users_profiles').select('*').order('created_at', { ascending: false });
    if (error) return [];

    return (data || []).map(u => ({
      id: u.id,
      username: u.username || 'مستخدم',
      email: u.email || '',
      role: u.role || 'user',
      avatar: u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.id}`,
      favorites: u.favorites || [],
      watched: u.watched || [],
      watchHistory: u.watch_history || {},
      createdAt: u.created_at || new Date().toISOString()
    }));
  } catch {
    return [];
  }
}

// ==========================================
// 6. IMAGE HOSTING & EXTRACTION UTILITIES
// ==========================================
export function extractDirectImageUrl(rawUrl: string): string {
  if (!rawUrl) return '';
  const url = rawUrl.trim();

  // YouTube thumbnail
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return `https://img.youtube.com/vi/${ytMatch[1]}/maxresdefault.jpg`;
  }

  // Google Drive Image Direct Link
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (driveMatch && driveMatch[1]) {
    return `https://lh3.googleusercontent.com/u/0/d/${driveMatch[1]}=w1000`;
  }

  return url;
}

export async function uploadImageToPublicHostApi(
  file: File,
  _type: 'poster' | 'backdrop' = 'poster',
  customApiKey = 'e9e89619f148fc6d25c412c38bd47977'
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const formData = new FormData();
    formData.append('image', file);

    const apiKey = customApiKey || 'e9e89619f148fc6d25c412c38bd47977';
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (data.success && data.data?.url) {
      return { success: true, url: data.data.url };
    }

    // Fallback if ImgBB fails: convert to base64 Data URL or blob URL
    const reader = new FileReader();
    return new Promise((resolve) => {
      reader.onload = (e) => {
        resolve({ success: true, url: e.target?.result as string });
      };
      reader.onerror = () => {
        resolve({ success: false, error: 'فشل قراءة ملف الصورة' });
      };
      reader.readAsDataURL(file);
    });
  } catch (err: any) {
    return { success: false, error: err.message || 'خطأ في رفع الصورة' };
  }
}

export const fetchUsersProfilesApi = fetchUsersApi;

export async function sendTelegramNotificationApi(
  message: string,
  botToken?: string,
  chatId?: string
): Promise<{ success: boolean; error?: string }> {
  const token = botToken || import.meta.env.VITE_TELEGRAM_BOT_TOKEN;
  const chat = chatId || import.meta.env.VITE_TELEGRAM_CHAT_ID;

  if (!token || !chat) {
    return { success: false, error: 'Telegram Bot Token أو Chat ID غير متوفر' };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text: message, parse_mode: 'HTML' })
    });
    const data = await res.json();
    if (data.ok) return { success: true };
    return { success: false, error: data.description || 'فشل إرسال رسالة تليجرام' };
  } catch (err: any) {
    return { success: false, error: err.message || 'خطأ في الاتصال بسيرفر تليجرام' };
  }
}

export async function updateSeriesImagesApi(
  seriesId: string,
  posterUrl: string,
  backdropUrl: string,
  seriesNameAr = ''
): Promise<{ success: boolean; updatedCount?: number }> {
  if (!isSupabaseConfigured || !supabase) return { success: false };

  try {
    const updatePayload: any = {};
    if (posterUrl) updatePayload.poster_url = posterUrl;
    if (backdropUrl) updatePayload.backdrop_url = backdropUrl;
    if (seriesNameAr) updatePayload.series_name_ar = seriesNameAr;

    const { data, error } = await supabase
      .from('episodes')
      .update(updatePayload)
      .eq('series_id', seriesId)
      .select();

    if (error) return { success: false };
    return { success: true, updatedCount: data?.length || 0 };
  } catch {
    return { success: false };
  }
}
