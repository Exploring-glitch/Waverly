import Post from "../models/Post.js";

export const createPost = async (req, res) => {
    try {
        const { content, image } = req.body;

        if (!content || !content.trim()) {
            return res.status(400).json({ message: "Content is required to create a post" });
        }

        const newPost = await Post.create({
            author: req.user._id,
            content: content,
            image: image || "",
        });

        const populatedPost = await newPost.populate("author", "name username profilePic additionalName");

        res.status(201).json({
            message: "Post created successfully",
            post: populatedPost
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate("author", "name username profilePic additionalName");

        res.status(200).json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};
