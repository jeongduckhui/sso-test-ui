import axios from "axios";
import { getOrCreateDeviceId } from "../auth/deviceId";

export const api = axios.create({
  baseURL: "http://localhost:8081",
  withCredentials: true,
});

export const refreshApi = axios.create({
  baseURL: "http://localhost:8081",
  withCredentials: true,
});

let isRefreshing = false;
let refreshSubscribers = [];
let authFailed = false;

// 🔥 refresh 실패 시 완전 차단
function isAuthFailed() {
  return authFailed;
}

function subscribeTokenRefresh(callback) {
  refreshSubscribers.push(callback);
}

function notifyRefreshSuccess(newToken) {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
}

function notifyRefreshFailure() {
  refreshSubscribers.forEach((callback) => callback(null));
  refreshSubscribers = [];
}

function moveToLoginOnce() {
  if (window.location.pathname !== "/login") {
    window.location.replace("/login");
  }
}

function clearAuthState() {
  localStorage.removeItem("accessToken");
  authFailed = true;
}

//
// REQUEST INTERCEPTOR
//

api.interceptors.request.use((config) => {
  if (isAuthFailed()) {
    return config;
  }

  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  const deviceId = getOrCreateDeviceId();

  config.headers = config.headers ?? {};
  config.headers["X-Device-Id"] = deviceId;

  return config;
});

refreshApi.interceptors.request.use((config) => {
  const deviceId = getOrCreateDeviceId();

  config.headers = config.headers ?? {};
  config.headers["X-Device-Id"] = deviceId;

  return config;
});

//
// RESPONSE INTERCEPTOR
//

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const requestUrl = originalRequest?.url ?? "";

    if (!originalRequest || !status) {
      return Promise.reject(error);
    }

    // 🔥 이미 인증 실패 상태면 아무 것도 하지 않음
    if (isAuthFailed()) {
      return Promise.reject(error);
    }

    // refresh / logout 요청은 interceptor에서 처리 안함
    if (
      requestUrl.includes("/auth/refresh") ||
      requestUrl.includes("/auth/logout")
    ) {
      return Promise.reject(error);
    }

    // 🔥 refresh 실패 케이스 (401 + 409 둘 다 처리)
    if (status === 401 && requestUrl.includes("/auth/refresh")) {
      clearAuthState();
      moveToLoginOnce();
      return Promise.reject(error);
    }

    if (status === 409) {
      clearAuthState();
      moveToLoginOnce();
      return Promise.reject(error);
    }

    // 🔥 일반 API 401 → refresh 시도
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken) => {
            if (!newToken) {
              reject(error);
              return;
            }

            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;

            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const res = await refreshApi.post("/auth/refresh");

        const newToken = res.data.accessToken;

        localStorage.setItem("accessToken", newToken);
        authFailed = false;

        notifyRefreshSuccess(newToken);

        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return api(originalRequest);
      } catch (refreshError) {
        clearAuthState();
        notifyRefreshFailure();
        moveToLoginOnce();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export function resetAuthFailed() {
  authFailed = false;
}

export default api;
