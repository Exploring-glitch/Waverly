import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { notificationApi } from "../services/api";

function timeAgo(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}w`;
    const years = Math.floor(days / 365);
    return `${years}y`;
}

function getNotificationSection(dateString) {
    if (!dateString) return "Earlier";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours < 24 && now.getDate() === date.getDate()) {
        return "Today";
    }
    if (diffDays <= 2) {
        return "Yesterday";
    }
    if (diffDays <= 7) {
        return "This week";
    }
    if (diffDays <= 30) {
        return "This month";
    }
    return "Earlier";
}

const SECTION_ORDER = ["Today", "Yesterday", "This week", "This month", "Earlier"];

const getNotificationMeta = (item) => {
    const senderName = item.sender?.name || item.sender?.username || "Someone";
    switch (item.type) {
        case "like_post":
            return {
                title: `${senderName} liked your post`,
                actionText: "liked your post.",
                icon: (
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="#ffffff">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                ),
                badgeBg: "#f43f5e",
                link: item.post ? `/feed?post=${item.post._id || item.post}` : "/feed",
            };
        case "comment_post":
            return {
                title: `${senderName} commented on your post`,
                actionText: "commented on your post.",
                icon: (
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="#ffffff">
                        <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z" />
                    </svg>
                ),
                badgeBg: "#0284c7",
                link: item.post
                    ? `/feed?post=${item.post._id || item.post}&comment=${item.commentId || ""}${item.replied ? "&viewReplies=true" : "&reply=true"}`
                    : "/feed",
                canReply: true,
                isReplied: Boolean(item.replied),
            };
        case "reply_comment":
            return {
                title: `${senderName} replied to your comment`,
                actionText: "replied to your comment.",
                icon: (
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 14 4 9 9 4" />
                        <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
                    </svg>
                ),
                badgeBg: "#6366f1",
                link: item.post
                    ? `/feed?post=${item.post._id || item.post}&comment=${item.commentId || ""}${item.replied ? "&viewReplies=true" : "&reply=true"}`
                    : "/feed",
                canReply: true,
                isReplied: Boolean(item.replied),
            };
        case "like_comment":
            return {
                title: `${senderName} liked your comment`,
                actionText: "liked your comment.",
                icon: (
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="#ffffff">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                ),
                badgeBg: "#f43f5e",
                link: item.post ? `/feed?post=${item.post._id || item.post}` : "/feed",
            };
        case "like_reply":
            return {
                title: `${senderName} liked your reply`,
                actionText: "liked your reply.",
                icon: (
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="#ffffff">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                ),
                badgeBg: "#f43f5e",
                link: item.post ? `/feed?post=${item.post._id || item.post}` : "/feed",
            };
        case "profile_view":
            return {
                title: `${senderName} viewed your profile`,
                actionText: "viewed your profile.",
                icon: (
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                    </svg>
                ),
                badgeBg: "#8b5cf6",
                link: item.sender?.username ? `/users/${item.sender.username}` : "/feed",
                isProfileView: true,
            };
        case "new_post":
            return {
                title: `${senderName} shared a new post`,
                actionText: "shared a new post.",
                icon: (
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                    </svg>
                ),
                badgeBg: "#10b981",
                link: item.post ? `/feed?post=${item.post._id || item.post}` : "/feed",
            };
        case "mention_post":
            return {
                title: `${senderName} mentioned you in a post`,
                actionText: "mentioned you in a post.",
                icon: (
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="4" />
                        <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
                    </svg>
                ),
                badgeBg: "#f59e0b",
                link: item.post ? `/feed?post=${item.post._id || item.post}` : "/feed",
            };
        case "mention_comment":
            return {
                title: `${senderName} mentioned you in a comment`,
                actionText: "mentioned you in a comment.",
                icon: (
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="4" />
                        <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
                    </svg>
                ),
                badgeBg: "#f59e0b",
                link: item.post
                    ? `/feed?post=${item.post._id || item.post}&comment=${item.commentId || ""}${item.replied ? "&viewReplies=true" : "&reply=true"}`
                    : "/feed",
                canReply: true,
                isReplied: Boolean(item.replied),
            };
        default:
            return {
                title: `${senderName} interacted with your account`,
                actionText: "interacted with your account.",
                icon: (
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                ),
                badgeBg: "#38bdf8",
                link: "/feed",
            };
    }
};

const Notifications_Page = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("all");

    const fetchNotifications = useCallback(async () => {
        if (!user) return;
        try {
            const data = await notificationApi.getNotifications();
            setNotifications(data || []);

            try {
                await notificationApi.markAllAsRead();
                window.dispatchEvent(new Event("notifications_read"));
            } catch (readErr) {
                console.error("Failed to auto-mark notifications as read:", readErr);
            }
        } catch (err) {
            console.error("Failed to load notifications:", err);
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const handleClearAll = async () => {
        if (!window.confirm("Are you sure you want to clear all notifications?")) return;
        try {
            await notificationApi.clearAll();
            setNotifications([]);
        } catch (err) {
            console.error("Failed to clear notifications:", err);
        }
    };

    const handleNotificationClick = (item) => {
        setNotifications((prev) =>
            prev.map((n) => (n._id === item._id ? { ...n, read: true } : n))
        );
        const meta = getNotificationMeta(item);
        if (meta.link) {
            navigate(meta.link);
        }
    };

    const handleDeleteNotification = async (e, id) => {
        e.stopPropagation();
        try {
            await notificationApi.deleteNotification(id);
            setNotifications((prev) => prev.filter((n) => n._id !== id));
        } catch (err) {
            console.error("Failed to delete notification:", err);
        }
    };

    const filteredNotifications = notifications.filter((n) => {
        if (activeTab === "likes") return n.type?.startsWith("like_");
        if (activeTab === "comments") return n.type === "comment_post" || n.type === "reply_comment" || n.type?.startsWith("mention_");
        if (activeTab === "activities") return n.type === "profile_view" || n.type === "new_post";
        return true;
    });

    const groupedNotifications = filteredNotifications.reduce((acc, item) => {
        const section = getNotificationSection(item.createdAt);
        if (!acc[section]) acc[section] = [];
        acc[section].push(item);
        return acc;
    }, {});

    if (!user || isLoading) {
        return (
            <div className="page-center">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="page ig-notif-page">
            <div className="ig-notif-container">

                <div className="ig-notif-header">
                    <div className="ig-notif-header-title-row">
                        <h1 className="ig-notif-title">Notifications</h1>
                        {notifications.length > 0 && (
                            <button
                                type="button"
                                className="ig-notif-clear-btn"
                                onClick={handleClearAll}
                                title="Clear all"
                            >
                                Clear all
                            </button>
                        )}
                    </div>

                    <div className="ig-notif-filters">
                        <button
                            type="button"
                            className={`ig-filter-pill ${activeTab === "all" ? "active" : ""}`}
                            onClick={() => setActiveTab("all")}
                        >
                            All
                            <span className="ig-pill-badge">{notifications.length}</span>
                        </button>
                        <button
                            type="button"
                            className={`ig-filter-pill ${activeTab === "likes" ? "active" : ""}`}
                            onClick={() => setActiveTab("likes")}
                        >
                            Likes
                        </button>
                        <button
                            type="button"
                            className={`ig-filter-pill ${activeTab === "comments" ? "active" : ""}`}
                            onClick={() => setActiveTab("comments")}
                        >
                            Comments & Mentions
                        </button>
                        <button
                            type="button"
                            className={`ig-filter-pill ${activeTab === "activities" ? "active" : ""}`}
                            onClick={() => setActiveTab("activities")}
                        >
                            Views & Posts
                        </button>
                    </div>
                </div>

                {filteredNotifications.length > 0 ? (
                    <div className="ig-notif-list-container">
                        {SECTION_ORDER.map((sectionKey) => {
                            const items = groupedNotifications[sectionKey];
                            if (!items || items.length === 0) return null;

                            return (
                                <div key={sectionKey} className="ig-notif-section">
                                    <h3 className="ig-section-title">{sectionKey}</h3>

                                    <div className="ig-section-items">
                                        {items.map((item) => {
                                            const meta = getNotificationMeta(item);
                                            const sender = item.sender || {};
                                            const postImg = item.post?.image;

                                            return (
                                                <div
                                                    key={item._id}
                                                    className={`ig-notif-row ${!item.read ? "unread" : ""}`}
                                                    onClick={() => handleNotificationClick(item)}
                                                    role="button"
                                                    tabIndex={0}
                                                >
                                                    <div className="ig-avatar-wrap">
                                                        <Link
                                                            to={`/users/${sender.username || ""}`}
                                                            onClick={(e) => e.stopPropagation()}
                                                            className="ig-avatar-link"
                                                        >
                                                            <img
                                                                src={sender.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                                                                alt={sender.name || "User"}
                                                                className="ig-avatar-img"
                                                                onError={(e) => {
                                                                    e.currentTarget.src = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
                                                                }}
                                                            />
                                                        </Link>
                                                        <div
                                                            className="ig-reaction-badge"
                                                            style={{ backgroundColor: meta.badgeBg }}
                                                        >
                                                            {meta.icon}
                                                        </div>
                                                    </div>

                                                    <div className="ig-content-wrap">
                                                        <p className="ig-text-body">
                                                            <Link
                                                                to={`/users/${sender.username || ""}`}
                                                                className="ig-username"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                {sender.username || sender.name || "user"}
                                                            </Link>{" "}
                                                            <span className="ig-action-text">{meta.actionText}</span>{" "}
                                                            {item.contentPreview && (
                                                                <span className="ig-quote-snippet">
                                                                    &ldquo;{item.contentPreview}&rdquo;
                                                                </span>
                                                            )}{" "}
                                                            <span className="ig-time">{timeAgo(item.createdAt)}</span>
                                                        </p>
                                                    </div>

                                                    <div className="ig-action-wrap">
                                                        {!item.read && (
                                                            <span className="ig-unread-dot" title="New activity" />
                                                        )}
                                                        {meta.canReply ? (
                                                            <button
                                                                type="button"
                                                                className={`ig-btn-reply ${meta.isReplied ? "replied" : ""}`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    if (meta.link) navigate(meta.link);
                                                                }}
                                                                title={meta.isReplied ? "View reply" : "Reply"}
                                                            >
                                                                {meta.isReplied ? "Replied" : "Reply"}
                                                            </button>
                                                        ) : meta.isProfileView ? (
                                                            <Link
                                                                to={`/users/${sender.username || ""}`}
                                                                onClick={(e) => e.stopPropagation()}
                                                                className="ig-btn-view"
                                                            >
                                                                Profile
                                                            </Link>
                                                        ) : null}

                                                        <button
                                                            type="button"
                                                            className="ig-delete-btn"
                                                            onClick={(e) => handleDeleteNotification(e, item._id)}
                                                            title="Delete"
                                                        >
                                                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                                <line x1="6" y1="6" x2="18" y2="18" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="ig-empty-state">
                        <div className="ig-empty-icon-circle">
                            <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                            </svg>
                        </div>
                        <h3>Activity on your posts</h3>
                        <p>
                            {activeTab === "all"
                                ? "When someone likes, comments, mentions you, or views your profile, you'll see them here."
                                : `No ${activeTab} activity right now.`}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications_Page;
