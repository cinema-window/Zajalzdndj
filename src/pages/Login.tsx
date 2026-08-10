import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, AlertCircle, RefreshCw, KeyRound, Clapperboard } from 'lucide-react';
import { loginAdmin } from '../services/authService';
import { User } from '../types';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await loginAdmin(email, password);
      if (res.success && res.user) {
        onLoginSuccess(res.user);
      } else {
        setErrorMsg(res.error || 'فشل تسجيل الدخول. تأكد من صحة البريد والرمز وصلاحية Admin');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ غير متوقع أثناء الاتصال');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 dir-rtl text-right">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
        
        {/* Branding Logo */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-600 text-slate-950 mx-auto flex items-center justify-center font-black shadow-2xl shadow-amber-500/20">
            <Clapperboard className="w-8 h-8 fill-slate-950" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">REDOS - منصة الإدارة المستقلة</h1>
            <p className="text-xs text-slate-400 mt-1">تسجيل الدخول الآمن لإدارة موقع Cinema Window</p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-2xl flex items-center gap-3 text-xs text-amber-400">
          <ShieldCheck className="w-5 h-5 flex-shrink-0 text-amber-400" />
          <span>هذه اللوحة محمية بسياسات RLS في Supabase Auth ويشترط وجود صلاحية Admin.</span>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 p-3.5 rounded-2xl flex items-center gap-3 text-xs text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">البريد الإلكتروني للـ Admin</label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@cinemawindow.com"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 pl-10 text-xs text-white focus:outline-none focus:border-amber-500 transition-all font-sans"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-4" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-300 block mb-1.5">كلمة المرور السرية</label>
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3.5 pl-10 text-xs text-white focus:outline-none focus:border-amber-500 transition-all font-sans"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-4" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs rounded-2xl shadow-xl shadow-amber-500/20 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>جارٍ التحقق من الحساب والصلاحيات...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-4 h-4" />
                <span>تسجيل الدخول للوحة التحكم</span>
              </>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="text-center pt-2 border-t border-slate-800/80">
          <p className="text-[11px] text-slate-500">
            تأكد من تطبيق ملف <code className="text-amber-400 font-mono">admin-security.sql</code> في Supabase
          </p>
        </div>

      </div>
    </div>
  );
};
