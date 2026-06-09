import { create } from 'zustand';
import type { Device, MonitoringData, OverviewStats, AreaStats, CreateDeviceRequest, UpdateDeviceRequest, UserInfo, LoginRequest } from '../../shared/types';
import { deviceApi, dataApi, statsApi, authApi } from '@/services/api';

interface AppState {
  devices: Device[];
  deviceTotal: number;
  monitoringData: MonitoringData[];
  overviewStats: OverviewStats | null;
  areaStats: AreaStats[];
  loading: boolean;
  error: string | null;

  isAuthenticated: boolean;
  user: UserInfo | null;
  token: string | null;
  authLoading: boolean;

  fetchDevices: (params?: { search?: string; area?: string; page?: number; pageSize?: number }) => Promise<void>;
  fetchDeviceById: (id: string) => Promise<Device | undefined>;
  createDevice: (data: CreateDeviceRequest) => Promise<void>;
  updateDevice: (id: string, data: UpdateDeviceRequest) => Promise<void>;
  deleteDevice: (id: string) => Promise<void>;

  fetchMonitoringData: () => Promise<void>;
  fetchOverviewStats: () => Promise<void>;
  fetchAreaStats: () => Promise<void>;
  fetchAllData: () => Promise<void>;

  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  initAuth: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  devices: [],
  deviceTotal: 0,
  monitoringData: [],
  overviewStats: null,
  areaStats: [],
  loading: false,
  error: null,

  isAuthenticated: false,
  user: null,
  token: null,
  authLoading: false,

  fetchDevices: async (params) => {
    set({ loading: true, error: null });
    try {
      const result = await deviceApi.getList(params);
      set({ devices: result.items, deviceTotal: result.total });
    } catch (err) {
      set({ error: (err as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  fetchDeviceById: async (id) => {
    set({ loading: true, error: null });
    try {
      const device = await deviceApi.getById(id);
      return device;
    } catch (err) {
      set({ error: (err as Error).message });
      return undefined;
    } finally {
      set({ loading: false });
    }
  },

  createDevice: async (data) => {
    set({ loading: true, error: null });
    try {
      await deviceApi.create(data);
      await get().fetchDevices();
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  updateDevice: async (id, data) => {
    set({ loading: true, error: null });
    try {
      await deviceApi.update(id, data);
      await get().fetchDevices();
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  deleteDevice: async (id) => {
    set({ loading: true, error: null });
    try {
      await deviceApi.delete(id);
      await get().fetchDevices();
    } catch (err) {
      set({ error: (err as Error).message });
      throw err;
    } finally {
      set({ loading: false });
    }
  },

  fetchMonitoringData: async () => {
    try {
      const data = await dataApi.getRealtime();
      set({ monitoringData: data });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  fetchOverviewStats: async () => {
    try {
      const data = await statsApi.getOverview();
      set({ overviewStats: data });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  fetchAreaStats: async () => {
    try {
      const data = await statsApi.getArea();
      set({ areaStats: data });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  fetchAllData: async () => {
    await Promise.all([
      get().fetchMonitoringData(),
      get().fetchOverviewStats(),
      get().fetchAreaStats(),
    ]);
  },

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
}));
