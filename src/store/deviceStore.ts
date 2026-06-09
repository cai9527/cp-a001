import { create } from 'zustand';
import type { Device, CreateDeviceRequest, UpdateDeviceRequest } from '../../shared/types';
import { deviceApi } from '@/services';

interface DeviceState {
  devices: Device[];
  deviceTotal: number;
  loading: boolean;
  error: string | null;

  fetchDevices: (params?: { search?: string; area?: string; page?: number; pageSize?: number }) => Promise<void>;
  fetchDeviceById: (id: string) => Promise<Device | undefined>;
  createDevice: (data: CreateDeviceRequest) => Promise<void>;
  updateDevice: (id: string, data: UpdateDeviceRequest) => Promise<void>;
  deleteDevice: (id: string) => Promise<void>;
  clearError: () => void;
}

export const useDeviceStore = create<DeviceState>((set, get) => ({
  devices: [],
  deviceTotal: 0,
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
      return await deviceApi.getById(id);
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

  clearError: () => set({ error: null }),
}));
