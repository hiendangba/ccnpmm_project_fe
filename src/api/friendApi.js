import axiosClient from "./axiosClient";

const friendApi = {
  getReceivedRequest() {
    return axiosClient.get("/friend/requests/received");
  },

  getSentRequest() {
    return axiosClient.get("/friend/requests/sent");
  },

  getFriend() {
    return axiosClient.get("/friend/list");
  },

  acceptFriend(data) {
    return axiosClient.post("/friend/accept", data)
  },

  rejectFriend(data) {
    return axiosClient.post("/friend/reject", data)
  },

  cancelFriend(requestId) {
    return axiosClient.delete(`/friend/cancel/${requestId}`);
  },

  removeFriend(requestId) {
    return axiosClient.delete(`/friend/remove/${requestId}`);
  },


  sendRequest(data) {
    return axiosClient.post("/friend/request", data)
  },

};

export default friendApi;