// src/utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5002",
});

// Safe storage getter
function safeGetToken() {
  try {
    const s = sessionStorage.getItem("skope_auth_token")
    if (s) return s
  } catch {}

  try {
    const l = localStorage.getItem("skope_auth_token") || localStorage.getItem("token")
    if (l) return l
  } catch {}

  return null
}


// Attach token automatically to every request
api.interceptors.request.use((config) => {
  const token = safeGetToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})


export default api;
