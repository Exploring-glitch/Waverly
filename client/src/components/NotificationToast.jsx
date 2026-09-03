import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { notificationApi } from "../services/api";

const getToastMeta = (data) => {
    const type = data?.type || data?.notification?.type;
    const sender = data?.sender || data?.notification?.sender || {};
    const displayName = sender.username ? `@${sender.username}` : (sender.name || "Someone");
    const preview = data?.contentPreview || data?.notification?.contentPreview || "";
    const postId = data?.postId || data?.notification?.post?._id || data?.notification?.post;
    const commentId = data?.commentId || data?.notification?.commentId;

    switch (type) {
        case "like_post":
            return {
                title: displayName,
                subtitle: "liked your post",
                badgeBg: "#f43f5e",
                icon: "❤️",
                link: postId ? `/feed?post=${postId}` : "/feed",
            };
        case "comment_post":
            return {
                title: displayName,
                subtitle: preview ? `commented: "${preview.slice(0, 45)}..."` : "commented on your post",
                badgeBg: "#0284c7",
                icon: "💬",
                link: postId ? `/feed?post=${postId}${commentId ? `&comment=${commentId}&reply=true` : ""}` : "/feed",
            };
        case "reply_comment":
            return {
                title: displayName,
                subtitle: preview ? `replied: "${preview.slice(0, 45)}..."` : "replied to your comment",
                badgeBg: "#6366f1",
                icon: "↩️",
                link: postId ? `/feed?post=${postId}${commentId ? `&comment=${commentId}&reply=true` : ""}` : "/feed",
            };
        case "like_comment":
            return {
                title: displayName,
                subtitle: "liked your comment",
                badgeBg: "#f43f5e",
                icon: "❤️",
                link: postId ? `/feed?post=${postId}${commentId ? `&comment=${commentId}` : ""}` : "/feed",
            };
        case "like_reply":
            return {
                title: displayName,
                subtitle: "liked your reply",
                badgeBg: "#f43f5e",
                icon: "❤️",
                link: postId ? `/feed?post=${postId}${commentId ? `&comment=${commentId}` : ""}` : "/feed",
            };
        case "profile_view":
            return {
                title: displayName,
                subtitle: "viewed your profile",
                badgeBg: "#8b5cf6",
                icon: "👁️",
                link: sender.username ? `/users/${sender.username}` : "/feed",
            };
        case "new_post":
            return {
                title: displayName,
                subtitle: preview ? `shared a post: "${preview.slice(0, 40)}..."` : "shared a new post",
                badgeBg: "#10b981",
                icon: "✍️",
                link: postId ? `/feed?post=${postId}` : "/feed",
            };
        case "mention_post":
            return {
                title: displayName,
                subtitle: preview ? `mentioned you: "${preview.slice(0, 40)}..."` : "mentioned you in a post",
                badgeBg: "#f59e0b",
                icon: "@",
                link: postId ? `/feed?post=${postId}` : "/feed",
            };
        case "mention_comment":
            return {
                title: displayName,
                subtitle: preview ? `mentioned you: "${preview.slice(0, 40)}..."` : "mentioned you in a comment",
                badgeBg: "#f59e0b",
                icon: "@",
                link: postId ? `/feed?post=${postId}${commentId ? `&comment=${commentId}&reply=true` : ""}` : "/feed",
            };
        case "connection_request":
            return {
                title: displayName,
                subtitle: "sent you a connection request",
                badgeBg: "#38bdf8",
                icon: "🤝",
                link: "/network",
            };
        case "connection_accept":
            return {
                title: displayName,
                subtitle: "accepted your connection request",
                badgeBg: "#10b981",
                icon: "✓",
                link: sender.username ? `/users/${sender.username}` : "/network",
            };
        default:
            return {
                title: displayName,
                subtitle: "new activity on your account",
                badgeBg: "#38bdf8",
                icon: "🔔",
                link: "/notifications",
            };
    }
};

const NotificationToast = () => {
    const [toasts, setToasts] = useState([]);
    const navigate = useNavigate();

    const addToast = useCallback((payload) => {
        const id = Date.now() + Math.random();
        const meta = getToastMeta(payload);
        const sender = payload?.sender || payload?.notification?.sender || {};
        const notificationId = payload?.notification?._id || payload?._id;

        const newToast = {
            id,
            notificationId,
            meta,
            sender,
            avatar: sender.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
        };

        setToasts((prev) => [...prev.slice(-3), newToast]); // keep at most 4 toasts

        // Auto remove after 5s
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 5000);
    }, []);

    useEffect(() => {
        const handleNotif = (e) => {
            if (e.detail) addToast(e.detail);
        };
        const handleNetwork = (e) => {
            if (e.detail) addToast(e.detail);
        };

        window.addEventListener("socket_new_notification", handleNotif);
        window.addEventListener("socket_network_update", handleNetwork);

        return () => {
            window.removeEventListener("socket_new_notification", handleNotif);
            window.removeEventListener("socket_network_update", handleNetwork);
        };
    }, [addToast]);

    const handleToastClick = async (toast) => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id));

        // Mark notification as read when clicking the toast
        if (toast.notificationId) {
            try {
                await notificationApi.markAsRead(toast.notificationId);
                window.dispatchEvent(new Event("notifications_read"));
            } catch (err) {
                console.error("Failed to mark notification read from toast", err);
            }
        }

        if (toast.meta.link) {
            navigate(toast.meta.link);
        }
    };

    const handleDismiss = (e, id) => {
        e.stopPropagation();
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    if (toasts.length === 0) return null;

    return (
        <div className="notification-toast-container" aria-live="polite">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className="notification-toast-card"
                    onClick={() => handleToastClick(toast)}
                    role="alert"
                >
                    <div className="toast-avatar-wrapper">
                        <img
                            src={toast.avatar}
                            alt=""
                            className="toast-avatar"
                            onError={(e) => {
                                e.currentTarget.src = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
                            }}
                        />
                        <span
                            className="toast-badge-icon"
                            style={{ backgroundColor: toast.meta.badgeBg }}
                        >
                            {toast.meta.icon}
                        </span>
                    </div>

                    <div className="toast-content-wrapper">
                        <div className="toast-title-line">
                            <span className="toast-sender-name">{toast.meta.title}</span>
                        </div>
                        <p className="toast-subtitle-text">{toast.meta.subtitle}</p>
                    </div>

                    <button
                        type="button"
                        className="toast-close-btn"
                        onClick={(e) => handleDismiss(e, toast.id)}
                        title="Dismiss"
                        aria-label="Dismiss"
                    >
                        ✕
                    </button>
                </div>
            ))}
        </div>
    );
};

export default NotificationToast;
