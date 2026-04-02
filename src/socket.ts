import { io } from "socket.io-client";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export const socket = io(`${apiUrl}/notifications`, {
  withCredentials: true,
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5,
  transports: ["websocket", "polling"],
  autoConnect: false,
});

socket.on("connect", () => {
  console.log("✅ WebSocket connected:", socket.id);
});

socket.on("disconnect", () => {
  console.log("❌ WebSocket disconnected");
});

socket.on("error", (error: Error) => {
  console.error("❌ WebSocket error:", error);
});

socket.on("connect_error", (error: Error) => {
  console.error("❌ Connect error:", error);
});