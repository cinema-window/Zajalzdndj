import React from 'react';
import {
  LayoutDashboard,
  Film,
  Tv,
  Layers,
  FolderKanban,
  Users,
  Sparkles,
  Send,
  Globe,
  Activity,
  ShieldCheck,
  LogOut,
  X,
  Clapperboard
} from 'lucide-react';
import { AdminRoute } from '../types';

interface SidebarProps {
  currentRoute: AdminRoute;
  onRouteChange: (route: AdminRoute) => void;
  onLogout: () => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onRouteChange,
  onLogout,
  isOpen,
  onCloseMobile,
}) => {
  const menuItems: { id: AdminRoute; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'لوحة التحكم والمؤشرات', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'movies', label: 'إدارة الأفلام السينمائية', icon: <Film className="w-5 h-5" /> },
    { id: 'series', label: 'إدارة المسلسلات والسيرايز', icon: <Tv className="w-5 h-5" /> },
    { id: 'episodes', label: 'إدارة الحلقات والاستيراد الجماعي', icon: <Layers className="w-5 h-5" />, badge: 'TXT' },
    { id: 'categories', label: 'إدارة التصنيفات والأنواع', icon: <FolderKanban className="w-5 h-5" /> },
    { id: 'users', label: 'إدارة المستخدمين والأدوار', icon: <Users className="w-5 h-5" /> },
    { id: 'tmdb', label: 'استيراد TMDB الذكي', icon: <Sparkles className="w-5 h-5" />, badge: 'AI' },
    { id: 'telegram', label: 'إشعارات بوت تليجرام', icon: <Send className="w-5 h-5" /> },
    { id: 'seo', label: 'أدوات SEO وSitemap XML', icon: <Globe className="w-5 h-5" /> },
    { id: 'health', label: 'فحص استقرار الخدمات', icon: <Activity className="w-5 h-5" /> },
    { id: 'security', label: 'سياسات الأمان وRLS', icon: <ShieldCheck className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 right-0 bottom-0 w-72 bg-slate-900/95 border-l border-slate-800/80 z-50 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Header Branding */}
          <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
                <Clapperboard className="w-5 h-5 fill-slate-950" />
              </div>
              <div>
                <h1 className="text-base font-black text-white tracking-wide">
                  REDOS <span className="text-amber-400 font-bold text-xs">ADMIN</span>
                </h1>
                <p className="text-[11px] text-slate-400 font-medium">لوحة تحكم Cinema Window</p>
              </div>
            </div>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="p-4 space-y-1.5 flex-1">
            <div className="text-[10px] font-bold text-slate-500 uppercase px-3 py-2">القائمة الرئيسية</div>

            {menuItems.map((item) => {
              const isActive = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onRouteChange(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 font-black'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-slate-950' : 'text-amber-400/90'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[9px] px-2 py-0.5 rounded-full font-black ${
                        isActive
                          ? 'bg-slate-950 text-amber-400'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* User Profile & Logout */}
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/60">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-xs font-bold transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>تسجيل الخروج من الإدارة</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
