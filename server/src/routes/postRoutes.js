import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createPost, getAllPosts } from "../controllers/postController.js";
const postRouter = express.Router();

postRouter.post("/", protect, createPost);
postRouter.get("/", protect, getAllPosts);


export default postRouter;