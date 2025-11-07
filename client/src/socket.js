// src/socket.js
import { io } from "socket.io-client";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Allow polling fallback so the client works where websocket upgrade fails
const socket = io(API_BASE, {
  path: "/socket.io",
  transports: ["websocket", "polling"], // don't force websocket-only
  // withCredentials: true, // uncomment only if you need cookies sent
});

export default socket;
