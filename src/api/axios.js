import axios from "axios";
import { getOrCreateDeviceId } from "../auth/deviceId";
import { getCurrentScreenContext } from "../txlog/screenContext";
import { getCurrentTxLog, clearCurrentTxLog } from "../txlog/txLogContext";

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

// 수정: 공통 헤더 세팅 함수 추가
function applyCommonHeaders(config) {
  config.headers = config.headers ?? {};

  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const deviceId = getOrCreateDeviceId();
  config.headers["X-Device-Id"] = deviceId;

  // 수정: 현재 활성 화면 정보 헤더 세팅
  const screenContext = getCurrentScreenContext();
  if (screenContext) {
    config.headers["X-Program-Id"] = screenContext.programId ?? "";
    config.headers["X-Program-Name"] = screenContext.programName ?? "";
    config.headers["X-Program-Title-Name"] =
      screenContext.programTitleName ?? "";
    // 🔥 핵심 수정
    if (!config.headers["X-Func-Id"]) {
      config.headers["X-Func-Id"] = screenContext.funcId ?? "";
    }
    config.headers["X-Menu-Key"] = screenContext.menuKey ?? "";

    // 임시값
    config.headers["X-System-Type-Code"] = "testSystemTypeCode";
  }

  // 수정: API 호출 시 전달한 txLog 정보로 svcId / transactionType 헤더 세팅
  const txLog = getCurrentTxLog() ?? {};

  config.headers["X-Svc-Id"] = txLog.svcId ?? "";
  config.headers["X-Transaction-Type"] = txLog.transactionType ?? "";

  config.headers["X-Loggable"] = txLog.loggable ?? false;

  return config;
}

//
// REQUEST INTERCEPTOR
//

api.interceptors.request.use((config) => {
  if (isAuthFailed()) {
    return config;
  }

  return applyCommonHeaders(config); // 수정: 기존 직접 세팅 대신 공통 함수 호출
});

refreshApi.interceptors.request.use((config) => {
  config.headers = config.headers ?? {};

  const deviceId = getOrCreateDeviceId();
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

    if (isAuthFailed()) {
      return Promise.reject(error);
    }

    if (
      requestUrl.includes("/auth/refresh") ||
      requestUrl.includes("/auth/logout")
    ) {
      return Promise.reject(error);
    }

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
