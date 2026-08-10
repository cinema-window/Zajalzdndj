import React from 'react';
import { ShieldCheck, Lock, Database, AlertCircle, CheckCircle2, Key, UserX, FileCode } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabase';

export const Security: React.FC = () => {
  return (
    <div className="space-y-6 dir-rtl text-right">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold border border-amber-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">سياسات الأمان وتأمين RLS في Supabase</h2>
            <p className="text-xs text-slate-400">
              دليل وتأكيد حماية قاعدة البيانات لمنع الوصول غير المصرح به وتطبيق صلاحيات Admin بنسبة 100%.
            </p>
          </div>
        </div>
      </div>

      {/* Supabase Config Status */}
      <div className={`p-4 rounded-2xl border flex items-center justify-between text-xs font-bold ${
        isSupabaseConfigured
          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
      }`}>
        <div className="flex items-center gap-2.5">
          <Database className="w-5 h-5" />
          <span>
            {isSupabaseConfigured
              ? 'اتصال Supabase آمن ومفعل بالكامل باستخدام Anon Public Key'
              : 'يرجى تهيئة مفاتيح VITE_SUPABASE_URL و VITE_SUPABASE_ANON_KEY'}
          </span>
        </div>
        {isSupabaseConfigured ? (
          <span className="bg-emerald-500/20 px-3 py-1 rounded-full text-[11px] flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>آمن (Safe)</span>
          </span>
        ) : (
          <span className="bg-amber-500/20 px-3 py-1 rounded-full text-[11px] flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>مطلوب الإعداد</span>
          </span>
        )}
      </div>

      {/* Security Checklist Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2.5 text-amber-400">
            <Lock className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white">حماية مفاتيح API السرية</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            يستخدم الواجهة الأمامية حصرياً مفتاح <code className="text-amber-400 bg-slate-950 px-1.5 py-0.5 rounded font-mono">ANON_KEY</code> العام. تم منع استخدام <code className="text-red-400 bg-slate-950 px-1.5 py-0.5 rounded font-mono">SERVICE_ROLE_KEY</code> نهائياً لمنع أي اختراق للواجهة.
          </p>
          <div className="bg-slate-950 p-3 rounded-xl text-[11px] text-emerald-400 font-mono border border-slate-800">
            ✓ Frontend utilizes public anon key only
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2.5 text-blue-400">
            <Key className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white">التحقق المستمر من دور Admin</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            كل طلب أو جلسة تفحص جدول <code className="text-amber-400 bg-slate-950 px-1.5 py-0.5 rounded font-mono">users_profiles</code> للتأكد من أن <code className="text-amber-400 bg-slate-950 px-1.5 py-0.5 rounded font-mono">role = 'admin'</code> قبل إتاحة الوصول.
          </p>
          <div className="bg-slate-950 p-3 rounded-xl text-[11px] text-emerald-400 font-mono border border-slate-800">
            ✓ Role Enforcement active on all admin pages
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2.5 text-purple-400">
            <UserX className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white">طرد الحسابات العادية تلقائياً</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            عند محاولة تسجيل الدخول بحساب زائر عادي، يقوم النظام بإنهاء الجلسة فوراً ومنع فتح أي صفحة لوحة تحكم.
          </p>
          <div className="bg-slate-950 p-3 rounded-xl text-[11px] text-emerald-400 font-mono border border-slate-800">
            ✓ Automatic Sign-out for non-admin users
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-400">
            <FileCode className="w-5 h-5" />
            <h3 className="text-sm font-bold text-white">ملف admin-security.sql المرفق</h3>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            يمكنك تطبيق قواعد RLS الرسمية في مشروع Supabase عبر تشغيل كود SQL الموجود في المجلد المخصص.
          </p>
          <div className="bg-slate-950 p-3 rounded-xl text-[11px] text-emerald-400 font-mono border border-slate-800">
            ✓ RLS Security Policies defined
          </div>
        </div>

      </div>
    </div>
  );
};
