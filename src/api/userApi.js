import axiosClient from "./axiosClient";

const userApi = {
  getProfile(data) {
    return axiosClient.get("/user/profile", data); // không cần token
  },
  all(data) {
    return axiosClient.get("/user/all", { params: data }); // data sẽ thành query string
  },
  updateProfile(data) {
    return axiosClient.put("/user/profile", data);
  },
  postNew(data){
    return axiosClient.post("/user/postNew", data);
  },
  searchUser (data){
    return axiosClient.post("/user/find-user", data);
  }
};

export default userApi;