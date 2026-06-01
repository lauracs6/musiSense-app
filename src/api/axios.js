import axios from "axios";

axios.defaults.withCredentials = true;

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://musisense.test/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // 401: No autenticado
      if (status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }

      // 403: Cuenta desactivada o acceso prohibido
      if (
        status === 403 &&
        data?.message &&
        data.message.includes("deactivated")
      ) {
        // Guardar mensaje para mostrarlo en login
        localStorage.setItem("deactivatedMessage", data.message);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
