import { io } from "socket.io-client";

const socket = io(
  import.meta.env.VITE_SOCKET_URL ||
  "https://realtime-whiteboard-m8bs.onrender.com"
);

export default socket;