import React, { useState, useEffect } from 'react';
import { FolderKanban, Plus, Search, Edit, Trash2, RefreshCw, Layers } from 'lucide-react';
import { fetchCategoriesApi, saveCategoryApi, deleteCategoryApi } from '../services/apiService';
import { CategoryItem } from '../types';
import { ConfirmModal } from '../components/ConfirmModal';

export const Categories: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<CategoryItem | null>(null);
  const [formData, setFormData] = useState({ nameAr: '', nameEn: '', slug: '', icon: 'folder' });

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    const data = await fetchCategoriesApi();
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleOpenForm = (cat?: CategoryItem) => {
    if (cat) {
      setEditingCat(cat);
      setFormData({ nameAr: cat.nameAr, nameEn: cat.nameEn || '', slug: cat.slug, icon: cat.icon || 'folder' });
    } else {
      setEditingCat(null);
      setFormData({ nameAr: '', nameEn: '', slug: '', icon: 'folder' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nameAr) return;

    const slugVal = formData.slug || formData.nameAr.toLowerCase().replace(/\s+/g, '-');
    const res = await saveCategoryApi({
      id: editingCat?.id,
      nameAr: formData.nameAr,
      nameEn: formData.nameEn,
      slug: slugVal,
      icon: formData.icon
    });

    if (res.success) {
      setIsModalOpen(false);
      await loadCategories();
    } else {
      alert(res.error || 'فشل حفظ التصنيف');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    const res = await deleteCategoryApi(deletingId);
    setIsDeleting(false);
    setDeletingId(null);
    if (res.success) {
      await loadCategories();
    } else {
      alert(res.error || 'فشل حذف التصنيف');
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.nameAr.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.nameEn && c.nameEn.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 dir-rtl text-right">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">إدارة تصنيفات الموقع (Categories)</h2>
            <p className="text-xs text-slate-400">إضافة وتعديل التصنيفات والأدوار السينمائية للمحتوى</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadCategories}
            disabled={loading}
            className="p-3 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-2xl transition-all border border-slate-700 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => handleOpenForm()}
            className="px-5 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-xs rounded-2xl shadow-xl shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة تصنيف جديد</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث باسم التصنيف بالعربي أو الإنجليزي..."
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 pr-10 text-xs text-white focus:outline-none focus:border-emerald-500"
        />
        <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5" />
      </div>

      {/* Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
          <span>جاري تحميل التصنيفات...</span>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
          <FolderKanban className="w-12 h-12 mx-auto text-slate-600" />
          <h3 className="text-base font-bold text-white">لا توجد تصنيفات مسجلة</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredCategories.map((cat) => (
            <div
              key={cat.id}
              className="bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-3xl p-5 space-y-3 transition-all shadow-xl flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold flex-shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">{cat.nameAr}</h3>
                  {cat.nameEn && <span className="text-[10px] text-slate-400 block">{cat.nameEn}</span>}
                  <span className="text-[10px] font-mono text-slate-500 block pt-0.5">slug: {cat.slug}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenForm(cat)}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl transition-all cursor-pointer"
                  title="تعديل"
                >
                  <Edit className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setDeletingId(cat.id)}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-all cursor-pointer"
                  title="حذف"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md dir-rtl">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 text-right">
            <h3 className="text-base font-black text-white">
              {editingCat ? 'تعديل التصنيف' : 'إضافة تصنيف جديد'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">اسم التصنيف بالعربية *</label>
                <input
                  type="text"
                  required
                  value={formData.nameAr}
                  onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                  placeholder="أفلام أكشن"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">اسم التصنيف بالإنجليزية</label>
                <input
                  type="text"
                  value={formData.nameEn}
                  onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })}
                  placeholder="Action Movies"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">الـ Slug بالرابط</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="action-movies"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow-lg"
                >
                  حفظ التصنيف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingId)}
        title="حذف التصنيف"
        message="هل أنت متاكد من حذف هذا التصنيف من قاعدة البيانات؟"
        confirmLabel="حذف التصنيف"
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeletingId(null)}
        isDeleting={isDeleting}
      />

    </div>
  );
};
