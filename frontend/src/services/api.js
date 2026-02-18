import axios from 'axios';

/**
 * PROFESSIONAL URL CONFIGURATION
 * When developing locally, it uses your .env variable or localhost.
 * When on Railway, it uses your production backend URL.
 */
const BASE_URL = import.meta.env.VITE_API_URL || 'https://tsbe.up.railway.app/api';

const API = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// --- Request Interceptor ---
// Automatically grabs the token from storage and injects it into every header
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// --- Response Interceptor ---
// If the backend says the token is invalid (401), we boot the user to login
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("Session expired or unauthorized. Logging out...");
      localStorage.clear(); // Clear token, role, and email
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// --- AUTH FUNCTIONS ---
export const loginUser = (data) => API.post('/auth/login', data);
export const registerUser = (data) => API.post('/auth/register', data);

// --- PROFESSIONAL/PRO FUNCTIONS ---
export const fetchPros = () => API.get('/pros/all'); 
export const fetchProProfile = (id) => API.get(`/pros/profile/${id}`);
export const requestService = (id) => API.post(`/pros/request/${id}`);

// --- ADMIN FUNCTIONS ---
export const fetchPendingPros = () => API.get('/admin/pending');
export const verifyPro = (id) => API.put(`/admin/verify/${id}`);
export const deleteUser = (id) => API.delete(`/admin/user/${id}`);

export default API;