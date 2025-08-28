import axios from "axios";

const axiosClient = axios.create({
    baseURL: "http://localhost:3000/api",
    headers: {
    "Content-Type": "application/json",
  }
})
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor cho response
axiosClient.interceptors.response.use(
  (response) => {
    // Trả luôn data (đỡ phải res.data ở component)
    return response.data;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosClient;