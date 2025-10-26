import axios from "axios";
import refreshAxios from "./refreshAxios";
let getToken;

export const setTokenGetter = (fn) => {
  getToken = fn;
};



const axiosClient = axios.create({
  // baseURL: "https://zaloute-api.onrender.com/api",
  baseURL: "http://localhost:3001/api",
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
        const res = await refreshAxios.post("/auth/refreshToken");
        console.log("Token đã được làm mới:", res);
        const newToken = res.data.token;
        setTokenGetter(() => newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        const retryResponse = await axios(originalRequest);
        return retryResponse.data; // trả về data của request cũ
      } catch (err) {
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;