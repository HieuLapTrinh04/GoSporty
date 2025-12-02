// src/api.js
import axios from "axios";

const DEFAULT_API = "http://localhost:10000"; // fallback nếu REACT_APP_API_URL không set
const envUrl = process.env.REACT_APP_API_URL;
const API_URL = envUrl && envUrl.trim() !== "" ? envUrl : DEFAULT_API;


const api = axios.create({
  baseURL: `${API_URL}/api`,
  // nếu bạn không dùng cookie-based auth thì để false, tránh rắc rối CORS
  withCredentials: false,
  headers: {
    "Content-Type": "application/json",
  },
});

// helper: set header Authorization mặc định (dùng sau khi login)
export const setAuthToken = (token) => {
  if (token) {
    // token phải là bare JWT string (không kèm "Bearer ")
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("token", token);
  } else {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("token");
  }
};

// interceptor: tự động attach token từ localStorage nếu có
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");
      if (token && !config.headers?.Authorization) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      // ignore
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// optional: response interceptor để log lỗi 401/403
api.interceptors.response.use(
  (res) => res,
  (err) => {
    // nếu token expired => clear localStorage và chuyển về login nếu cần
    if (err?.response?.status === 401) {
      // console.warn("API: unauthorized - clearing token");
      // setAuthToken(null); // uncomment nếu muốn tự động logout
    }
    return Promise.reject(err);
  }
);

export const productAPI = {
  getAll: (params) => api.get("/products", { params }),
  getById: (id) => api.get(`/products/${id}`),
  getBySlug: (slug) => api.get(`/products/slug/${slug}`),
  getRelated: (id) => api.get(`/products/${id}/related`),
  create: (data) => api.post("/products", data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
};

export default api;
