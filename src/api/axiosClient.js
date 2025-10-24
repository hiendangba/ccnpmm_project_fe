import axios from "axios";
import authApi from "./authApi"
let getToken;

export const setTokenGetter = (fn) => {
  getToken = fn;
};

const axiosClient = axios.create({
  baseURL: "https://zaloute-api.onrender.com/api",
  // baseURL: "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true
})


axiosClient.interceptors.request.use((config) => {
  const token = getToken ? getToken() : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosClient.interceptors.response.use(
  async (response) => {
    return response.data; // trả về luôn data
  },
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;