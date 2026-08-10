import React from 'react';
import { Menu, ExternalLink, ShieldCheck, User as UserIcon } from 'lucide-react';
import { User, AdminRoute } from '../types';

interface HeaderProps {
  currentRoute: AdminRoute;
  adminUser: User | null;
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRoute,
  adminUser,
  onOpenMobileMenu,
}) => {
  const titles: Record<AdminRoute, string> = {
    dashboard: 'لوحة التحكم والمؤشرات الإحصائية',
    movies: 'إدارة الأفلام السينمائية',
    series: 'إدارة المسلسلات والسيرايز',
    episodes: 'إدارة الحلقات والاستيراد الجماعي',
    categories: 'إدارة التصنيفات والأنواع',
    users: 'إدارة حسابات المستخدمين والصلاحيات',
    tmdb: 'استيراد البيانات التلقائي من TMDB',
    telegram: 'إعدادات بوت إشعارات تليجرام',
    seo: 'أدوات تحسين محركات البحث SEO وSitemap',
    health: 'فحص صحة واستقرار الخدمات والنظام',
    security: 'سياسات الأمان وحماية RLS',
  };

  return (
    <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Mobile Toggle Button */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-lg font-black text-white">{titles[currentRoute] || 'لوحة تحكم Cinema Window'}</h2>
          <p className="text-xs text-slate-400 hidden sm:block">مشروع REDOS المستقل لإدارة منصة السينما</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Live Website Preview Button */}
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border border-slate-700/80 shadow-md"
          title="معاينة الواجهة الرئيسية للموقع"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">معاينة موقع Cinema Window</span>
        </a>

        {/* Active Admin Profile Tag */}
        <div className="flex items-center gap-2.5 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-2xl">
          {adminUser?.avatar ? (
            <img src={adminUser.avatar} alt="Admin Avatar" className="w-7 h-7 rounded-full border border-amber-500/40 object-cover" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xs">
              <UserIcon className="w-4 h-4" />
            </div>
          )}
          <div className="text-right">
            <span className="text-xs font-bold text-slate-200 block leading-tight">{adminUser?.username || 'المدير'}</span>
            <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>مدير للنظام (Admin)</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
