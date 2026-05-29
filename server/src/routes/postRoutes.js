import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createPost, getAllPosts, deletePost } from "../controllers/postController.js";
const postRouter = express.Router();

postRouter.post("/", protect, createPost);
postRouter.get("/", protect, getAllPosts);
postRouter.delete("/:id", protect, deletePost);

export default postRouter;