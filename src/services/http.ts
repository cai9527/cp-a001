import type { ApiResponse } from '../../shared/types';

export const API_BASE = '/api';

export interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

function getAuthToken(): string | null {
  return localStorage.getItem('auth_token');
}

export function buildQueryParams(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      if (value.length > 0) {
        searchParams.set(key, value.join(','));
      }
    } else {
      searchParams.set(key, String(value));
    }
  });
  const queryStr = searchParams.toString();
  return queryStr ? `?${queryStr}` : '';
}

export async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { skipAuth = false, headers: customHeaders, ...rest } = options;
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };
  if (!skipAuth && token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE}${url}`, {
    ...rest,
    headers,
  });
  if (!response.ok && response.status >= 500) {
    throw new Error('服务器错误，请稍后重试');
  }
  const result = (await response.json()) as ApiResponse<T>;
  if (result.code !== 0) {
    throw new Error(result.message);
  }
  return result.data;
}
