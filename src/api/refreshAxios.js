import axios from "axios";

const refreshAxios = axios.create({
    baseURL: "https://zaloute-api.onrender.com/api",
    withCredentials: true,
});

export default refreshAxios;
