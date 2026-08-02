import Post from "../models/Post.js";
import User from "../models/User.js";

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
            .populate("author", "name username profilePic additionalName")
            .populate({
                path: "comments.author",
                select: "name username profilePic additionalName"
            });

        res.status(200).json(posts);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getMyPosts = async (req, res) => {
    try {
        const posts = await Post.find({ author: req.user._id })
            .sort({ createdAt: -1 })
            .populate("author", "name username profilePic additionalName")
            .populate({
                path: "comments.author",
                select: "name username profilePic additionalName"
            });

        res.status(200).json(posts);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getPostsByUsername = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const posts = await Post.find({ author: user._id })
            .sort({ createdAt: -1 })
            .populate("author", "name username profilePic additionalName")
            .populate({
                path: "comments.author",
                select: "name username profilePic additionalName"
            });

        res.status(200).json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete this post" });
        }

        await Post.findByIdAndDelete(req.params.id);

        res.status(200).json({ message: "Post deleted successfully" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const likePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const userId = req.user._id;
        const likeIndex = post.likes.indexOf(userId);

        if (likeIndex === -1) {
            post.likes.push(userId);
        } else {
            post.likes.splice(likeIndex, 1);
        }

        await post.save();
        
        res.status(200).json({
            message: "Like status updated successfully",
            likes: post.likes
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const commentPost = async (req, res) => {
    try {
        const { content } = req.body;
        if (!content || !content.trim()) {
            return res.status(400).json({ message: "Comment content is required" });
        }

        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const newComment = {
            author: req.user._id,
            content: content.trim()
        };

        post.comments.push(newComment);
        await post.save();

        // Populate the author of the comments
        const populatedPost = await Post.findById(post._id)
            .populate({
                path: "comments.author",
                select: "name username profilePic additionalName"
            });

        res.status(201).json({
            message: "Comment added successfully",
            comments: populatedPost.comments
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};
