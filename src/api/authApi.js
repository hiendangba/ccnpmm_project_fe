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
  forgotPassword(data){
    return axiosClient.post("/auth/forgot-password", data);
  },
  verifyOtpFP(data){
    return axiosClient.post("/auth/verify-otpFP", data);
  },
  resendOTP(data){
    return axiosClient.post("/auth/resend-OTP", data);
  },
  resetPassword(data){
    return axiosClient.post("/auth/reset-password", data);
  },
  refreshToken(){
    return axiosClient.post("/auth/refreshToken");
  }
};

export default authApi;