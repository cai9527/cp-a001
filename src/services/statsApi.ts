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
import { request, buildQueryParams } from './http';

export const statsApi = {
  getOverview: () => {
    return request<OverviewStats>('/stats/overview');
  },

  getArea: () => {
    return request<AreaStats[]>('/stats/area');
  },

  getDeviceTimeSeries: (params?: { deviceIds?: string[]; timeRange?: TimeRange }) => {
    return request<DeviceTimeSeries[]>(
      `/stats/device-time-series${buildQueryParams((params || {}) as Record<string, unknown>)}`,
    );
  },

  getAreaTimeSeries: (params?: { areas?: string[]; timeRange?: TimeRange }) => {
    return request<AreaTimeSeries[]>(
      `/stats/area-time-series${buildQueryParams((params || {}) as Record<string, unknown>)}`,
    );
  },

  getStatusDistribution: () => {
    return request<StatusDistribution[]>('/stats/status-distribution');
  },

  getDeviceStatusDistribution: () => {
    return request<DeviceStatusDistribution[]>('/stats/device-status-distribution');
  },

  getHeatmap: (params?: { metric?: MetricType; timeRange?: TimeRange; deviceIds?: string[] }) => {
    return request<DeviceHeatmapData[]>(
      `/stats/heatmap${buildQueryParams((params || {}) as Record<string, unknown>)}`,
    );
  },
};
