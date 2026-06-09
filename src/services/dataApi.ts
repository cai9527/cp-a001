import type { MonitoringData } from '../../shared/types';
import { request } from './http';

export const dataApi = {
  getRealtime: () => {
    return request<MonitoringData[]>('/data/realtime');
  },

  getRealtimeByDevice: (deviceId: string) => {
    return request<MonitoringData>(`/data/realtime/${deviceId}`);
  },
};
