import api from "../api/axios";

export const logout = async () => {
  try {
    await api.post("/auth/logout");
  } catch (e) {
    console.error("logout error", e);
  } finally {
    localStorage.removeItem("accessToken");
    window.location.replace("/login");
  }
};
