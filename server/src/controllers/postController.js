import Post from "../models/Post.js";
import User from "../models/User.js";
import Connection from "../models/Connection.js";
import Notification from "../models/Notification.js";
import { emitToUser, emitToUsers, emitBroadcast } from "../socket.js";

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

        // Broadcast new post so active users on other pages get the feed dot in realtime
        emitBroadcast("new_feed_post", { postId: newPost._id, authorId: req.user._id });

        // 1. Notify all accepted connections that user created a new post
        try {
            const connections = await Connection.find({
                status: "accepted",
                $or: [
                    { sender: req.user._id },
                    { recipient: req.user._id }
                ]
            });

            const connectedUserIds = [];
            for (const conn of connections) {
                const connectedUserId = conn.sender.toString() === req.user._id.toString() ? conn.recipient : conn.sender;
                connectedUserIds.push(connectedUserId);
                await Notification.create({
                    recipient: connectedUserId,
                    sender: req.user._id,
                    type: "new_post",
                    post: newPost._id,
                    contentPreview: content ? content.trim().slice(0, 100) : "shared a new post",
                });
            }
            if (connectedUserIds.length > 0) {
                emitToUsers(connectedUserIds, "new_notification", {
                    type: "new_post",
                    postId: newPost._id,
                    sender: {
                        _id: req.user._id,
                        name: req.user.name,
                        username: req.user.username,
                        profilePic: req.user.profilePic,
                    },
                    contentPreview: content ? content.trim().slice(0, 100) : "shared a new post",
                });
            }
        } catch (connNotifErr) {
            console.error("Failed to notify connections about new post:", connNotifErr);
        }

        // 2. Notify users mentioned via @username in the post
        try {
            const mentions = (content || "").match(/@([a-zA-Z0-9_]+)/g);
            if (mentions) {
                const uniqueUsernames = [...new Set(mentions.map(m => m.slice(1).toLowerCase()))];
                for (const uname of uniqueUsernames) {
                    const mentionedUser = await User.findOne({ username: { $regex: new RegExp(`^${uname}$`, "i") } });
                    if (mentionedUser && mentionedUser._id.toString() !== req.user._id.toString()) {
                        const notif = await Notification.create({
                            recipient: mentionedUser._id,
                            sender: req.user._id,
                            type: "mention_post",
                            post: newPost._id,
                            contentPreview: content.trim().slice(0, 100),
                        });
                        emitToUser(mentionedUser._id, "new_notification", {
                            notification: notif,
                            type: "mention_post",
                            sender: {
                                _id: req.user._id,
                                name: req.user.name,
                                username: req.user.username,
                                profilePic: req.user.profilePic,
                            },
                            postId: newPost._id,
                        });
                    }
                }
            }
        } catch (mentionErr) {
            console.error("Failed to notify mentions in post:", mentionErr);
        }

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
            })
            .populate({
                path: "comments.replies.author",
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
            })
            .populate({
                path: "comments.replies.author",
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
            })
            .populate({
                path: "comments.replies.author",
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
            if (post.author.toString() !== userId.toString()) {
                try {
                    const notif = await Notification.create({
                        recipient: post.author,
                        sender: userId,
                        type: "like_post",
                        post: post._id,
                        contentPreview: post.content ? post.content.substring(0, 80) : "",
                    });
                    emitToUser(post.author, "new_notification", {
                        notification: notif,
                        type: "like_post",
                        sender: {
                            _id: req.user._id,
                            name: req.user.name,
                            username: req.user.username,
                            profilePic: req.user.profilePic,
                        },
                        postId: post._id,
                    });
                } catch (notifErr) {
                    console.error("Failed to create like notification:", notifErr);
                }
            }
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

        if (post.author.toString() !== req.user._id.toString()) {
            try {
                const addedComment = post.comments[post.comments.length - 1];
                const notif = await Notification.create({
                    recipient: post.author,
                    sender: req.user._id,
                    type: "comment_post",
                    post: post._id,
                    commentId: addedComment?._id,
                    contentPreview: content.trim().substring(0, 80),
                });
                emitToUser(post.author, "new_notification", {
                    notification: notif,
                    type: "comment_post",
                    sender: {
                        _id: req.user._id,
                        name: req.user.name,
                        username: req.user.username,
                        profilePic: req.user.profilePic,
                    },
                    postId: post._id,
                    commentId: addedComment?._id,
                });
            } catch (notifErr) {
                console.error("Failed to create comment notification:", notifErr);
            }
        }

        // Notify users mentioned via @username in the comment
        try {
            const mentions = (content || "").match(/@([a-zA-Z0-9_]+)/g);
            if (mentions) {
                const addedComment = post.comments[post.comments.length - 1];
                const uniqueUsernames = [...new Set(mentions.map(m => m.slice(1).toLowerCase()))];
                for (const uname of uniqueUsernames) {
                    const mentionedUser = await User.findOne({ username: { $regex: new RegExp(`^${uname}$`, "i") } });
                    if (
                        mentionedUser &&
                        mentionedUser._id.toString() !== req.user._id.toString() &&
                        mentionedUser._id.toString() !== post.author.toString()
                    ) {
                        const notif = await Notification.create({
                            recipient: mentionedUser._id,
                            sender: req.user._id,
                            type: "mention_comment",
                            post: post._id,
                            commentId: addedComment?._id,
                            contentPreview: content.trim().slice(0, 100),
                        });
                        emitToUser(mentionedUser._id, "new_notification", {
                            notification: notif,
                            type: "mention_comment",
                            sender: {
                                _id: req.user._id,
                                name: req.user.name,
                                username: req.user.username,
                                profilePic: req.user.profilePic,
                            },
                            postId: post._id,
                            commentId: addedComment?._id,
                        });
                    }
                }
            }
        } catch (mentionErr) {
            console.error("Failed to notify mentions in comment:", mentionErr);
        }

        const populatedPost = await Post.findById(post._id)
            .populate({
                path: "comments.author",
                select: "name username profilePic additionalName"
            })
            .populate({
                path: "comments.replies.author",
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

export const replyComment = async (req, res) => {
    try {
        const { content } = req.body;
        if (!content || !content.trim()) {
            return res.status(400).json({ message: "Reply content is required" });
        }

        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const comment = post.comments.id(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        if (!comment.replies) {
            comment.replies = [];
        }

        const newReply = {
            author: req.user._id,
            content: content.trim()
        };

        comment.replies.push(newReply);
        await post.save();

        if (comment.author.toString() !== req.user._id.toString()) {
            try {
                const addedReply = comment.replies[comment.replies.length - 1];
                const notif = await Notification.create({
                    recipient: comment.author,
                    sender: req.user._id,
                    type: "reply_comment",
                    post: post._id,
                    commentId: comment._id,
                    replyId: addedReply?._id,
                    contentPreview: content.trim().substring(0, 80),
                });
                emitToUser(comment.author, "new_notification", {
                    notification: notif,
                    type: "reply_comment",
                    sender: {
                        _id: req.user._id,
                        name: req.user.name,
                        username: req.user.username,
                        profilePic: req.user.profilePic,
                    },
                    postId: post._id,
                    commentId: comment._id,
                    replyId: addedReply?._id,
                });
            } catch (notifErr) {
                console.error("Failed to create reply notification:", notifErr);
            }
        }

        // Also notify the post author if they are not the replier and not the comment author
        if (
            post.author.toString() !== req.user._id.toString() &&
            post.author.toString() !== comment.author.toString()
        ) {
            try {
                const addedReply = comment.replies[comment.replies.length - 1];
                const postAuthorNotif = await Notification.create({
                    recipient: post.author,
                    sender: req.user._id,
                    type: "comment_post",
                    post: post._id,
                    commentId: comment._id,
                    replyId: addedReply?._id,
                    contentPreview: content.trim().substring(0, 80),
                });
                emitToUser(post.author, "new_notification", {
                    notification: postAuthorNotif,
                    type: "comment_post",
                    sender: {
                        _id: req.user._id,
                        name: req.user.name,
                        username: req.user.username,
                        profilePic: req.user.profilePic,
                    },
                    postId: post._id,
                    commentId: comment._id,
                    replyId: addedReply?._id,
                });
            } catch (postAuthorNotifErr) {
                console.error("Failed to notify post author on reply:", postAuthorNotifErr);
            }
        }

        // Notify users mentioned via @username in the reply
        try {
            const mentions = (content || "").match(/@([a-zA-Z0-9_]+)/g);
            if (mentions) {
                const addedReply = comment.replies[comment.replies.length - 1];
                const uniqueUsernames = [...new Set(mentions.map(m => m.slice(1).toLowerCase()))];
                for (const uname of uniqueUsernames) {
                    const mentionedUser = await User.findOne({ username: { $regex: new RegExp(`^${uname}$`, "i") } });
                    if (
                        mentionedUser &&
                        mentionedUser._id.toString() !== req.user._id.toString() &&
                        mentionedUser._id.toString() !== comment.author.toString()
                    ) {
                        const notif = await Notification.create({
                            recipient: mentionedUser._id,
                            sender: req.user._id,
                            type: "mention_comment",
                            post: post._id,
                            commentId: comment._id,
                            replyId: addedReply?._id,
                            contentPreview: content.trim().slice(0, 100),
                        });
                        emitToUser(mentionedUser._id, "new_notification", {
                            notification: notif,
                            type: "mention_comment",
                            sender: {
                                _id: req.user._id,
                                name: req.user.name,
                                username: req.user.username,
                                profilePic: req.user.profilePic,
                            },
                            postId: post._id,
                            commentId: comment._id,
                            replyId: addedReply?._id,
                        });
                    }
                }
            }
        } catch (mentionErr) {
            console.error("Failed to notify mentions in reply:", mentionErr);
        }

        // Mark any notification for the current user regarding this comment/post as replied
        try {
            await Notification.updateMany(
                {
                    recipient: req.user._id,
                    post: post._id,
                    commentId: comment._id,
                    type: { $in: ["comment_post", "reply_comment"] },
                },
                { $set: { replied: true } }
            );
        } catch (updateErr) {
            console.error("Failed to mark notifications as replied:", updateErr);
        }

        const populatedPost = await Post.findById(post._id)
            .populate({
                path: "comments.author",
                select: "name username profilePic additionalName"
            })
            .populate({
                path: "comments.replies.author",
                select: "name username profilePic additionalName"
            });

        res.status(201).json({
            message: "Reply added successfully",
            comments: populatedPost.comments
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const likeComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const comment = post.comments.id(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        if (!comment.likes) {
            comment.likes = [];
        }

        const userId = req.user._id;
        const likeIndex = comment.likes.indexOf(userId);

        if (likeIndex === -1) {
            comment.likes.push(userId);
            if (comment.author.toString() !== userId.toString()) {
                try {
                    const notif = await Notification.create({
                        recipient: comment.author,
                        sender: userId,
                        type: "like_comment",
                        post: post._id,
                        commentId: comment._id,
                        contentPreview: comment.content ? comment.content.substring(0, 80) : "",
                    });
                    emitToUser(comment.author, "new_notification", {
                        notification: notif,
                        type: "like_comment",
                        sender: {
                            _id: req.user._id,
                            name: req.user.name,
                            username: req.user.username,
                            profilePic: req.user.profilePic,
                        },
                        postId: post._id,
                        commentId: comment._id,
                    });
                } catch (notifErr) {
                    console.error("Failed to create comment like notification:", notifErr);
                }
            }
        } else {
            comment.likes.splice(likeIndex, 1);
        }

        await post.save();

        const populatedPost = await Post.findById(post._id)
            .populate({
                path: "comments.author",
                select: "name username profilePic additionalName"
            })
            .populate({
                path: "comments.replies.author",
                select: "name username profilePic additionalName"
            });

        res.status(200).json({
            message: "Comment like status updated successfully",
            comments: populatedPost.comments
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const editComment = async (req, res) => {
    try {
        const { content } = req.body;
        if (!content || !content.trim()) {
            return res.status(400).json({ message: "Comment content is required" });
        }

        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const comment = post.comments.id(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        if (comment.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to edit this comment" });
        }

        comment.content = content.trim();
        await post.save();

        const populatedPost = await Post.findById(post._id)
            .populate({
                path: "comments.author",
                select: "name username profilePic additionalName"
            })
            .populate({
                path: "comments.replies.author",
                select: "name username profilePic additionalName"
            });

        res.status(200).json({
            message: "Comment updated successfully",
            comments: populatedPost.comments
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const comment = post.comments.id(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        if (comment.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete this comment" });
        }

        post.comments.pull(req.params.commentId);
        await post.save();

        const populatedPost = await Post.findById(post._id)
            .populate({
                path: "comments.author",
                select: "name username profilePic additionalName"
            })
            .populate({
                path: "comments.replies.author",
                select: "name username profilePic additionalName"
            });

        res.status(200).json({
            message: "Comment deleted successfully",
            comments: populatedPost.comments
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const likeReply = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const comment = post.comments.id(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const reply = comment.replies.id(req.params.replyId);
        if (!reply) {
            return res.status(404).json({ message: "Reply not found" });
        }

        if (!reply.likes) {
            reply.likes = [];
        }


        const userId = req.user._id;
        const likeIndex = reply.likes.indexOf(userId);

        if (likeIndex === -1) {
            reply.likes.push(userId);
            if (reply.author.toString() !== userId.toString()) {
                try {
                    const notif = await Notification.create({
                        recipient: reply.author,
                        sender: userId,
                        type: "like_reply",
                        post: post._id,
                        commentId: comment._id,
                        replyId: reply._id,
                        contentPreview: reply.content ? reply.content.substring(0, 80) : "",
                    });
                    emitToUser(reply.author, "new_notification", {
                        notification: notif,
                        type: "like_reply",
                        sender: {
                            _id: req.user._id,
                            name: req.user.name,
                            username: req.user.username,
                            profilePic: req.user.profilePic,
                        },
                        postId: post._id,
                        commentId: comment._id,
                        replyId: reply._id,
                    });
                } catch (notifErr) {
                    console.error("Failed to create reply like notification:", notifErr);
                }
            }
        } else {
            reply.likes.splice(likeIndex, 1);
        }

        await post.save();

        const populatedPost = await Post.findById(post._id)
            .populate({
                path: "comments.author",
                select: "name username profilePic additionalName"
            })
            .populate({
                path: "comments.replies.author",
                select: "name username profilePic additionalName"
            });

        res.status(200).json({
            message: "Reply like status updated successfully",
            comments: populatedPost.comments
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const editReply = async (req, res) => {
    try {
        const { content } = req.body;
        if (!content || !content.trim()) {
            return res.status(400).json({ message: "Reply content is required" });
        }

        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const comment = post.comments.id(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const reply = comment.replies.id(req.params.replyId);
        if (!reply) {
            return res.status(404).json({ message: "Reply not found" });
        }

        if (reply.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to edit this reply" });
        }

        reply.content = content.trim();
        await post.save();

        const populatedPost = await Post.findById(post._id)
            .populate({
                path: "comments.author",
                select: "name username profilePic additionalName"
            })
            .populate({
                path: "comments.replies.author",
                select: "name username profilePic additionalName"
            });

        res.status(200).json({
            message: "Reply updated successfully",
            comments: populatedPost.comments
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteReply = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        const comment = post.comments.id(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }

        const reply = comment.replies.id(req.params.replyId);
        if (!reply) {
            return res.status(404).json({ message: "Reply not found" });
        }

        if (reply.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to delete this reply" });
        }

        comment.replies.pull(req.params.replyId);
        await post.save();

        const populatedPost = await Post.findById(post._id)
            .populate({
                path: "comments.author",
                select: "name username profilePic additionalName"
            })
            .populate({
                path: "comments.replies.author",
                select: "name username profilePic additionalName"
            });

        res.status(200).json({
            message: "Reply deleted successfully",
            comments: populatedPost.comments
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updatePost = async (req, res) => {
    try {
        const { content, image } = req.body;
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to update this post" });
        }

        if (content !== undefined) {
            if (!content || !content.trim()) {
                return res.status(400).json({ message: "Content is required to update a post" });
            }
            post.content = content.trim();
        }

        if (image !== undefined) {
            post.image = image.trim();
        }

        const updatedPost = await post.save();
        const populatedPost = await updatedPost.populate("author", "name username profilePic additionalName");

        res.status(200).json({
            message: "Post updated successfully",
            post: populatedPost
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};
