import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api',
  withCredentials: true, // Send cookies with requests
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response) {
      const { status } = error.response;
      
      // Unauthorized - will be handled by auth context
      if (status === 401) {
        // Don't redirect here, let the auth context handle it
      }
      
      // Forbidden - no permission
      if (status === 403) {
        console.error('Access denied');
      }
      
      // Server error
      if (status >= 500) {
        console.error('Server error');
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
