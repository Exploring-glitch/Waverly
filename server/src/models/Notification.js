import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            required: true,
            enum: [
                "like_post",
                "comment_post",
                "reply_comment",
                "like_comment",
                "like_reply",
                "connection_request",
                "connection_accept"
            ],
        },
        post: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Post",
            default: null,
        },
        commentId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },
        replyId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },
        contentPreview: {
            type: String,
            default: "",
        },
        read: {
            type: Boolean,
            default: false,
            index: true,
        },
        replied: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

notificationSchema.index({ recipient: 1, createdAt: -1 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;
