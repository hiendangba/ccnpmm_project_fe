import axiosClient from "./axiosClient";

const messageApi = {
  getMessageOneToOne(data) {
    return axiosClient.get("/message/one-to-one", {params: data}); // không cần token
  },

  sendMessage(data){
    return axiosClient.post("/message/sendMessage",data)
  },

  messageRouter(data){
    return axiosClient.get("/message/getConversationID")
  },
};

export default messageApi;