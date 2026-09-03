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
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    const years = Math.floor(days / 365);
    return `${years}y ago`;
}

const getNotificationMeta = (item) => {
    const senderName = item.sender?.name || item.sender?.username || "Someone";
    switch (item.type) {
        case "like_post":
            return {
                title: `${senderName} liked your post`,
                icon: (
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="#f43f5e" stroke="#f43f5e" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                ),
                badgeBg: "rgba(244, 63, 94, 0.15)",
                badgeBorder: "rgba(244, 63, 94, 0.3)",
                link: item.post ? `/feed?post=${item.post._id || item.post}` : "/feed",
            };
        case "comment_post":
            return {
                title: `${senderName} commented on your post`,
                icon: (
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="#38bdf8" stroke="#38bdf8" strokeWidth="2">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                ),
                badgeBg: "rgba(56, 189, 248, 0.15)",
                badgeBorder: "rgba(56, 189, 248, 0.3)",
                link: item.post
                    ? `/feed?post=${item.post._id || item.post}&comment=${item.commentId || ""}${item.replied ? "&viewReplies=true" : "&reply=true"}`
                    : "/feed",
                canReply: true,
                isReplied: Boolean(item.replied),
            };
        case "reply_comment":
            return {
                title: `${senderName} replied to your comment`,
                icon: (
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="9 14 4 9 9 4" />
                        <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
                    </svg>
                ),
                badgeBg: "rgba(129, 140, 248, 0.15)",
                badgeBorder: "rgba(129, 140, 248, 0.3)",
                link: item.post
                    ? `/feed?post=${item.post._id || item.post}&comment=${item.commentId || ""}${item.replied ? "&viewReplies=true" : "&reply=true"}`
                    : "/feed",
                canReply: true,
                isReplied: Boolean(item.replied),
            };
        case "like_comment":
            return {
                title: `${senderName} liked your comment`,
                icon: (
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="#f43f5e" stroke="#f43f5e" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                ),
                badgeBg: "rgba(244, 63, 94, 0.15)",
                badgeBorder: "rgba(244, 63, 94, 0.3)",
                link: item.post ? `/feed?post=${item.post._id || item.post}` : "/feed",
            };
        case "like_reply":
            return {
                title: `${senderName} liked your reply`,
                icon: (
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="#f43f5e" stroke="#f43f5e" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                ),
                badgeBg: "rgba(244, 63, 94, 0.15)",
                badgeBorder: "rgba(244, 63, 94, 0.3)",
                link: item.post ? `/feed?post=${item.post._id || item.post}` : "/feed",
            };
        case "connection_request":
            return {
                title: `${senderName} sent you a connection request`,
                icon: (
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="8.5" cy="7" r="4" />
                        <line x1="20" y1="8" x2="20" y2="14" />
                        <line x1="23" y1="11" x2="17" y2="11" />
                    </svg>
                ),
                badgeBg: "rgba(168, 85, 247, 0.15)",
                badgeBorder: "rgba(168, 85, 247, 0.3)",
                link: "/network",
            };
        case "connection_accept":
            return {
                title: `${senderName} accepted your connection request`,
                icon: (
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="8.5" cy="7" r="4" />
                        <polyline points="17 11 19 13 23 9" />
                    </svg>
                ),
                badgeBg: "rgba(16, 185, 129, 0.15)",
                badgeBorder: "rgba(16, 185, 129, 0.3)",
                link: item.sender?.username ? `/users/${item.sender.username}` : "/network",
            };
        default:
            return {
                title: `${senderName} interacted with your account`,
                icon: (
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                    </svg>
                ),
                badgeBg: "rgba(56, 189, 248, 0.15)",
                badgeBorder: "rgba(56, 189, 248, 0.3)",
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

            // Automatically mark all notifications as read upon opening
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
        if (activeTab === "comments") return n.type === "comment_post" || n.type === "reply_comment";
        if (activeTab === "network") return n.type?.startsWith("connection_");
        return true;
    });

    if (!user || isLoading) {
        return (
            <div className="page-center">
                <div className="spinner" />
            </div>
        );
    }

    return (
        <div className="page notifications-page-container">
            <div className="notifications-page-inner">

                {/* Header banner */}
                <div className="notifications-header">
                    <div className="notifications-header-left">
                        <div className="notifications-header-title-group">
                            <h1 className="notifications-page-title">Notifications</h1>
                        </div>
                        <p className="notifications-page-subtitle">
                            Stay up to date with interactions on your posts and campus network.
                        </p>
                    </div>

                    <div className="notifications-header-actions">
                        {notifications.length > 0 && (
                            <button
                                type="button"
                                className="notifications-clear-btn"
                                onClick={handleClearAll}
                                title="Clear all notifications"
                            >
                                Clear all
                            </button>
                        )}
                    </div>
                </div>

                {/* Filter tabs */}
                <div className="notifications-tabs-bar">
                    <button
                        type="button"
                        className={`notifications-tab-btn ${activeTab === "all" ? "active" : ""}`}
                        onClick={() => setActiveTab("all")}
                    >
                        All
                        <span className="tab-count">{notifications.length}</span>
                    </button>
                    <button
                        type="button"
                        className={`notifications-tab-btn ${activeTab === "likes" ? "active" : ""}`}
                        onClick={() => setActiveTab("likes")}
                    >
                        Likes
                    </button>
                    <button
                        type="button"
                        className={`notifications-tab-btn ${activeTab === "comments" ? "active" : ""}`}
                        onClick={() => setActiveTab("comments")}
                    >
                        Comments & Replies
                    </button>
                    <button
                        type="button"
                        className={`notifications-tab-btn ${activeTab === "network" ? "active" : ""}`}
                        onClick={() => setActiveTab("network")}
                    >
                        Network
                    </button>
                </div>

                {/* Notification Items List */}
                {filteredNotifications.length > 0 ? (
                    <div className="notifications-list">
                        {filteredNotifications.map((item) => {
                            const meta = getNotificationMeta(item);
                            const sender = item.sender || {};
                            return (
                                <div
                                    key={item._id}
                                    className="notification-card-item"
                                    onClick={() => handleNotificationClick(item)}
                                    role="button"
                                    tabIndex={0}
                                >
                                    {/* Avatar with icon badge */}
                                    <div className="notif-avatar-wrapper">
                                        <Link
                                            to={`/users/${sender.username || ""}`}
                                            onClick={(e) => e.stopPropagation()}
                                            className="notif-avatar-link"
                                        >
                                            <img
                                                src={sender.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                                                alt={sender.name || "User"}
                                                className="notif-avatar-img"
                                                onError={(e) => {
                                                    e.currentTarget.src = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
                                                }}
                                            />
                                        </Link>
                                        <div
                                            className="notif-badge-indicator"
                                            style={{
                                                backgroundColor: meta.badgeBg,
                                                borderColor: meta.badgeBorder,
                                            }}
                                        >
                                            {meta.icon}
                                        </div>
                                    </div>

                                    {/* Content info */}
                                    <div className="notif-content-wrapper">
                                        <div className="notif-main-text">
                                            <Link
                                                to={`/users/${sender.username || ""}`}
                                                className="notif-user-highlight"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {sender.name || sender.username || "User"}
                                            </Link>{" "}
                                            <span className="notif-action-desc">
                                                {item.type === "like_post" && "liked your post"}
                                                {item.type === "comment_post" && "commented on your post"}
                                                {item.type === "reply_comment" && "replied to your comment"}
                                                {item.type === "like_comment" && "liked your comment"}
                                                {item.type === "like_reply" && "liked your reply"}
                                                {item.type === "connection_request" && "sent you a connection request"}
                                                {item.type === "connection_accept" && "accepted your connection request"}
                                            </span>
                                        </div>

                                        {item.contentPreview && (
                                            <div className="notif-preview-box">
                                                &ldquo;{item.contentPreview}&rdquo;
                                            </div>
                                        )}

                                        <div className="notif-timestamp-row">
                                            <span className="notif-time-ago">{timeAgo(item.createdAt)}</span>
                                        </div>
                                    </div>

                                    {/* Action buttons */}
                                    <div className="notif-card-actions-group">
                                        {meta.canReply && (
                                            <button
                                                type="button"
                                                className={`notif-reply-pill-btn ${meta.isReplied ? "view-reply" : ""}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (meta.link) navigate(meta.link);
                                                }}
                                                title={meta.isReplied ? "View your reply" : "Reply to comment"}
                                            >
                                                {meta.isReplied ? (
                                                    <>
                                                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                                            <circle cx="12" cy="12" r="3" />
                                                        </svg>
                                                        <span>View reply</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="9 14 4 9 9 4" />
                                                            <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
                                                        </svg>
                                                        <span>Reply</span>
                                                    </>
                                                )}
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            className="notif-delete-btn"
                                            onClick={(e) => handleDeleteNotification(e, item._id)}
                                            title="Delete notification"
                                        >
                                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <line x1="18" y1="6" x2="6" y2="18" />
                                                <line x1="6" y1="6" x2="18" y2="18" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="notifications-empty-state">
                        <div className="empty-bell-icon-wrapper">
                            <svg viewBox="0 0 24 24" width="42" height="42" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                        </div>
                        <h3>No notifications in this view</h3>
                        <p>
                            {activeTab === "all"
                                ? "When someone likes or comments on your posts, or sends a connection request, you'll find them here."
                                : `You don't have any ${activeTab} notifications right now.`}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Notifications_Page;
