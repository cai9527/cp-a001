import { create } from 'zustand';
import type {
  OverviewStats,
  AreaStats,
  DeviceTimeSeries,
  AreaTimeSeries,
  StatusDistribution,
  DeviceStatusDistribution,
  DeviceHeatmapData,
  MetricType,
  TimeRange,
} from '../../shared/types';
import { statsApi, dataApi } from '@/services';

interface StatsState {
  overviewStats: OverviewStats | null;
  areaStats: AreaStats[];
  deviceTimeSeries: DeviceTimeSeries[];
  areaTimeSeries: AreaTimeSeries[];
  statusDistribution: StatusDistribution[];
  deviceStatusDistribution: DeviceStatusDistribution[];
  heatmapData: DeviceHeatmapData[];
  loading: boolean;
  error: string | null;

  fetchOverviewStats: () => Promise<void>;
  fetchAreaStats: () => Promise<void>;
  fetchDeviceTimeSeries: (params?: { deviceIds?: string[]; timeRange?: TimeRange }) => Promise<void>;
  fetchAreaTimeSeries: (params?: { areas?: string[]; timeRange?: TimeRange }) => Promise<void>;
  fetchStatusDistribution: () => Promise<void>;
  fetchDeviceStatusDistribution: () => Promise<void>;
  fetchHeatmapData: (params?: { metric?: MetricType; timeRange?: TimeRange; deviceIds?: string[] }) => Promise<void>;
  fetchAllData: () => Promise<void>;
  fetchAllVisualizationData: (params?: {
    deviceIds?: string[];
    areas?: string[];
    timeRange?: TimeRange;
    metric?: MetricType;
  }) => Promise<void>;
  clearError: () => void;
}

export const useStatsStore = create<StatsState>((set, get) => ({
  overviewStats: null,
  areaStats: [],
  deviceTimeSeries: [],
  areaTimeSeries: [],
  statusDistribution: [],
  deviceStatusDistribution: [],
  heatmapData: [],
  loading: false,
  error: null,

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

  fetchDeviceTimeSeries: async (params) => {
    try {
      const data = await statsApi.getDeviceTimeSeries(params);
      set({ deviceTimeSeries: data });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  fetchAreaTimeSeries: async (params) => {
    try {
      const data = await statsApi.getAreaTimeSeries(params);
      set({ areaTimeSeries: data });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  fetchStatusDistribution: async () => {
    try {
      const data = await statsApi.getStatusDistribution();
      set({ statusDistribution: data });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  fetchDeviceStatusDistribution: async () => {
    try {
      const data = await statsApi.getDeviceStatusDistribution();
      set({ deviceStatusDistribution: data });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  fetchHeatmapData: async (params) => {
    try {
      const data = await statsApi.getHeatmap(params);
      set({ heatmapData: data });
    } catch (err) {
      set({ error: (err as Error).message });
    }
  },

  fetchAllData: async () => {
    await Promise.all([
      dataApi.getRealtime().then(async (data) => {
        const { useDataStore } = await import('./dataStore');
        useDataStore.setState({ monitoringData: data });
      }).catch(() => {}),
      get().fetchOverviewStats(),
      get().fetchAreaStats(),
    ]);
  },

  fetchAllVisualizationData: async (params) => {
    await Promise.all([
      dataApi.getRealtime().then(async (data) => {
        const { useDataStore } = await import('./dataStore');
        useDataStore.setState({ monitoringData: data });
      }).catch(() => {}),
      get().fetchDeviceTimeSeries({ deviceIds: params?.deviceIds, timeRange: params?.timeRange }),
      get().fetchAreaTimeSeries({ areas: params?.areas, timeRange: params?.timeRange }),
      get().fetchStatusDistribution(),
      get().fetchDeviceStatusDistribution(),
      get().fetchHeatmapData({
        metric: params?.metric,
        timeRange: params?.timeRange,
        deviceIds: params?.deviceIds,
      }),
    ]);
  },

  clearError: () => set({ error: null }),
}));
