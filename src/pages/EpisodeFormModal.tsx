import React, { useState, useEffect } from 'react';
import { X, Save, Layers, Sparkles, RefreshCw } from 'lucide-react';
import { EpisodeItem } from '../types';
import { ImageToUrlConverter } from '../components/ImageToUrlConverter';

interface EpisodeFormModalProps {
  isOpen: boolean;
  initialData?: EpisodeItem | null;
  onSave: (episode: Partial<EpisodeItem>) => Promise<void>;
  onClose: () => void;
}

export const EpisodeFormModal: React.FC<EpisodeFormModalProps> = ({
  isOpen,
  initialData,
  onSave,
  onClose,
}) => {
  const [formData, setFormData] = useState<Partial<EpisodeItem>>({
    seriesId: '',
    seriesNameAr: '',
    seasonNumber: 1,
    episodeNumber: 1,
    title: '',
    embedUrl: '',
    posterUrl: '',
    backdropUrl: '',
    published: true,
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        seriesId: 'digital-circus',
        seriesNameAr: 'السيرك الرقمي',
        seasonNumber: 1,
        episodeNumber: 1,
        title: 'الحلقة 1',
        embedUrl: '',
        posterUrl: '',
        backdropUrl: '',
        published: true,
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.seriesId || !formData.title || !formData.episodeNumber) {
      setErrorMsg('يرجى تعبئة جميع الحقول المطلوبة (معرف المسلسل ورقم الحلقة والعنوان)');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      await onSave(formData);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'فشل حفظ الحلقة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md dir-rtl">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 text-right">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white">
                {initialData ? 'تعديل الحلقة' : 'إضافة حلقة منفردة جديدة'}
              </h3>
              <p className="text-xs text-slate-400">تعديل بيانات الحلقة ورابط المشغل والصورة</p>
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
              <label className="text-xs font-bold text-slate-300 block mb-1">معرّف المسلسل الإنجليزي (Series ID) *</label>
              <input
                type="text"
                required
                value={formData.seriesId || ''}
                onChange={(e) => setFormData({ ...formData, seriesId: e.target.value })}
                placeholder="digital-circus"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">اسم المسلسل بالعربية</label>
              <input
                type="text"
                value={formData.seriesNameAr || ''}
                onChange={(e) => setFormData({ ...formData, seriesNameAr: e.target.value })}
                placeholder="السيرك الرقمي"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">رقم الموسم (Season)</label>
              <input
                type="number"
                min={1}
                value={formData.seasonNumber || 1}
                onChange={(e) => setFormData({ ...formData, seasonNumber: parseInt(e.target.value) || 1 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-amber-400 font-bold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">رقم الحلقة (Episode Number) *</label>
              <input
                type="number"
                min={1}
                required
                value={formData.episodeNumber || 1}
                onChange={(e) => setFormData({ ...formData, episodeNumber: parseInt(e.target.value) || 1 })}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-amber-400 font-bold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-300 block mb-1">عنوان الحلقة *</label>
              <input
                type="text"
                required
                value={formData.title || ''}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="الحلقة 1 - البداية"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1">رابط مشغل الفيديو (Embed URL)</label>
            <input
              type="text"
              value={formData.embedUrl || formData.videoUrl || ''}
              onChange={(e) => setFormData({ ...formData, embedUrl: e.target.value, videoUrl: e.target.value })}
              placeholder="https://..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-amber-400 font-mono focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="pt-2">
            <span className="text-xs font-bold text-amber-400 block mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              <span>رفع أو استخراج صور الحلقة:</span>
            </span>
            <ImageToUrlConverter
              initialPosterUrl={formData.posterUrl}
              initialBackdropUrl={formData.backdropUrl}
              onApplyUrls={({ posterUrl, backdropUrl }) => {
                setFormData(prev => ({
                  ...prev,
                  posterUrl: posterUrl || prev.posterUrl,
                  backdropUrl: backdropUrl || prev.backdropUrl
                }));
              }}
            />
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
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 text-white font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>حفظ الحلقة</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
