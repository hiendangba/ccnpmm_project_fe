import axiosClient from "./axiosClient";

const postsApi = {
    getAllPost (data) {
        return axiosClient.get("/post/getAll", {params : data});
    },
    likePost (data) {
        return axiosClient.post("/post/likePost", data)
    } 
}

export default postsApi;