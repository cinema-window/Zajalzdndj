import React, { useState } from 'react';
import { Sparkles, Search, Download, Star, RefreshCw, CheckCircle2 } from 'lucide-react';
import { searchTmdbMovies, fetchTmdbMovieDetails } from '../services/tmdbService';
import { saveMovieApi } from '../services/apiService';
import { MovieItem } from '../types';

export const TmdbImport: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [importedIds, setImportedIds] = useState<Set<number>>(new Set());
  const [statusMsg, setStatusMsg] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setStatusMsg('');
    const items = await searchTmdbMovies(query);
    setResults(items);
    setLoading(false);
    if (items.length === 0) {
      setStatusMsg('لم يتم العثور على نتائج تطابق البحث في TMDB');
    }
  };

  const handleImportSingle = async (item: any) => {
    setLoading(true);
    setStatusMsg(`جاري جلب كامل التفاصيل والبوسترات لفيلم (${item.title || item.name})...`);

    try {
      const details = await fetchTmdbMovieDetails(item.id, item.media_type || 'movie');
      if (details) {
        const payload: Partial<MovieItem> = {
          titleAr: details.titleAr || item.title || item.name,
          titleEn: details.titleEn || item.original_title || item.original_name,
          descriptionAr: details.descriptionAr || item.overview,
          descriptionEn: item.overview,
          releaseYear: details.releaseYear || (item.release_date || item.first_air_date || '').substring(0, 4),
          rating: item.vote_average ? parseFloat(item.vote_average.toFixed(1)) : 8.0,
          posterUrl: details.posterUrl,
          backdropUrl: details.backdropUrl,
          thumbnail: details.posterUrl,
          categoryAr: item.media_type === 'tv' ? 'مسلسلات' : 'أفلام سينمائية',
          embedUrl: 'https://www.youtube.com/embed/HwAPLk_sQ3w', // default player placeholder
          published: true,
        };

        const res = await saveMovieApi(payload);
        if (res.success) {
          setImportedIds(prev => new Set(prev).add(item.id));
          setStatusMsg(`✅ تم استيراد ونشر (${payload.titleAr}) بنجاح في قاعدة بيانات Supabase!`);
        } else {
          setStatusMsg(`❌ فشل استيراد العمل: ${res.error}`);
        }
      } else {
        setStatusMsg('❌ تعذر جلب تفاصيل العمل من TMDB');
      }
    } catch (err: any) {
      setStatusMsg(`❌ حدث خطأ: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 dir-rtl text-right">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/10 via-slate-900 to-slate-900 border border-purple-500/20 rounded-3xl p-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center flex-shrink-0 shadow-lg">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>استيراد المحتوى الذكي من TMDB (The Movie Database)</span>
              <span className="text-[10px] bg-purple-500/20 text-purple-400 px-2.5 py-0.5 rounded-full border border-purple-500/30 font-bold">
                ترجمة أوتوماتيكية للقصة بالعربية
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              ابحث باسم أي فيلم أو مسلسل عالمي لجلب البوستر بجودة عالية، الوصف بالعربية، التقييم، وتاريخ الإنتاج بضغطة زر.
            </p>
          </div>
        </div>
      </div>

      {/* Search Input Form */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ادخل اسم الفيلم أو المسلسل (مثال: Batman, Oppenheimer, Spider-Man)..."
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-5 py-4 pr-12 text-xs text-white focus:outline-none focus:border-purple-500 shadow-xl"
          />
          <Search className="w-5 h-5 text-slate-500 absolute right-4 top-4" />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-black text-xs rounded-2xl shadow-xl shadow-purple-600/20 transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 flex-shrink-0"
        >
          {loading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>جاري البحث...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>بحث في TMDB</span>
            </>
          )}
        </button>
      </form>

      {statusMsg && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-purple-300 font-bold">
          {statusMsg}
        </div>
      )}

      {/* Results Grid */}
      {results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 pt-2">
          {results.map((item) => {
            const isImported = importedIds.has(item.id);
            const poster = item.poster_path
              ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
              : 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800';

            return (
              <div
                key={item.id}
                className="bg-slate-900 border border-slate-800 hover:border-purple-500/40 rounded-3xl p-3 space-y-3 transition-all flex flex-col justify-between shadow-xl group"
              >
                <div className="space-y-2">
                  <div className="aspect-[2/3] rounded-2xl overflow-hidden bg-slate-950 relative border border-slate-800">
                    <img
                      src={poster}
                      alt={item.title || item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-md text-amber-400 font-black text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 border border-slate-800">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span>{item.vote_average ? item.vote_average.toFixed(1) : '8.0'}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-black text-white truncate">{item.title || item.name}</h3>
                    <p className="text-[10px] text-slate-400 truncate">
                      {item.release_date || item.first_air_date || 'سنة غير محددة'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleImportSingle(item)}
                  disabled={loading || isImported}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    isImported
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-lg'
                  }`}
                >
                  {isImported ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>تم الاستيراد</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>استيراد لموقعك</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
