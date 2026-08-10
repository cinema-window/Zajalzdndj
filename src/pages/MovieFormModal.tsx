import React, { useState, useEffect } from 'react';
import { X, Save, Film, Sparkles, RefreshCw } from 'lucide-react';
import { MovieItem } from '../types';
import { ImageToUrlConverter } from '../components/ImageToUrlConverter';

interface MovieFormModalProps {
  isOpen: boolean;
  initialData?: MovieItem | null;
  onSave: (movie: Partial<MovieItem>) => Promise<void>;
  onClose: () => void;
}

export const MovieFormModal: React.FC<MovieFormModalProps> = ({
  isOpen,
  initialData,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<Partial<MovieItem>>({
    titleAr: '',
    titleEn: '',
    descriptionAr: '',
    descriptionEn: '',
    category: 'Movies',
    categoryAr: 'أفلام سينمائية',
    releaseYear: new Date().getFullYear().toString(),
    rating: 8.0,
    quality: '1080p FHD',
    embedUrl: '',
    posterUrl: '',
    backdropUrl: '',
    thumbnail: '',
    genres: ['دراما'],
    tags: ['سينما'],
    isFeatured: true,
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        id: `movie-${Date.now()}`,
        titleAr: '',
        titleEn: '',
        descriptionAr: '',
        descriptionEn: '',
        category: 'Movies',
        categoryAr: 'أفلام سينمائية',
        releaseYear: new Date().getFullYear().toString(),
        rating: 8.5,
        quality: '1080p FHD',
        embedUrl: '',
        posterUrl: '',
        backdropUrl: '',
        thumbnail: '',
        genres: ['دراما'],
        tags: ['سينما'],
        isFeatured: true,
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titleAr) {
      setErrorMsg('عنوان العمل بالعربية مطلوب');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل حفظ العمل في قاعدة البيانات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md dir-rtl">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 text-right">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {initialData ? 'تعديل العمل السينمائي' : 'إضافة فيلم سينمائي جديد'}
              </h3>
              <p className="text-xs text-slate-400">إدخال البيانات والميديا ورابط العرض</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">العنوان بالعربية *</label>
              <input
                type="text"
                required
                value={formData.titleAr || ''}
                onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                placeholder="مثال: فيلم الإنتقام"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">العنوان بالإنجليزية</label>
              <input
                type="text"
                value={formData.titleEn || ''}
                onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                placeholder="The Revenge"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">التصنيف الرئيسي</label>
              <select
                value={formData.categoryAr || 'أفلام سينمائية'}
                onChange={(e) => setFormData({ ...formData, categoryAr: e.target.value, category: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              >
                <option value="أفلام سينمائية">أفلام سينمائية</option>
                <option value="أفلام أكشن">أفلام أكشن</option>

                <option value="مسلسلات">مسلسلات</option>
                <option value="أنمي">أنمي وكرتون</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">سنة الإنتاج</label>
              <input
                type="text"
                value={formData.releaseYear || ''}
                onChange={(e) => setFormData({ ...formData, releaseYear: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">التقييم (0.0 - 10.0)</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="10"
                value={formData.rating || 8.0}
                onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 8.0 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">رابط مشغل الفيديو / Embed URL *</label>
            <input
              type="text"
              required
              value={formData.embedUrl || ''}
              onChange={(e) => setFormData({ ...formData, embedUrl: e.target.value })}
              placeholder="https://www.youtube.com/embed/... أو رابط السيرفر المباشر"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-amber-400 font-mono focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">الوصف بالعربية</label>
            <textarea
              rows={3}
              value={formData.descriptionAr || ''}
              onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
              placeholder="قصة الفيلم وتفاصيل العرض..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* ImgBB Image Uploader Widget */}
          <div className="pt-2">
            <span className="text-xs font-bold text-amber-400 block mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>رفع أو استخراج صور البوستر والخلفية:</span>
            </span>
            <ImageToUrlConverter
              initialPosterUrl={formData.posterUrl}
              initialBackdropUrl={formData.backdropUrl}
              onApplyUrls={({ posterUrl, backdropUrl }) => {
                setFormData(prev => ({
                  ...prev,
                  posterUrl: posterUrl || prev.posterUrl,
                  thumbnail: posterUrl || prev.thumbnail,
                  backdropUrl: backdropUrl || prev.backdropUrl
                }));
              }}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">رابط صورة البوستر (Poster URL)</label>
              <input
                type="text"
                value={formData.posterUrl || ''}
                onChange={(e) => setFormData({ ...formData, posterUrl: e.target.value, thumbnail: e.target.value })}
                placeholder="https://i.ibb.co/..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">رابط صورة الخلفية (Backdrop URL)</label>
              <input
                type="text"
                value={formData.backdropUrl || ''}
                onChange={(e) => setFormData({ ...formData, backdropUrl: e.target.value })}
                placeholder="https://i.ibb.co/..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>حفظ العمل الآن</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
