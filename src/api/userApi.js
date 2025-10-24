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

  uploadAvatar(formData) {
    return axiosClient.put("/user/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
  },
  postNew(data){
    return axiosClient.post("/user/postNew", data, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
  },

  searchUser (data){
    return axiosClient.get("/user/find-user", {params: data});
  },

  getUserPage(userId) {
    return axiosClient.get("/user/userInfo", {
      params: { userId }
    }); // không cần token
  },
  
};

export default userApi;