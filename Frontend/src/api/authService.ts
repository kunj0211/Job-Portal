import axios from 'axios';

// The /api calls will be proxied by Vite to our Express backend
const API_URL = '/api/auth';

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
  }
};
