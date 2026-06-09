import { create } from 'zustand';
import type { UserInfo, LoginRequest } from '../../shared/types';
import { authApi } from '@/services';

interface AuthState {
  isAuthenticated: boolean;
  user: UserInfo | null;
  token: string | null;
  authLoading: boolean;
  error: string | null;

  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  initAuth: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  token: null,
  authLoading: false,
  error: null,

  login: async (data: LoginRequest) => {
    set({ authLoading: true, error: null });
    try {
      const result = await authApi.login(data);
      localStorage.setItem('auth_token', result.token);
      localStorage.setItem('auth_user', JSON.stringify(result.user));
      set({
        isAuthenticated: true,
        user: result.user,
        token: result.token,
      });
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    } finally {
      set({ authLoading: false });
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout API errors, still clear local state
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      set({
        isAuthenticated: false,
        user: null,
        token: null,
      });
    }
  },

  initAuth: () => {
    const token = localStorage.getItem('auth_token');
    const userStr = localStorage.getItem('auth_user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as UserInfo;
        set({
          isAuthenticated: true,
          user,
          token,
        });
      } catch {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
  },

  clearError: () => set({ error: null }),
}));
