import { io } from "socket.io-client";

let socket = null;

// Khởi tạo socket
export const initSocket = (conversationId, onReceiveMessage, onMessageRead) => {
  if (!conversationId) return;

  socket = io("http://localhost:3001"); 
  socket.on("connect", () => {
    console.log("Connected to socket server:", socket.id);
    socket.emit("join", conversationId); // join room theo conversation
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from socket server");
  });

  // Lắng nghe tin nhắn đến
  socket.on("receiveMessage", (message) => {
    if (typeof onReceiveMessage === "function") {
      onReceiveMessage(message); // trả message về component
    }
  });

  socket.on("errorMessage", (error) => {
    console.error("Socket error:", error);
  });
};
// Lấy socket instance
export const getSocket = () => socket;
