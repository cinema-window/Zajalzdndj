import React, { useState, useEffect } from 'react';
import {
  Layers,
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  RefreshCw,
  Tv,
  ExternalLink
} from 'lucide-react';
import { fetchEpisodesApi, saveEpisodeApi, deleteEpisodeApi, fetchMoviesApi } from '../services/apiService';
import { EpisodeItem, MovieItem } from '../types';
import { EpisodeFormModal } from './EpisodeFormModal';
import { TxtEpisodeImporter } from '../components/TxtEpisodeImporter';
import { ConfirmModal } from '../components/ConfirmModal';

export const Episodes: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'txt-importer'>('list');

  const [episodes, setEpisodes] = useState<EpisodeItem[]>([]);
  const [movies, setMovies] = useState<MovieItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSeriesId, setSelectedSeriesId] = useState<string>('digital-circus');
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<EpisodeItem | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadEpisodes = async () => {
    setLoading(true);
    const data = await fetchEpisodesApi(selectedSeriesId, selectedSeason);
    setEpisodes(data);
    setLoading(false);
  };

  const loadMovies = async () => {
    const data = await fetchMoviesApi();
    setMovies(data);
  };

  useEffect(() => {
    loadMovies();
  }, []);

  useEffect(() => {
    loadEpisodes();
  }, [selectedSeriesId, selectedSeason]);

  const handleSaveEpisode = async (data: Partial<EpisodeItem>) => {
    const res = await saveEpisodeApi(data);
    if (!res.success) {
      throw new Error(res.error || 'فشل حفظ الحلقة');
    }
    await loadEpisodes();
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    const res = await deleteEpisodeApi(deletingId);
    setIsDeleting(false);
    setDeletingId(null);
    if (res.success) {
      await loadEpisodes();
    } else {
      alert(res.error || 'فشل حذف الحلقة');
    }
  };

  const filteredEpisodes = episodes.filter((ep) =>
    ep.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(ep.episodeNumber).includes(searchQuery)
  );

  return (
    <div className="space-y-6 dir-rtl text-right">
      
      {/* Top Banner & Tab Toggle */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">إدارة الحلقات والاستيراد الجماعي</h2>
            <p className="text-xs text-slate-400">إدارة حلقات المسلسلات أو استيراد مئات الحلقات دفعة واحدة عبر ملف TXT</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'list'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Tv className="w-4 h-4" />
            <span>قائمة الحلقات المسجلة</span>
          </button>

          <button
            onClick={() => setActiveTab('txt-importer')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'txt-importer'
                ? 'bg-amber-500 text-slate-950 font-black shadow-lg'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>أداة استيراد TXT الجماعية ⚡</span>
          </button>
        </div>
      </div>

      {/* Tab 1: Episodes List View */}
      {activeTab === 'list' && (
        <div className="space-y-6">
          
          {/* Controls Bar */}
          <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <label className="text-xs font-bold text-slate-300">المسلسل:</label>
              <input
                type="text"
                value={selectedSeriesId}
                onChange={(e) => setSelectedSeriesId(e.target.value)}
                placeholder="digital-circus"
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 font-mono w-40"
              />

              <label className="text-xs font-bold text-slate-300">الموسم:</label>
              <input
                type="number"
                min={1}
                value={selectedSeason}
                onChange={(e) => setSelectedSeason(Math.max(1, parseInt(e.target.value) || 1))}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-400 font-bold focus:outline-none focus:border-blue-500 w-20"
              />

              <button
                onClick={loadEpisodes}
                disabled={loading}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-blue-400 rounded-xl transition-all border border-slate-700 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث برقم أو عنوان الحلقة..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 pr-9 text-xs text-white focus:outline-none focus:border-blue-500"
                />
                <Search className="w-4 h-4 text-slate-500 absolute right-3 top-2.5" />
              </div>

              <button
                onClick={() => {
                  setEditingEpisode(null);
                  setIsFormOpen(true);
                }}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                <span>إضافة حلقة جديدة</span>
              </button>
            </div>

          </div>

          {/* Episodes Table */}
          {loading ? (
            <div className="text-center py-16 text-slate-400 text-xs flex flex-col items-center gap-3">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
              <span>جاري تحميل الحلقات من Supabase...</span>
            </div>
          ) : filteredEpisodes.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
              <Layers className="w-12 h-12 mx-auto text-slate-600" />
              <h3 className="text-base font-bold text-white">لا توجد حلقات للمسلسل ({selectedSeriesId}) - الموسم {selectedSeason}</h3>
              <p className="text-xs text-slate-500">يمكنك الضغط على أداة استيراد TXT الجماعية لاستيراد كافة الحلقات بضغطة زر</p>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold">
                  <tr>
                    <th className="p-4 w-20">الحلقة</th>
                    <th className="p-4">العنوان</th>
                    <th className="p-4">المسلسل</th>
                    <th className="p-4">رابط المشغل</th>
                    <th className="p-4 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredEpisodes.map((ep) => (
                    <tr key={ep.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-black text-amber-400 font-mono">
                        #{ep.episodeNumber}
                      </td>
                      <td className="p-4 font-bold text-white">
                        {ep.title}
                      </td>
                      <td className="p-4 text-slate-400">
                        {ep.seriesNameAr || ep.seriesId} (م{ep.seasonNumber || 1})
                      </td>
                      <td className="p-4 font-mono text-[10px] text-slate-400 truncate max-w-xs">
                        {ep.embedUrl || ep.videoUrl || 'بدون رابط'}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          {(ep.embedUrl || ep.videoUrl) && (
                            <a
                              href={ep.embedUrl || ep.videoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 bg-slate-800 text-slate-300 hover:text-amber-400 rounded-lg transition-all"
                              title="معاينة رابط المشغل"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}

                          <button
                            onClick={() => {
                              setEditingEpisode(ep);
                              setIsFormOpen(true);
                            }}
                            className="p-1.5 bg-slate-800 text-slate-300 hover:text-white rounded-lg transition-all cursor-pointer"
                            title="تعديل"
                          >
                            <Edit className="w-3.5 h-3.5 text-amber-400" />
                          </button>

                          <button
                            onClick={() => setDeletingId(ep.id)}
                            className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-all cursor-pointer"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* Tab 2: TXT Importer */}
      {activeTab === 'txt-importer' && (
        <TxtEpisodeImporter
          movies={movies}
          onRefreshMovies={() => {
            loadEpisodes();
            loadMovies();
          }}
        />
      )}

      {/* Single Episode Form Modal */}
      <EpisodeFormModal
        isOpen={isFormOpen}
        initialData={editingEpisode}
        onSave={handleSaveEpisode}
        onClose={() => {
          setIsFormOpen(false);
          setEditingEpisode(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        title="تأكيد حذف الحلقة"
        message="هل أنت متاكد من حذف هذه الحلقة نهائياً من قاعدة البيانات؟"
        confirmLabel="حذف الحلقة"
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingId(null)}
        isDeleting={isDeleting}
      />

    </div>
  );
};
