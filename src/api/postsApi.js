import axiosClient from "./axiosClient";

const postsApi = {
    getAllPost (data) {
        return axiosClient.get("/post/getAll", {params : data});
    }
}

export default postsApi;