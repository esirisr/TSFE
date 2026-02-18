import axios from 'axios';

const API = axios.create({
  baseURL: 'https://tsbe-production.up.railway.app/api',
});

// Request Interceptor: Attach token to every outgoing request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Global error handling (e.g., redirect on 401)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Optional: window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// --- Auth Functions ---
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);

// --- Professional Functions ---
export const fetchPros = () => API.get('/pros/all'); 
export const requestService = (id) => API.post(`/pros/request/${id}`);

// --- Admin Functions ---
export const fetchPendingPros = () => API.get('/admin/pending');
export const verifyPro = (id) => API.put(`/admin/verify/${id}`);

export default API;