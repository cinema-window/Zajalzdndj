import React, { useState, useEffect, useMemo } from 'react';
import { Tv, Plus, Search, Layers, RefreshCw, ExternalLink } from 'lucide-react';
import { fetchMoviesApi } from '../services/apiService';
import { MovieItem, AdminRoute } from '../types';

interface SeriesProps {
  onNavigate: (route: AdminRoute) => void;
}

export const Series: React.FC<SeriesProps> = ({ onNavigate }) => {
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setLoading(true);
    const data = await fetchMoviesApi();
    setMovies(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Group items by seriesId or show series category
  const seriesGroups = useMemo(() => {
    const map = new Map<string, { id: string; nameAr: string; count: number; poster: string; backdrop: string }>();

    movies.forEach((m) => {
      const isSeries = m.categoryAr === 'مسلسلات' || m.category === 'Series' || Boolean(m.seriesId);
      if (isSeries) {
        const sId = m.seriesId || m.id;
        const sName = m.seriesNameAr || m.titleAr;
        if (!map.has(sId)) {
          map.set(sId, {
            id: sId,
            nameAr: sName,
            count: 1,
            poster: m.posterUrl || m.thumbnail,
            backdrop: m.backdropUrl || ''
          });
        } else {
          const current = map.get(sId)!;
          current.count += 1;
        }
      }
    });

    return Array.from(map.values()).filter(s =>
      s.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [movies, searchQuery]);

  return (
    <div className="space-y-6 dir-rtl text-right">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center font-bold">
            <Tv className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">إدارة المسلسلات والسيرايز</h2>
            <p className="text-xs text-slate-400">نظرة عامة على كافة المسلسلات المسجلة وإدارة حلقاتها ومواسمها</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-2xl transition-all border border-slate-700 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => onNavigate('episodes')}
            className="px-5 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-400 hover:to-purple-500 text-white font-black text-xs rounded-2xl shadow-xl shadow-purple-500/20 transition-all cursor-pointer flex items-center gap-2"
          >
            <Layers className="w-4 h-4" />
            <span>الانتقال لإدارة الحلقات واستيراد TXT</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث باسم المسلسل أو معرّف المسلسل (Series ID)..."
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 pr-10 text-xs text-white focus:outline-none focus:border-purple-500"
        />
        <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5" />
      </div>

      {/* Series Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
          <span>جاري تحميل بيانات المسلسلات...</span>
        </div>
      ) : seriesGroups.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
          <Tv className="w-12 h-12 mx-auto text-slate-600" />
          <h3 className="text-base font-bold text-white">لا توجد مسلسلات مسجلة حالياً</h3>
          <p className="text-xs text-slate-500">يمكنك إضافة مسلسل جديد من خلال إضافة عمل جديد واختيار تصنيف مسلسلات</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {seriesGroups.map((s) => (
            <div
              key={s.id}
              className="bg-slate-900 border border-slate-800 hover:border-purple-500/40 rounded-3xl p-4 space-y-3 transition-all shadow-xl group flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="aspect-[16/9] rounded-2xl bg-slate-950 overflow-hidden relative border border-slate-800">
                  <img
                    src={s.poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200'}
                    alt={s.nameAr}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200';
                    }}
                  />
                  <div className="absolute top-2 right-2 bg-purple-600 text-white font-black text-[10px] px-2 py-0.5 rounded-full shadow-md">
                    Series ID: {s.id}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-black text-white truncate">{s.nameAr}</h3>
                  <span className="text-xs text-purple-400 font-bold block pt-1">
                    {s.count} عمل / حلقة مسجلة
                  </span>
                </div>
              </div>

              <button
                onClick={() => onNavigate('episodes')}
                className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 text-purple-300 border border-slate-800 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>إدارة حلقات المسلسل</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
