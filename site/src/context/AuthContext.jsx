import { createContext, useContext, useState, useEffect, useMemo } from "react";
import { authAPI } from "../utils/api";
import { isTokenExpired } from "../utils/token";

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Clear auth data helper
  const clearAuthData = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  };

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem("user");
    const accessToken = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");

    if (storedUser && accessToken) {
      // Check if both tokens are expired
      const accessExpired = isTokenExpired(accessToken);
      const refreshExpired = refreshToken ? isTokenExpired(refreshToken) : true;

      if (accessExpired && refreshExpired) {
        console.log("❌ Both access and refresh tokens expired, logging out");
        clearAuthData();
        setLoading(false);
        return;
      }

      if (accessExpired) {
        console.log("⚠️ Access token expired - auto-refresh will handle this");
      } else {
        console.log("✅ Access token is valid");
      }

      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Error parsing user data:", error);
        clearAuthData();
      }
    }
    setLoading(false);
  }, []);

  // Track token expiration state to trigger re-renders
  const [tokenCheck, setTokenCheck] = useState(0);

  // Check if user is authenticated (user exists and access token is valid or refresh token is valid)
  const isAuthenticated = useMemo(() => {
    if (!user) return false;

    const accessToken = localStorage.getItem("access_token");
    const refreshToken = localStorage.getItem("refresh_token");

    // If no tokens, not authenticated
    if (!accessToken && !refreshToken) return false;

    // If access token is valid, authenticated
    if (accessToken && !isTokenExpired(accessToken)) return true;

    // If access token expired but refresh token is valid, still authenticated (auto-refresh will handle)
    if (refreshToken && !isTokenExpired(refreshToken)) return true;

    // Both tokens expired, not authenticated
    return false;
  }, [user, tokenCheck]);

  // Set up interval to check token expiration periodically and update state
  useEffect(() => {
    if (!user) return;

    const checkTokenExpiration = () => {
      const accessToken = localStorage.getItem("access_token");
      const refreshToken = localStorage.getItem("refresh_token");

      if (accessToken) {
        const accessExpired = isTokenExpired(accessToken);
        const refreshExpired = refreshToken
          ? isTokenExpired(refreshToken)
          : true;

        // Update tokenCheck to trigger re-render
        setTokenCheck(Date.now());

        if (accessExpired && refreshExpired) {
          console.log("❌ Both tokens expired, logging out");
          clearAuthData();
          // Redirect to login
          window.location.href = "/login";
          return;
        }

        if (accessExpired) {
          console.log(
            "⚠️ Access token expired - auto-refresh will handle on next request"
          );
        }
      }
    };

    // Check every 5 seconds
    const interval = setInterval(checkTokenExpiration, 10000);

    return () => clearInterval(interval);
  }, [user]);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { user, tokens } = response.data.data;

      localStorage.setItem("access_token", tokens.access_token);
      localStorage.setItem("refresh_token", tokens.refresh_token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
      return { success: true, data: response.data.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { user, tokens } = response.data.data;

      if (tokens) {
        localStorage.setItem("access_token", tokens.access_token);
        localStorage.setItem("refresh_token", tokens.refresh_token);
        localStorage.setItem("user", JSON.stringify(user));
        setUser(user);
      }

      return { success: true, data: response.data.data };
    } catch (error) {
      // Handle both validation errors and other errors
      const errorResponse = error.response?.data;
      return {
        success: false,
        error: errorResponse?.message || "Registration failed",
        message: errorResponse?.message,
        errors: errorResponse?.errors, // Array of {field, message, value}
        error_code: errorResponse?.error_code,
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuthData();
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
