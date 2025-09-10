import axios from "axios";
import { toast } from "sonner";

const BASE_URL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 120000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

const TokenStorage = {
  getAccessToken: () => localStorage.getItem("accessToken"),
  setAccessToken: (token) => localStorage.setItem("accessToken", token),
  getRefreshToken: () => localStorage.getItem("refreshToken"),
  setRefreshToken: (token) => localStorage.setItem("refreshToken", token),
  getUser: () => {
    try {
      const user = localStorage.getItem("user");
      if (!user) return false;
      return JSON.parse(user);
    } catch {
      return false;
    }
  },
  setUser: (user) => localStorage.setItem("user", JSON.stringify(user)),
  getIdToken: () => localStorage.getItem("idToken"),
  setIdToken: (token) => localStorage.setItem("idToken", token),
  clearTokens: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    localStorage.removeItem("idToken");
  },
};

// Token refresh state
let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onTokenRefreshed = (token) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = TokenStorage.getAccessToken();
    const user = TokenStorage.getUser();

    if (accessToken && !config._retry && !config.headers["Authorization"]) {
      config.headers["Authorization"] = `Bearer ${accessToken}`;
    }

    if (user) {
      const schoolId = parseInt(user["school.id"]);
      const method = config.method?.toLowerCase();
      if (!isNaN(schoolId)) {
        if (["post", "put", "patch"].includes(method)) {
          config.data = {
            ...(config.data || {}),
            schoolId,
          };
        } else if (method === "get") {
          config.params = {
            ...(config.params || {}),
            schoolId,
          };
        }
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.data?.message === "jwt expired" &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Handle refresh manually here or leave blank if not implemented
        throw new Error("Token refresh not implemented");

      } catch (refreshError) {
        TokenStorage.clearTokens();
        refreshSubscribers = [];
        toast.error("Session expired. Please log in again.");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response) {
      const errorMessage =
        error.response.data?.message || "Something went wrong!";
      toast.error(errorMessage);
    } else {
      toast.error("Network error. Please try again.");
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
export { TokenStorage };
