import Notification from "../models/Notification.js";

export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50)
            .populate("sender", "name username profilePic additionalName")
            .populate({
                path: "post",
                select: "content image comments",
            });

        const currentUserIdStr = req.user._id.toString();

        const formatted = notifications.map((item) => {
            const notifObj = item.toObject();
            let isReplied = notifObj.replied || false;

            if (!isReplied && notifObj.commentId && notifObj.post && Array.isArray(notifObj.post.comments)) {
                const comment = notifObj.post.comments.find(
                    (c) => c._id?.toString() === notifObj.commentId.toString()
                );
                if (comment && Array.isArray(comment.replies)) {
                    const hasMyReply = comment.replies.some(
                        (r) => (r.author?._id || r.author)?.toString() === currentUserIdStr
                    );
                    if (hasMyReply) {
                        isReplied = true;
                    }
                }
            }

            return {
                ...notifObj,
                replied: isReplied,
            };
        });

        res.status(200).json(formatted);
    } catch (err) {
        console.error("Error fetching notifications:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const markAsReplied = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user._id },
            { replied: true },
            { new: true }
        );
        res.status(200).json({ message: "Marked as replied", notification });
    } catch (err) {
        console.error("Error marking notification as replied:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getUnreadCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            recipient: req.user._id,
            read: false,
        });

        res.status(200).json({ unreadCount: count });
    } catch (err) {
        console.error("Error fetching unread count:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user._id },
            { read: true },
            { new: true }
        ).populate("sender", "name username profilePic additionalName");

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.status(200).json({ message: "Marked as read", notification });
    } catch (err) {
        console.error("Error marking notification as read:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, read: false },
            { read: true }
        );

        res.status(200).json({ message: "All notifications marked as read" });
    } catch (err) {
        console.error("Error marking all notifications as read:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const notification = await Notification.findOneAndDelete({
            _id: req.params.id,
            recipient: req.user._id,
        });

        if (!notification) {
            return res.status(404).json({ message: "Notification not found" });
        }

        res.status(200).json({ message: "Notification deleted successfully" });
    } catch (err) {
        console.error("Error deleting notification:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const clearAllNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({ recipient: req.user._id });
        res.status(200).json({ message: "All notifications cleared" });
    } catch (err) {
        console.error("Error clearing notifications:", err);
        res.status(500).json({ message: "Internal server error" });
    }
};
