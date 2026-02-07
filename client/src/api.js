import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const api = axios.create({
  baseURL: 'http://localhost:8001/api',
  withCredentials: true
});

// Request Interceptor:
// Checks for a token in localStorage and adds it to the Authorization header.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const setupResponseInterceptor = (navigate) => {
    api.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response && error.response.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            }
            return Promise.reject(error);
        }
    );
};
export default api;