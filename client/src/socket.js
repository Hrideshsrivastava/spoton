import { io } from "socket.io-client";

const socket = io("https://spoton-iwy3.onrender.com", {
  transports: ["websocket"],
});

export default socket;
