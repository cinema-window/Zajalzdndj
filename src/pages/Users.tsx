import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, Shield, Search, ShieldCheck, RefreshCw, KeyRound } from 'lucide-react';
import { fetchUsersProfilesApi } from '../services/apiService';
import { User } from '../types';

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    const data = await fetchUsersProfilesApi();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.role && u.role.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 dir-rtl text-right">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center font-bold">
            <UsersIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-black text-white">إدارة حسابات المستخدمين والصلاحيات</h2>
            <p className="text-xs text-slate-400">استعراض حسابات المسجلين والتحقق من الأدوار (Admin / User) عبر Supabase</p>
          </div>
        </div>

        <button
          onClick={loadUsers}
          disabled={loading}
          className="p-3 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-2xl transition-all border border-slate-700 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* RLS Elevation Guide Notice */}
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-5 space-y-3">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>كيفية ترقية حساب إلى مدير (Admin Role Security):</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          وفقاً لقواعد الأمان المشددة لمنع ترفيع الحسابات الذاتي (Role Escalation Protection)، يجب تعديل عمود <code className="text-amber-400 font-mono">role = 'admin'</code> في جدول <code className="text-amber-400 font-mono">users_profiles</code> مباشرة عبر Supabase SQL Editor لترقية الحسابات بصورة موثقة.
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ابحث بالاسم أو البريد الإلكتروني أو الصلاحية..."
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl px-4 py-3 pr-10 text-xs text-white focus:outline-none focus:border-sky-500"
        />
        <Search className="w-4 h-4 text-slate-500 absolute right-3.5 top-3.5" />
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-xs flex flex-col items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-sky-400" />
          <span>جاري تحميل ملفات المستخدمين من Supabase...</span>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
          <UsersIcon className="w-12 h-12 mx-auto text-slate-600" />
          <h3 className="text-base font-bold text-white">لم يتم العثور على مستخدمين</h3>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 font-bold">
              <tr>
                <th className="p-4">المستخدم</th>
                <th className="p-4">البريد الإلكتروني</th>
                <th className="p-4">الصلاحية (Role)</th>
                <th className="p-4">تاريخ التسجيل</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredUsers.map((u) => {
                const isAdmin = u.role === 'admin' || u.isAdmin;
                return (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      {u.avatar ? (
                        <img src={u.avatar} alt={u.username} className="w-8 h-8 rounded-full border border-slate-700 object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs">
                          {u.username.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-white block">{u.username}</span>
                        <span className="text-[10px] font-mono text-slate-500">{u.id}</span>
                      </div>
                    </td>

                    <td className="p-4 font-mono text-slate-300 text-xs">
                      {u.email}
                    </td>

                    <td className="p-4">
                      {isAdmin ? (
                        <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px] font-bold inline-flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Admin - مدير للنظام</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[11px] font-bold inline-flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5" />
                          <span>User - مستخدم عادي</span>
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-slate-400 text-xs">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('ar-EG') : 'غير مسجل'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
};
