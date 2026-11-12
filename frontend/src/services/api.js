import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: attach JWT token if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('techcare_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: auto-retry on proxy 404 & handle 401 unauthenticated
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // If request failed with 404 or Network Error on proxy /api, retry directly to backend ports
    if ((!error.response || error.response.status === 404) && originalRequest && !originalRequest._retry) {
      originalRequest._retry = true;
      const fallbackBases = ['http://127.0.0.1:5000/api', 'http://127.0.0.1:5001/api'];
      for (const fallbackBase of fallbackBases) {
        try {
          let directPath = originalRequest.url || '';
          if (directPath.startsWith('/api')) {
            directPath = directPath.replace(/^\/api/, '');
          }
          if (!directPath.startsWith('/')) directPath = '/' + directPath;
          const directUrl = `${fallbackBase}${directPath}`;

          return await axios({
            ...originalRequest,
            baseURL: undefined,
            url: directUrl
          });
        } catch (retryErr) {
          if (retryErr.response && retryErr.response.status !== 404) {
            return Promise.reject(retryErr);
          }
        }
      }
    }

    if (error.response && error.response.status === 401) {
      // Optional auto logout or trigger event
      const currentPath = window.location.pathname;
      if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
        localStorage.removeItem('techcare_token');
        localStorage.removeItem('techcare_user');
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
