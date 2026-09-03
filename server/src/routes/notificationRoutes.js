import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
} from "../controllers/notificationController.js";

const notificationRouter = express.Router();

notificationRouter.get("/", protect, getNotifications);
notificationRouter.get("/unread-count", protect, getUnreadCount);
notificationRouter.put("/read-all", protect, markAllAsRead);
notificationRouter.put("/:id/read", protect, markAsRead);
notificationRouter.delete("/:id", protect, deleteNotification);
notificationRouter.delete("/", protect, clearAllNotifications);

export default notificationRouter;
