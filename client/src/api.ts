import axios, { InternalAxiosRequestConfig, AxiosError, AxiosResponse } from 'axios';
import { NavigateFunction } from 'react-router-dom';

const api = axios.create({
  baseURL: 'http://localhost:8001/api',
  withCredentials: true
});

// Request Interceptor:
// Checks for a token in localStorage and adds it to the Authorization header.
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token: string | null = localStorage.getItem('token');
    if (token) {
      // TypeScript knows headers exist on InternalAxiosRequestConfig
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  }
);

export const setupResponseInterceptor = (navigate: NavigateFunction): void => {
    api.interceptors.response.use(
        (response: AxiosResponse) => response,
        (error: AxiosError) => {
            // TypeScript now knows error.response exists and has a status property
            if (error.response && error.response.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            }
            return Promise.reject(error);
        }
    );
};

export default api;