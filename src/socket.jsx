import { io } from "socket.io-client";
export const socket = io("https://zaloute-api.onrender.com", {
    transports: ["websocket"],
    secure: true,
});