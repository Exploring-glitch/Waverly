import { Server } from "socket.io";

let io = null;

export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:5173",
            credentials: true,
            methods: ["GET", "POST", "PUT", "DELETE"],
        },
    });

    io.on("connection", (socket) => {
        const userId = socket.handshake.query?.userId || socket.handshake.auth?.userId;

        if (userId) {
            socket.join(String(userId));
        }

        socket.on("register_user", (id) => {
            if (id) {
                socket.join(String(id));
            }
        });

        socket.on("disconnect", () => {
            // Handled automatically by socket.io
        });
    });

    return io;
};

export const getIO = () => {
    return io;
};

export const emitToUser = (userId, eventName, payload = {}) => {
    if (!io || !userId) return;
    io.to(String(userId)).emit(eventName, payload);
};

export const emitToUsers = (userIds, eventName, payload = {}) => {
    if (!io || !Array.isArray(userIds)) return;
    userIds.forEach((id) => {
        if (id) io.to(String(id)).emit(eventName, payload);
    });
};

export const emitBroadcast = (eventName, payload = {}) => {
    if (!io) return;
    io.emit(eventName, payload);
};
