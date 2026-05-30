import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    createPost,
    getAllPosts,
    getMyPosts,
    getPostsByUsername,
    deletePost,
} from "../controllers/postController.js";
const postRouter = express.Router();

postRouter.post("/", protect, createPost);
postRouter.get("/", protect, getAllPosts);
postRouter.get("/me", protect, getMyPosts);
postRouter.get("/user/:username", protect, getPostsByUsername);
postRouter.delete("/:id", protect, deletePost);

export default postRouter;