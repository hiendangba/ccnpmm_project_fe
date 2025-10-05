import axiosClient from "./axiosClient";

const postsApi = {
    getAllPost (data) {
        return axiosClient.get("/post/getAll", {params : data});
    },
    likePost (data) {
        return axiosClient.post("/post/likePost", data)
    }, 
    commentPost (data) {
        return axiosClient.post("/post/commentPost", data, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
    },
    sharePost (data) {
        return axiosClient.post("/post/sharePost", data)
    }
}

export default postsApi;