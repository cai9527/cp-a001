import type { LoginRequest, LoginResponse, CaptchaResponse } from '../../shared/types';
import { request } from './http';

export const authApi = {
  getCaptcha: () => {
    return request<CaptchaResponse>('/auth/captcha', { skipAuth: true });
  },

  login: (data: LoginRequest) => {
    return request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    });
  },

  logout: () => {
    return request<null>('/auth/logout', {
      method: 'POST',
    });
  },
};
