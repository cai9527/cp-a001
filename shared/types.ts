export type DeviceStatus = 'online' | 'offline' | 'warning';
export type DataStatus = 'normal' | 'warning' | 'danger';
export type Protocol = 'MQTT' | 'HTTP' | 'Modbus';

export interface Device {
  id: string;
  name: string;
  code: string;
  location: string;
  area: string;
  status: DeviceStatus;
  pm25Threshold: number;
  pm10Threshold: number;
  noiseThreshold: number;
  ipAddress: string;
  port: number;
  protocol: Protocol;
  createdAt: string;
  updatedAt: string;
}

export interface MonitoringData {
  deviceId: string;
  deviceName: string;
  pm25: number;
  pm10: number;
  noise: number;
  timestamp: string;
  status: DataStatus;
}

export interface AreaStats {
  area: string;
  deviceCount: number;
  avgPm25: number;
  avgPm10: number;
  avgNoise: number;
}

export interface OverviewStats {
  totalDevices: number;
  onlineDevices: number;
  offlineDevices: number;
  warningDevices: number;
  avgPm25: number;
  avgPm10: number;
  avgNoise: number;
  dangerCount: number;
  warningCount: number;
  normalCount: number;
}

export interface CreateDeviceRequest {
  name: string;
  code: string;
  location: string;
  area: string;
  pm25Threshold: number;
  pm10Threshold: number;
  noiseThreshold: number;
  ipAddress: string;
  port: number;
  protocol: Protocol;
}

export interface UpdateDeviceRequest extends Partial<CreateDeviceRequest> {}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}
