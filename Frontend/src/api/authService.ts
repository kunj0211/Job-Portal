import axios from 'axios';

// Configure axios defaults
axios.defaults.withCredentials = true;

const API_URL = '/api/auth';

// Axios interceptor for handling token expiration
axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && error.response?.data?.code === 'TOKEN_EXPIRED' && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Call the refresh endpoint
        await axios.post(`${API_URL}/refresh`);
        // Retry the original request
        return axios(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login or clear auth state
        // This will be handled by the AuthContext usually
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authService = {
  // Standard Email/Password Signup
  register: async (data: any) => {
    const response = await axios.post(`${API_URL}/register`, data);
    return response.data;
  },

  // Standard Email/Password Login
  login: async (data: any) => {
    const response = await axios.post(`${API_URL}/login`, data);
    return response.data;
  },

  // Google Sign-In Verification
  verifyGoogleAuth: async (idToken: string) => {
    const response = await axios.post(`${API_URL}/google`, { idToken });
    return response.data;
  },

  // Check Auth Session
  checkAuth: async () => {
    const response = await axios.get(`${API_URL}/me`);
    return response.data;
  },

  // Logout
  logout: async () => {
    const response = await axios.post(`${API_URL}/logout`);
    return response.data;
  }
};
