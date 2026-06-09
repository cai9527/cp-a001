export type DeviceStatus = 'online' | 'offline' | 'warning';
export type DataStatus = 'normal' | 'warning' | 'danger';
export type Protocol = 'MQTT' | 'HTTP' | 'Modbus';
export type UserRole = 'admin' | 'user';

export const ROLES = {
  ADMIN: 'admin' as UserRole,
  USER: 'user' as UserRole,
} as const;

export const PERMISSIONS = {
  VIEW_DASHBOARD: 'view:dashboard',
  VIEW_DEVICES: 'view:devices',
  VIEW_REALTIME: 'view:realtime',
  CREATE_DEVICE: 'create:device',
  UPDATE_DEVICE: 'update:device',
  DELETE_DEVICE: 'delete:device',
} as const;

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS];

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_DEVICES,
    PERMISSIONS.VIEW_REALTIME,
    PERMISSIONS.CREATE_DEVICE,
    PERMISSIONS.UPDATE_DEVICE,
    PERMISSIONS.DELETE_DEVICE,
  ],
  user: [
    PERMISSIONS.VIEW_DEVICES,
    PERMISSIONS.VIEW_REALTIME,
    PERMISSIONS.UPDATE_DEVICE,
  ],
};

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

export interface LoginRequest {
  username: string;
  password: string;
  captcha: string;
  captchaId: string;
}

export interface LoginResponse {
  token: string;
  user: UserInfo;
}

export interface UserInfo {
  id: string;
  username: string;
  nickname: string;
  role: UserRole;
}

export interface CaptchaResponse {
  captchaId: string;
  image: string;
}
