import express from "express";
import { getMe } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
    updateUserProfile,
    getUserByUsername,
    getUsersByCollege,
    getUsersByCompany,
    getRecommendedUsers,
    getConnectionStats,
    getUserConnections,
} from "../controllers/userController.js";
const userRouter = express.Router();


userRouter.get("/profile", protect, getMe)
userRouter.put("/profile", protect, updateUserProfile)
userRouter.get("/college/:name/members", protect, getUsersByCollege)
userRouter.get("/company/:name/members", protect, getUsersByCompany)
userRouter.get("/recommend", protect, getRecommendedUsers)
userRouter.get("/stats", protect, getConnectionStats)
userRouter.get("/:username/connections", protect, getUserConnections)
userRouter.get("/:username", protect, getUserByUsername)


export default userRouter;

