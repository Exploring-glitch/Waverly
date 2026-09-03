import { io } from "socket.io-client";

let socket = null;

const SOCKET_URL = import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
    : "http://localhost:5000";

export const getSocket = (userId) => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            withCredentials: true,
            autoConnect: true,
            query: userId ? { userId: String(userId) } : {},
            auth: userId ? { userId: String(userId) } : {},
            reconnection: true,
            reconnectionAttempts: 10,
            reconnectionDelay: 2000,
        });
    }

    if (userId && socket.connected) {
        socket.emit("register_user", String(userId));
    }

    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
