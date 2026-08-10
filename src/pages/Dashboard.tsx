import React, { useState, useEffect } from 'react';
import {
  Film,
  Tv,
  Layers,
  FolderKanban,
  Users,
  Eye,
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  PlusCircle,
  Sparkles,
  Clapperboard,
  ArrowUpRight
} from 'lucide-react';
import { fetchDashboardStatsApi } from '../services/apiService';
import { DashboardStats, AdminRoute } from '../types';

interface DashboardProps {
  onNavigate: (route: AdminRoute) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    setLoading(true);
    const data = await fetchDashboardStatsApi();
    setStats(data);
    setLoading(false);
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="space-y-6 dir-rtl text-right">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/20 rounded-3xl p-6 relative overflow-hidden shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <span>أهلاً بك في لوحة REDOS لإدارة Cinema Window</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2.5 py-0.5 rounded-full border border-amber-500/30 font-bold">
                نسخة حقيقية 100%
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              إدارة كاملة للأفلام والمسلسلات والحلقات والتصنيفات مع مزامنة فورية لقاعدة بيانات Supabase.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadStats}
              disabled={loading}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border border-slate-700"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>تحديث الإحصائيات</span>
            </button>
          </div>
        </div>
      </div>

      {/* Supabase Connection Health Status */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold ${
        stats?.isSupabaseConnected
          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
      }`}>
        <div className="flex items-center gap-2.5">
          <Database className="w-5 h-5" />
          <span>
            {stats?.isSupabaseConnected
              ? 'متصل بنجاح بقاعدة بيانات Supabase المباشرة (Live Real Database)'
              : 'لم يتم الاتصال بـ Supabase (تأكد من تعبئة .env ببيانات VITE_SUPABASE_URL)'}
          </span>
        </div>
        {stats?.isSupabaseConnected ? (
          <span className="bg-emerald-500/20 px-3 py-1 rounded-full text-[11px] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Active Sync</span>
          </span>
        ) : (
          <span className="bg-amber-500/20 px-3 py-1 rounded-full text-[11px] flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Needs Setup</span>
          </span>
        )}
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* Total Movies */}
        <div
          onClick={() => onNavigate('movies')}
          className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-3xl p-5 space-y-3 cursor-pointer transition-all hover:-translate-y-1 group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold">
              <Film className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
          </div>
          <div>
            <span className="text-2xl font-black text-white block">
              {loading ? '...' : stats?.totalMovies || 0}
            </span>
            <span className="text-xs text-slate-400 font-bold">إجمالي الأفلام</span>
          </div>
        </div>

        {/* Total Series */}
        <div
          onClick={() => onNavigate('series')}
          className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-3xl p-5 space-y-3 cursor-pointer transition-all hover:-translate-y-1 group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold">
              <Tv className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
          </div>
          <div>
            <span className="text-2xl font-black text-white block">
              {loading ? '...' : stats?.totalSeries || 0}
            </span>
            <span className="text-xs text-slate-400 font-bold">إجمالي المسلسلات</span>
          </div>
        </div>

        {/* Total Episodes */}
        <div
          onClick={() => onNavigate('episodes')}
          className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-3xl p-5 space-y-3 cursor-pointer transition-all hover:-translate-y-1 group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
          </div>
          <div>
            <span className="text-2xl font-black text-white block">
              {loading ? '...' : stats?.totalEpisodes || 0}
            </span>
            <span className="text-xs text-slate-400 font-bold">إجمالي الحلقات</span>
          </div>
        </div>

        {/* Categories */}
        <div
          onClick={() => onNavigate('categories')}
          className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-3xl p-5 space-y-3 cursor-pointer transition-all hover:-translate-y-1 group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <FolderKanban className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
          </div>
          <div>
            <span className="text-2xl font-black text-white block">
              {loading ? '...' : stats?.totalCategories || 0}
            </span>
            <span className="text-xs text-slate-400 font-bold">التصنيفات</span>
          </div>
        </div>

        {/* Total Users */}
        <div
          onClick={() => onNavigate('users')}
          className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-3xl p-5 space-y-3 cursor-pointer transition-all hover:-translate-y-1 group shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 transition-colors" />
          </div>
          <div>
            <span className="text-2xl font-black text-white block">
              {loading ? '...' : stats?.totalUsers || 0}
            </span>
            <span className="text-xs text-slate-400 font-bold">المستخدمين المسجلين</span>
          </div>
        </div>

        {/* Total Views */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-2xl bg-pink-500/10 text-pink-400 flex items-center justify-center font-bold">
              <Eye className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-2xl font-black text-white block">
              {loading ? '...' : (stats?.totalViews || 0).toLocaleString()}
            </span>
            <span className="text-xs text-slate-400 font-bold">مشاهدات المنصة</span>
          </div>
        </div>

      </div>

      {/* Quick Action Hub */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <h3 className="text-sm font-black text-white flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-amber-400" />
          <span>اختصارات الإجراءات السريعة</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <button
            onClick={() => onNavigate('movies')}
            className="p-4 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-2xl text-right transition-all flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">إضافة فيلم سينمائي جديد</span>
              <span className="text-[10px] text-slate-400">إدخال يدوي أو من TMDB</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('episodes')}
            className="p-4 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-2xl text-right transition-all flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">استيراد حلقات TXT جماعي</span>
              <span className="text-[10px] text-slate-400">رفع وقراءة ملف النص</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('tmdb')}
            className="p-4 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-2xl text-right transition-all flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">استيراد TMDB الذكي</span>
              <span className="text-[10px] text-slate-400">سحب البوستر والوصف</span>
            </div>
          </button>

          <button
            onClick={() => onNavigate('security')}
            className="p-4 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-2xl text-right transition-all flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold flex-shrink-0 group-hover:scale-110 transition-transform">
              <Clapperboard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-white block">فحص حماية RLS والأمان</span>
              <span className="text-[10px] text-slate-400">تأكيد منع Role Escalation</span>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Works Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-white flex items-center gap-2">
            <Clapperboard className="w-4 h-4 text-amber-400" />
            <span>آخر الأعمال المضافة للموقع حديثاً</span>
          </h3>
          <button
            onClick={() => onNavigate('movies')}
            className="text-xs text-amber-400 font-bold hover:underline"
          >
            عرض الكل ({stats?.totalMovies || 0}) ←
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8 text-xs text-slate-500">جاري تحميل البيانات الحقيقية من Supabase...</div>
        ) : stats?.recentMovies.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-500">لا توجد أفلام أو أعمال مسجلة بعد.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {stats?.recentMovies.map((m) => (
              <div
                key={m.id}
                className="bg-slate-950 border border-slate-800/80 rounded-2xl p-2.5 space-y-2 group hover:border-amber-500/40 transition-all"
              >
                <div className="aspect-[2/3] rounded-xl overflow-hidden bg-slate-900 relative">
                  <img
                    src={m.posterUrl || m.thumbnail}
                    alt={m.titleAr}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800';
                    }}
                  />
                  <div className="absolute top-1.5 right-1.5 bg-amber-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded-md">
                    {m.releaseYear}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white truncate">{m.titleAr}</h4>
                  <span className="text-[10px] text-slate-400 block">{m.categoryAr || 'فيلم'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
