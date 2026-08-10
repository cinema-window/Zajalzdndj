import React, { useState, useEffect } from 'react';
import { User, AdminRoute } from './types';
import { getCurrentAdminSession, logoutAdmin } from './services/authService';
import { Login } from './pages/Login';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './pages/Dashboard';
import { Movies } from './pages/Movies';
import { Series } from './pages/Series';
import { Episodes } from './pages/Episodes';
import { Categories } from './pages/Categories';
import { Users } from './pages/Users';
import { TmdbImport } from './pages/TmdbImport';
import { Telegram } from './pages/Telegram';
import { SeoTools } from './pages/SeoTools';
import { SystemHealthCheck } from './components/SystemHealthCheck';
import { Security } from './pages/Security';
import { RefreshCw, Clapperboard } from 'lucide-react';

export const App: React.FC = () => {
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);
  const [currentRoute, setCurrentRoute] = useState<AdminRoute>('dashboard');
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    async function verifyAuth() {
      setCheckingSession(true);
      try {
        const user = await getCurrentAdminSession();
        setAdminUser(user);
      } catch (err) {
        console.error('Session error:', err);
        setAdminUser(null);
      } finally {
        setCheckingSession(false);
      }
    }
    verifyAuth();
  }, []);

  const handleLoginSuccess = (user: User) => {
    setAdminUser(user);
    setCurrentRoute('dashboard');
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setAdminUser(null);
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-100 dir-rtl">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-xl mb-4 animate-pulse">
          <Clapperboard className="w-8 h-8 fill-slate-950" />
        </div>
        <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>جاري التحقق من صلاحيات مدير النظام...</span>
        </div>
      </div>
    );
  }

  if (!adminUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased dir-rtl flex">
      {/* Sidebar Navigation */}
      <Sidebar
        currentRoute={currentRoute}
        onRouteChange={setCurrentRoute}
        onLogout={handleLogout}
        isOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:mr-72">
        <Header
          currentRoute={currentRoute}
          adminUser={adminUser}
          onOpenMobileMenu={() => setIsMobileOpen(true)}
        />

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {currentRoute === 'dashboard' && <Dashboard onNavigate={setCurrentRoute} />}
          {currentRoute === 'movies' && <Movies />}
          {currentRoute === 'series' && <Series onNavigate={setCurrentRoute} />}
          {currentRoute === 'episodes' && <Episodes />}
          {currentRoute === 'categories' && <Categories />}
          {currentRoute === 'users' && <Users />}
          {currentRoute === 'tmdb' && <TmdbImport />}
          {currentRoute === 'telegram' && <Telegram />}
          {currentRoute === 'seo' && <SeoTools />}
          {currentRoute === 'health' && <SystemHealthCheck />}
          {currentRoute === 'security' && <Security />}
        </main>
      </div>
    </div>
  );
};

export default App;
