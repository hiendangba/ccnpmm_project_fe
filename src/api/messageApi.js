import axiosClient from "./axiosClient";

const messageApi = {
  getMessageOneToOne(data) {
    return axiosClient.get("/message/one-to-one", {params: data}); // không cần token
  },

  sendMessage(data) {
    return axiosClient.post("/message/sendMessage", data, {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
  },

  getConversation(data){
    return axiosClient.get("/message/conversation")
  },

  markAsRead(id) {
    return axiosClient.patch(`/message/${id}/read`);
  },
  getMessageGroup(data){
    return axiosClient.get("/message/group", {params: data});
  }
};

export default messageApi;