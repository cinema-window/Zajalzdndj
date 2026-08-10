import React, { useState, useEffect, useMemo } from 'react';
import {
  Film,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  RefreshCw,
  Sparkles,
  ExternalLink,
  Star
} from 'lucide-react';
import { fetchMoviesApi, saveMovieApi, deleteMovieApi } from '../services/apiService';
import { MovieItem } from '../types';
import { MovieFormModal } from './MovieFormModal';
import { ConfirmModal } from '../components/ConfirmModal';

export const Movies: React.FC = () => {
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<MovieItem | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadMovies = async () => {
    setLoading(true);
    const data = await fetchMoviesApi();
    setMovies(data);
    setLoading(false);
  };

  useEffect(() => {
    loadMovies();
  }, []);

  const filteredMovies = useMemo(() => {
    return movies.filter((m) => {
      const matchesSearch =
        m.titleAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.titleEn && m.titleEn.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (m.releaseYear && m.releaseYear.includes(searchQuery));

      const matchesCat =
        selectedCategory === 'ALL' || m.categoryAr === selectedCategory || m.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [movies, searchQuery, selectedCategory]);

  const handleSaveMovie = async (movieData: Partial<MovieItem>) => {
    const res = await saveMovieApi(movieData);
    if (!res.success) {
      throw new Error(res.error || 'فشل حفظ الفيلم');
    }
    await loadMovies();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    const res = await deleteMovieApi(deletingId);
    setIsDeleting(false);
    setDeletingId(null);
    if (res.success) {
      await loadMovies();
    } else {
      alert(res.error || 'فشل حذف الفيلم');
    }
  };

  return (
    <div className="space-y-6 dir-rtl text-right">
      
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">إدارة الأفلام والأعمال السينمائية</h2>
            <p className="text-xs text-slate-400">إضافة وتعديل وحذف كافة الأفلام المسجلة بـ Supabase ({movies.length} عمل)</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadMovies}
            disabled={loading}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-2xl transition-all border border-slate-700 cursor-pointer"
            title="تحديث قائمة الأفلام"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => {
              setEditingMovie(null);
              setIsFormOpen(true);
            }}
            className="px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-2xl shadow-xl shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة فيلم سينمائي جديد</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
        {/* Search input */}
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث برقم السنة أو العنوان بالعربي أو الإنجليزي..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 pr-10 text-xs text-white focus:outline-none focus:border-amber-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-3" />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500 w-full md:w-48"
          >
            <option value="ALL">جميع التصنيفات</option>
            <option value="أفلام سينمائية">أفلام سينمائية</option>
            <option value="مسلسلات">مسلسلات</option>
            <option value="أنمي">أنمي وكرتون</option>
          </select>
        </div>
      </div>

      {/* Movies Table / Cards Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
          <span>جاري جلب قائمة الأفلام من قاعدة البيانات...</span>
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
          <Film className="w-12 h-12 mx-auto text-slate-600" />
          <h3 className="text-base font-bold text-white">لم يتم العثور على أية أفلام تطابق البحث</h3>
          <p className="text-xs text-slate-500">جرب كتابة كلمات مختلفة أو اضغط لإضافة فيلم جديد</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMovies.map((m) => (
            <div
              key={m.id}
              className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-3xl p-4 space-y-3 transition-all flex flex-col justify-between shadow-xl group"
            >
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-20 h-28 rounded-2xl bg-slate-950 overflow-hidden flex-shrink-0 relative border border-slate-800">
                    <img
                      src={m.posterUrl || m.thumbnail}
                      alt={m.titleAr}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800';
                      }}
                    />
                    <div className="absolute top-1 right-1 bg-amber-500 text-slate-950 font-black text-[9px] px-1.5 py-0.5 rounded">
                      {m.releaseYear}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="text-sm font-black text-white truncate">{m.titleAr}</h3>
                    {m.titleEn && <p className="text-[11px] text-slate-400 truncate">{m.titleEn}</p>}

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="bg-slate-950 text-amber-400 border border-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {m.categoryAr || 'فيلم'}
                      </span>
                      <span className="bg-slate-950 text-emerald-400 border border-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                        <span>{m.rating || 8.0}</span>
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2 pt-1 leading-relaxed">
                      {m.descriptionAr || 'لا يوجد وصف مسجل'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                {m.embedUrl && (
                  <a
                    href={m.embedUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-amber-400 rounded-xl transition-all text-[11px] font-bold flex items-center gap-1"
                    title="معاينة رابط المشغل"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>المشغل</span>
                  </a>
                )}

                <div className="flex items-center gap-2 mr-auto">
                  <button
                    onClick={() => {
                      setEditingMovie(m);
                      setIsFormOpen(true);
                    }}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5 text-amber-400" />
                    <span>تعديل</span>
                  </button>

                  <button
                    onClick={() => setDeletingId(m.id)}
                    className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl transition-all cursor-pointer"
                    title="حذف الفيلم"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <MovieFormModal
        isOpen={isFormOpen}
        initialData={editingMovie}
        onSave={handleSaveMovie}
        onClose={() => {
          setIsFormOpen(false);
          setEditingMovie(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        title="تأكيد حذف الفيلم"
        message="هل أنت تأكد من رغبتك في حذف هذا الفيلم نهائياً من قاعدة بيانات Supabase؟ لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="حذف الفيلم نهائياً"
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingId(null)}
        isDeleting={isDeleting}
      />

    </div>
  );
};
