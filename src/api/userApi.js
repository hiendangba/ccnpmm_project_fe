import axiosClient from "./axiosClient";

const userApi = {
  getProfile(data) {
    return axiosClient.get("/user/profile", data); // không cần token
  },
  all(data) {
    return axiosClient.get("/user/all", data); // không cần token
  },
  updateProfile(data) {
    return axiosClient.put("/user/profile", data);
  },
};

export default userApi;