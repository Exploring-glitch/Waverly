import http from "http";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./src/config/db.js";
import { initSocket } from "./src/socket.js";
import authRouter from "./src/routes/authRoutes.js";
import userRouter from "./src/routes/userRoutes.js";
import postRouter from "./src/routes/postRoutes.js";
import searchRouter from "./src/routes/searchRoutes.js";
import notificationRouter from "./src/routes/notificationRoutes.js";
dotenv.config({ path: "./.env" });

if (!process.env.JWT_SECRET) {
    console.error("Missing JWT_SECRET in server/.env — add it and restart the server.");
    process.exit(1);
}

const app = express();
const httpServer = http.createServer(app);

// Initialize Socket.io
initSocket(httpServer);

app.use(cors({
    origin: [process.env.CLIENT_URL || "http://localhost:5173"],
    credentials: true
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/posts", postRouter);
app.use("/api/search", searchRouter);
app.use("/api/notifications", notificationRouter);

const PORT = process.env.PORT || 5000;
connectDB().then(() => {
    httpServer.listen(PORT, () => {
        console.log(`Backend server with Socket.io is running on port ${PORT}`);
    });
});
