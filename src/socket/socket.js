import { io } from "socket.io-client";

let socket = null;

export const initSocket = () => {
  if (!socket) {
    socket = io("http://localhost:3001");

    socket.on("connect", () => console.log("Socket connected:", socket.id));
    socket.on("disconnect", () => console.log("Socket disconnected"));
  }
  return socket;
};

export const joinRoom = (conversationId) => {
  socket?.emit("join", conversationId);
};

export const leaveRoom = (conversationId) => {
  socket?.emit("leave", conversationId);
};

export const onEvent = (event, handler, removePrevious = true) => {
  if (removePrevious) socket?.off(event);
  socket?.on(event, handler);
};


// Huỷ listener cụ thể
export const offEvent = (event, handler) => {
  if (!socket) return;
  socket.off(event, handler);
};

// Huỷ tất cả listener
export const offAllEvents = () => {
  if (!socket) return;
  socket.removeAllListeners();
};
