import { create } from 'zustand';
import type { Device, MonitoringData, OverviewStats, AreaStats, CreateDeviceRequest, UpdateDeviceRequest } from '../../shared/types';
import { deviceApi, dataApi, statsApi } from '@/services/api';

interface AppState {
  devices: Device[];
  deviceTotal: number;
  monitoringData: MonitoringData[];
  overviewStats: OverviewStats | null;
  areaStats: AreaStats[];
  loading: boolean;
  error: string | null;

  fetchDevices: (params?: { search?: string; area?: string; page?: number; pageSize?: number }) => Promise<void>;
  fetchDeviceById: (id: string) => Promise<Device | undefined>;
  createDevice: (data: CreateDeviceRequest) => Promise<void>;
  updateDevice: (id: string, data: UpdateDeviceRequest) => Promise<void>;
  deleteDevice: (id: string) => Promise<void>;

  fetchMonitoringData: () => Promise<void>;
  fetchOverviewStats: () => Promise<void>;
  fetchAreaStats: () => Promise<void>;
  fetchAllData: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
  devices: [],
  deviceTotal: 0,
  monitoringData: [],
  overviewStats: null,
  areaStats: [],
  loading: false,
  error: null,

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
}));
