import type {
  Device,
  MonitoringData,
  OverviewStats,
  AreaStats,
  CreateDeviceRequest,
  UpdateDeviceRequest,
  PaginatedResponse,
  ApiResponse,
  LoginRequest,
  LoginResponse,
  CaptchaResponse,
  DeviceTimeSeries,
  AreaTimeSeries,
  StatusDistribution,
  DeviceStatusDistribution,
  DeviceHeatmapData,
  MetricType,
  TimeRange,
} from '../../shared/types';

const API_BASE = '/api';

function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });
  const result = (await response.json()) as ApiResponse<T>;
  if (result.code !== 0) {
    throw new Error(result.message);
  }
  return result.data;
}

export const deviceApi = {
  getList: (params?: { search?: string; area?: string; page?: number; pageSize?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.area) query.set('area', params.area);
    if (params?.page) query.set('page', String(params.page));
    if (params?.pageSize) query.set('pageSize', String(params.pageSize));
    const queryStr = query.toString();
    return request<PaginatedResponse<Device>>(`/devices${queryStr ? `?${queryStr}` : ''}`);
  },

  getById: (id: string) => {
    return request<Device>(`/devices/${id}`);
  },

  create: (data: CreateDeviceRequest) => {
    return request<Device>('/devices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: (id: string, data: UpdateDeviceRequest) => {
    return request<Device>(`/devices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: (id: string) => {
    return request<null>(`/devices/${id}`, {
      method: 'DELETE',
    });
  },
};

export const dataApi = {
  getRealtime: () => {
    return request<MonitoringData[]>('/data/realtime');
  },

  getRealtimeByDevice: (deviceId: string) => {
    return request<MonitoringData>(`/data/realtime/${deviceId}`);
  },
};

export const statsApi = {
  getOverview: () => {
    return request<OverviewStats>('/stats/overview');
  },

  getArea: () => {
    return request<AreaStats[]>('/stats/area');
  },

  getDeviceTimeSeries: (params?: { deviceIds?: string[]; timeRange?: TimeRange }) => {
    const query = new URLSearchParams();
    if (params?.deviceIds?.length) query.set('deviceIds', params.deviceIds.join(','));
    if (params?.timeRange) query.set('timeRange', params.timeRange);
    const queryStr = query.toString();
    return request<DeviceTimeSeries[]>(`/stats/device-time-series${queryStr ? `?${queryStr}` : ''}`);
  },

  getAreaTimeSeries: (params?: { areas?: string[]; timeRange?: TimeRange }) => {
    const query = new URLSearchParams();
    if (params?.areas?.length) query.set('areas', params.areas.join(','));
    if (params?.timeRange) query.set('timeRange', params.timeRange);
    const queryStr = query.toString();
    return request<AreaTimeSeries[]>(`/stats/area-time-series${queryStr ? `?${queryStr}` : ''}`);
  },

  getStatusDistribution: () => {
    return request<StatusDistribution[]>('/stats/status-distribution');
  },

  getDeviceStatusDistribution: () => {
    return request<DeviceStatusDistribution[]>('/stats/device-status-distribution');
  },

  getHeatmap: (params?: { metric?: MetricType; timeRange?: TimeRange; deviceIds?: string[] }) => {
    const query = new URLSearchParams();
    if (params?.metric) query.set('metric', params.metric);
    if (params?.timeRange) query.set('timeRange', params.timeRange);
    if (params?.deviceIds?.length) query.set('deviceIds', params.deviceIds.join(','));
    const queryStr = query.toString();
    return request<DeviceHeatmapData[]>(`/stats/heatmap${queryStr ? `?${queryStr}` : ''}`);
  },
};

export const authApi = {
  getCaptcha: () => {
    return request<CaptchaResponse>('/auth/captcha');
  },

  login: (data: LoginRequest) => {
    return request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  logout: () => {
    return request<null>('/auth/logout', {
      method: 'POST',
    });
  },
};
