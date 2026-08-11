import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    createPost,
    getAllPosts,
    getMyPosts,
    getPostsByUsername,
    updatePost,
    deletePost,
    likePost,
    commentPost,
    likeComment,
    replyComment,
    editComment,
    deleteComment,
    likeReply,
    editReply,
    deleteReply,
} from "../controllers/postController.js";
const postRouter = express.Router();

postRouter.post("/", protect, createPost);
postRouter.get("/", protect, getAllPosts);
postRouter.get("/me", protect, getMyPosts);
postRouter.get("/user/:username", protect, getPostsByUsername);
postRouter.delete("/:id", protect, deletePost);
postRouter.put("/:id", protect, updatePost);
postRouter.post("/:id/like", protect, likePost);
postRouter.post("/:id/comment", protect, commentPost);
postRouter.post("/:id/comments/:commentId/like", protect, likeComment);
postRouter.post("/:id/comments/:commentId/reply", protect, replyComment);
postRouter.put("/:id/comments/:commentId", protect, editComment);
postRouter.delete("/:id/comments/:commentId", protect, deleteComment);
postRouter.post("/:id/comments/:commentId/replies/:replyId/like", protect, likeReply);
postRouter.put("/:id/comments/:commentId/replies/:replyId", protect, editReply);
postRouter.delete("/:id/comments/:commentId/replies/:replyId", protect, deleteReply);

export default postRouter;