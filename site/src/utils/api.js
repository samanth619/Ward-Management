import axios from "axios";
import { isTokenExpired, decodeToken } from "./token";

// Use relative path for API calls when using Vite proxy in development
// This ensures requests go through the Vite proxy instead of directly to the API
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false, // Set to false when using proxy
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const accessToken = localStorage.getItem("access_token");
      const refreshToken = localStorage.getItem("refresh_token");

      // Log token expiration for debugging
      if (accessToken) {
        const accessTokenDecoded = decodeToken(accessToken);
        if (isTokenExpired(accessToken)) {
          console.log("🔄 Access token expired, attempting refresh...");
          if (accessTokenDecoded?.exp) {
            console.log(
              "   Expired at:",
              new Date(accessTokenDecoded.exp * 1000).toISOString()
            );
          }
        }
      }

      try {
        if (refreshToken) {
          // Check if refresh token is also expired
          if (isTokenExpired(refreshToken)) {
            console.log("❌ Refresh token also expired, logging out");
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("user");
            window.location.href = "/login";
            return Promise.reject(new Error("Refresh token expired"));
          }

          // Use the same base URL logic for refresh token call
          const refreshUrl = API_BASE_URL.startsWith("http")
            ? `${API_BASE_URL}/auth/refresh`
            : "/api/auth/refresh";

          console.log("🔄 Calling refresh token endpoint...");
          const response = await axios.post(refreshUrl, {
            refresh_token: refreshToken,
          });

          const { access_token } = response.data.data.tokens;
          localStorage.setItem("access_token", access_token);
          originalRequest.headers.Authorization = `Bearer ${access_token}`;

          // Decode new token to show expiration
          const newTokenDecoded = decodeToken(access_token);
          if (newTokenDecoded) {
            console.log("✅ Token refreshed successfully");
            if (newTokenDecoded.exp) {
              console.log(
                "   New access token exp:",
                new Date(newTokenDecoded.exp * 1000).toISOString()
              );
            }
          }

          return api(originalRequest);
        } else {
          console.log("❌ No refresh token available, logging out");
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("user");
          window.location.href = "/login";
          return Promise.reject(new Error("No refresh token"));
        }
      } catch (refreshError) {
        // Refresh failed, logout user
        console.error("❌ Token refresh failed:", refreshError);
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// Auth API calls
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  refreshToken: (refreshToken) =>
    api.post("/auth/refresh", { refresh_token: refreshToken }),
  getCurrentUser: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/me", data),
  changePassword: (data) => api.put("/auth/change-password", data),
};

// Dashboard API calls
export const dashboardAPI = {
  getDashboard: (params) => api.get("/dashboard", { params }),
};

// Residents API calls
export const residentsAPI = {
  getResidents: (params) => api.get("/residents", { params }),
  getResidentById: (id) => api.get(`/residents/${id}`),
};
