import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User } from '../types';

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

/**
 * Validates admin user credentials against Supabase Auth & checks role in users_profiles table.
 */
export async function loginAdmin(email: string, password: string): Promise<AuthResponse> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      error: 'لم يتم إعداد بيانات الاتصال بـ Supabase (URL / ANON KEY غير مكتملة).'
    };
  }

  try {
    // 1. Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return {
        success: false,
        error: authError?.message || 'بيانات الدخول غير صحيحة.'
      };
    }

    const userId = authData.user.id;

    // 2. Fetch User Profile & Verify 'admin' Role from Database (Source of Truth)
    const { data: profile, error: profileError } = await supabase
      .from('users_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profileError) {
      console.error('Failed fetching admin profile:', profileError);
    }

    // Strict Role Enforcement
    const userRole = profile?.role || 'user';
    if (userRole !== 'admin') {
      // Sign out non-admin users immediately
      await supabase.auth.signOut();
      return {
        success: false,
        error: 'عذراً، هذا الحساب لا يملك صلاحيات مدير النظام (Admin Role). يرجى الترقية من قاعدة البيانات أولاً.'
      };
    }

    const userObj: User = {
      id: userId,
      username: profile?.username || authData.user.email?.split('@')[0] || 'المدير',
      email: authData.user.email || email,
      role: 'admin',
      avatar: profile?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${userId}`,
      favorites: profile?.favorites || [],
      watched: profile?.watched || [],
      watchHistory: profile?.watch_history || {},
      createdAt: profile?.created_at || new Date().toISOString()
    };

    return {
      success: true,
      user: userObj
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'حدث خطأ في الاتصال أثناء تسجيل الدخول.'
    };
  }
}

/**
 * Checks current active Supabase Auth session & verifies admin role from Database.
 */
export async function getCurrentAdminSession(): Promise<User | null> {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const userId = session.user.id;

    // Fetch profile and check role from DB
    const { data: profile } = await supabase
      .from('users_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (profile?.role !== 'admin') {
      return null;
    }

    return {
      id: userId,
      username: profile.username || session.user.email?.split('@')[0] || 'المدير',
      email: session.user.email || '',
      role: 'admin',
      avatar: profile.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${userId}`,
      favorites: profile.favorites || [],
      watched: profile.watched || [],
      watchHistory: profile.watch_history || {},
      createdAt: profile.created_at || new Date().toISOString()
    };
  } catch (err) {
    console.error('Failed verifying admin session:', err);
    return null;
  }
}

/**
 * Logs out the active admin session securely.
 */
export async function logoutAdmin(): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    await supabase.auth.signOut();
  }
}
