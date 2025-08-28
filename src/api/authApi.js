import axiosClient from "./axiosClient";

const authApi = {
  login(data) {
    return axiosClient.post("/auth/login", data); // không cần token
  },
  register(data) {
    return axiosClient.post("/auth/register", data); // không cần token
  },
  verifyOTP(data) {
    return axiosClient.post("/auth/verify-otp", data);
  },
};

export default authApi;