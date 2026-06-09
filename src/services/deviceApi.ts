import type {
  Device,
  CreateDeviceRequest,
  UpdateDeviceRequest,
  PaginatedResponse,
} from '../../shared/types';
import { request, buildQueryParams } from './http';

interface DeviceListParams {
  search?: string;
  area?: string;
  page?: number;
  pageSize?: number;
}

export const deviceApi = {
  getList: (params?: DeviceListParams) => {
    return request<PaginatedResponse<Device>>(
      `/devices${buildQueryParams((params || {}) as Record<string, unknown>)}`,
    );
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
