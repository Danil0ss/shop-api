import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const fetchProducts = (signal) => api.get('/products', { signal });
export const addProductApi = (product) => api.post('/products', product);
export const updateProductApi = (id, product) => api.put(`/products/${id}`, product);
export const deleteProductApi = (id) => api.delete(`/products/${id}`);

export const loginApi = (email, password) => api.post('/auth/login', { email, password });
export const getProfileApi = () => api.get('/auth/profile');

export default api;