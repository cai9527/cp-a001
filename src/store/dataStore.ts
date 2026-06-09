import { create } from 'zustand';
import type { MonitoringData } from '../../shared/types';
import { dataApi } from '@/services';

interface DataState {
  monitoringData: MonitoringData[];
  loading: boolean;
  error: string | null;

  fetchMonitoringData: () => Promise<void>;
  clearError: () => void;
}

export const useDataStore = create<DataState>((set) => ({
  monitoringData: [],
  loading: false,
  error: null,

  fetchMonitoringData: async () => {
    try {
      const data = await dataApi.getRealtime();
      set({ monitoringData: data });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  clearError: () => set({ error: null }),
}));
