// src/utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5002",
});

function safeGet(key) {
  try {
    return sessionStorage.getItem(key); // ✅ FIXED
  } catch {
    return null;
  }
}

api.interceptors.request.use((config) => {
  try {
    const token = sessionStorage.getItem("skope_auth_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  } catch {
    // storage blocked – ignore
  }
  return config
})



export default api;
