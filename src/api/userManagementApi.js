import axiosClient from "./axiosClient";

const userManagementApi = {
  // User Management APIs
  getAllUsers: (params = {}) => {
    return axiosClient.get("/user/management/users", { params });
  },

  getUserById: (userId) => {
    return axiosClient.get(`/user/management/users/${userId}`);
  },

  updateUserRole: (userId, role) => {
    return axiosClient.put(`/user/management/users/${userId}/role`, { role });
  },

  deleteUser: (userId) => {
    return axiosClient.delete(`/user/management/users/${userId}`);
  },

  restoreUser: (userId) => {
    return axiosClient.post(`/user/management/users/${userId}/restore`);
  },

  getUserStatsByRole: () => {
    return axiosClient.get("/user/management/users/stats");
  },

  getDashboardStats: () => {
    return axiosClient.get("/user/management/dashboard");
  }
};

export default userManagementApi;
