import express from "express";
import { getMe } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
const userRouter = express.Router();

userRouter.get("/profile", protect, getMe)

export default userRouter;

