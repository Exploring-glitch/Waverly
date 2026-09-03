import { useState, useEffect, useCallback, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { userApi, postApi, notificationApi } from "../services/api";
import { getSocket } from "../services/socket";
import {
    getSearchHistory,
    saveSearchQuery,
    removeSearchQuery,
    clearSearchHistory,
} from "../utils/searchHistory";
import Button from "./Button";

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchHistory, setSearchHistory] = useState(() => getSearchHistory());
    const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const searchContainerRef = useRef(null);

    const [hasNetworkNotification, setHasNetworkNotification] = useState(false);
    const [hasFeedNotification, setHasFeedNotification] = useState(false);
    const [unreadNotifCount, setUnreadNotifCount] = useState(0);

    const checkNotifications = useCallback(async () => {
        if (!user) return;

        // Check general notifications count (likes, comments, replies, connections)
        if (location.pathname === "/notifications") {
            setUnreadNotifCount(0);
        } else {
            try {
                const countData = await notificationApi.getUnreadCount();
                if (countData && typeof countData.unreadCount === "number") {
                    setUnreadNotifCount(countData.unreadCount);
                }
            } catch (err) {
                console.error("Failed to fetch unread notification count", err);
            }
        }

        try {
            const [receivedReqs, statsData] = await Promise.allSettled([
                userApi.getReceivedConnections(),
                userApi.getConnectionStats()
            ]);

            const reqs = receivedReqs.status === "fulfilled" ? (receivedReqs.value || []) : [];
            const stats = statsData.status === "fulfilled" ? statsData.value : null;

            const userKey = user._id || user.id || "guest";
            const lastSeenConnectionsKey = `waverly_${userKey}_last_seen_connections_count`;
            const storedConnectionCountStr = localStorage.getItem(lastSeenConnectionsKey);

            let hasNewAcceptedConnection = false;
            if (stats && typeof stats.connectionCount === "number") {
                if (storedConnectionCountStr === null) {
                    // First login: initialize baseline connection count so no false-positive dot is shown
                    localStorage.setItem(lastSeenConnectionsKey, String(stats.connectionCount));
                } else {
                    const storedConnectionCount = parseInt(storedConnectionCountStr, 10);
                    if (stats.connectionCount > storedConnectionCount) {
                        hasNewAcceptedConnection = true;
                    }
                }
            }

            const hasPendingInvitations = reqs.length > 0;

            if (location.pathname === "/network") {
                if (stats && typeof stats.connectionCount === "number") {
                    localStorage.setItem(lastSeenConnectionsKey, String(stats.connectionCount));
                }
                setHasNetworkNotification(reqs.length > 0);
            } else {
                setHasNetworkNotification(hasPendingInvitations || hasNewAcceptedConnection);
            }
        } catch (err) {
            console.error("Failed to check network notifications", err);
        }

        try {
            const userKey = user._id || user.id || "guest";
            const feedVisitKey = `waverly_${userKey}_last_feed_visit`;

            if (location.pathname === "/feed") {
                localStorage.setItem(feedVisitKey, new Date().toISOString());
                setHasFeedNotification(false);
            } else {
                const posts = await postApi.getPosts();
                const lastFeedVisitStr = localStorage.getItem(feedVisitKey);

                if (lastFeedVisitStr === null) {
                    // First login: initialize baseline visit timestamp
                    localStorage.setItem(feedVisitKey, new Date().toISOString());
                    setHasFeedNotification(false);
                } else {
                    const lastFeedVisit = new Date(lastFeedVisitStr).getTime();
                    if (Array.isArray(posts) && posts.length > 0) {
                        const otherUsersPosts = posts.filter(
                            p => (p.author?._id || p.author) !== user._id
                        );

                        if (otherUsersPosts.length > 0) {
                            const latestPostTime = Math.max(
                                ...otherUsersPosts.map(p => new Date(p.createdAt || 0).getTime())
                            );

                            if (latestPostTime > lastFeedVisit) {
                                setHasFeedNotification(true);
                            } else {
                                setHasFeedNotification(false);
                            }
                        }
                    }
                }
            }
        } catch (err) {
            console.error("Failed to check feed notifications", err);
        }
    }, [user, location.pathname]);

    useEffect(() => {
        if (!user) {
            setHasNetworkNotification(false);
            setHasFeedNotification(false);
            setUnreadNotifCount(0);
            return;
        }

        checkNotifications();

        // 1. Setup socket connection and realtime listeners
        const socket = getSocket(user._id || user.id);

        const handleRealtimeNotif = (data) => {
            if (location.pathname !== "/notifications") {
                setUnreadNotifCount((prev) => prev + 1);
            }
            // Also notify any open Notifications page view
            window.dispatchEvent(new CustomEvent("socket_new_notification", { detail: data }));
        };

        const handleRealtimeNetwork = (data) => {
            if (location.pathname !== "/network") {
                setHasNetworkNotification(true);
            }
            // Also notify open Network page view
            window.dispatchEvent(new CustomEvent("socket_network_update", { detail: data }));
        };

        const handleRealtimeFeedPost = (data) => {
            const currentUserId = user._id || user.id;
            if (data?.authorId !== currentUserId && location.pathname !== "/feed") {
                setHasFeedNotification(true);
            }
        };

        socket.on("new_notification", handleRealtimeNotif);
        socket.on("network_update", handleRealtimeNetwork);
        socket.on("new_feed_post", handleRealtimeFeedPost);

        const handleFocus = () => checkNotifications();
        const handleNotifsRead = () => setUnreadNotifCount(0);

        window.addEventListener("focus", handleFocus);
        window.addEventListener("notifications_read", handleNotifsRead);
        const intervalId = setInterval(checkNotifications, 20000);

        return () => {
            socket.off("new_notification", handleRealtimeNotif);
            socket.off("network_update", handleRealtimeNetwork);
            socket.off("new_feed_post", handleRealtimeFeedPost);
            window.removeEventListener("focus", handleFocus);
            window.removeEventListener("notifications_read", handleNotifsRead);
            clearInterval(intervalId);
        };
    }, [user, checkNotifications, location.pathname]);

    // Keep search history in sync with localStorage updates
    useEffect(() => {
        const handleHistoryUpdated = (e) => {
            setSearchHistory(e.detail || getSearchHistory());
        };
        window.addEventListener("search_history_updated", handleHistoryUpdated);
        return () => window.removeEventListener("search_history_updated", handleHistoryUpdated);
    }, []);

    // Close search history dropdown on outside click or escape
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
                setShowHistoryDropdown(false);
            }
        };
        const handleKeyDown = (e) => {
            if (e.key === "Escape") {
                setShowHistoryDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    // Automatically clear the search bar when navigating away from the search page
    useEffect(() => {
        if (location.pathname !== "/search") {
            setSearchQuery("");
        } else {
            const params = new URLSearchParams(location.search);
            const q = params.get("q");
            if (q) {
                setSearchQuery(q);
            }
        }
        setShowHistoryDropdown(false);
    }, [location.pathname, location.search]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const trimmed = searchQuery.trim();
        if (!trimmed) return;
        saveSearchQuery(trimmed);
        setShowHistoryDropdown(false);
        navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    };

    const handleSelectHistoryItem = (item) => {
        saveSearchQuery(item);
        setSearchQuery(item);
        setShowHistoryDropdown(false);
        navigate(`/search?q=${encodeURIComponent(item)}`);
    };

    const handleRemoveHistoryItem = (e, item) => {
        e.stopPropagation();
        removeSearchQuery(item);
    };

    const handleClearAllHistory = (e) => {
        e.stopPropagation();
        clearSearchHistory();
    };

    const filteredHistory = searchQuery.trim()
        ? searchHistory.filter((item) =>
              item.toLowerCase().includes(searchQuery.trim().toLowerCase())
          )
        : searchHistory;

    const handleConfirmLogout = () => {
        setShowLogoutModal(false);
        logout();
        navigate("/login");
    };

    return (
        <>
            <header className="navbar-container">
                <div className="navbar-inner">

                    <div className="navbar-left">
                        <Link to="/" className="navbar-brand-group">
                            <div className="navbar-logo-badge">
                                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M2 12c1.5-2 3.5-3 5.5-3s4 2 5.5 3c1.5 1 3.5 2 5.5 2s4-1 5.5-3" />
                                    <path d="M2 7c1.5-2 3.5-3 5.5-3s4 2 5.5 3c1.5 1 3.5 2 5.5 2s4-1 5.5-3" />
                                    <path d="M2 17c1.5-2 3.5-3 5.5-3s4 2 5.5 3c1.5 1 3.5 2 5.5 2s4-1 5.5-3" />
                                </svg>
                            </div>
                            <span className="navbar-brand-text">Waverly</span>
                        </Link>
                    </div>

                    {user && (
                        <div className="navbar-center" ref={searchContainerRef}>
                            <form className="navbar-search-form" onSubmit={handleSearchSubmit}>
                                <div className="navbar-search-wrapper">
                                    <svg className="navbar-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="11" cy="11" r="8" />
                                        <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                    </svg>
                                    <input
                                        type="search"
                                        className="navbar-search-input"
                                        placeholder="Search students, alumni, colleges..."
                                        value={searchQuery}
                                        onChange={(e) => {
                                            setSearchQuery(e.target.value);
                                            setShowHistoryDropdown(true);
                                        }}
                                        onFocus={() => setShowHistoryDropdown(true)}
                                    />
                                    <span className="navbar-search-shortcut">⌘K</span>
                                </div>
                            </form>

                            {showHistoryDropdown && searchHistory.length > 0 && (
                                <div className="navbar-search-dropdown">
                                    <div className="navbar-search-dropdown-header">
                                        <div className="navbar-search-dropdown-title">
                                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="12" cy="12" r="10" />
                                                <polyline points="12 6 12 12 16 14" />
                                            </svg>
                                            <span>Recent Searches</span>
                                        </div>
                                        <button
                                            type="button"
                                            className="navbar-clear-history-btn"
                                            onClick={handleClearAllHistory}
                                        >
                                            Clear all
                                        </button>
                                    </div>
                                    <div className="navbar-search-dropdown-list">
                                        {filteredHistory.length > 0 ? (
                                            filteredHistory.map((item) => (
                                                <div
                                                    key={item}
                                                    className="navbar-search-history-item"
                                                    onClick={() => handleSelectHistoryItem(item)}
                                                >
                                                    <div className="navbar-search-history-item-main">
                                                        <svg className="navbar-history-item-icon" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <circle cx="12" cy="12" r="10" />
                                                            <polyline points="12 6 12 12 16 14" />
                                                        </svg>
                                                        <span className="navbar-history-item-text">{item}</span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        className="navbar-delete-history-btn"
                                                        onClick={(e) => handleRemoveHistoryItem(e, item)}
                                                        title="Remove from history"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="navbar-search-empty-history">
                                                No matching past searches
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <nav className="navbar-actions">
                        {user ? (
                            <>
                                <NavLink
                                    to="/feed"
                                    className={({ isActive }) => `navbar-nav-item ${isActive ? "active" : ""}`}
                                    title="Feed"
                                >
                                    <div className="nav-icon-wrap">
                                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                            <polyline points="9 22 9 12 15 12 15 22" />
                                        </svg>
                                        {hasFeedNotification && (
                                            <span className="nav-notification-dot" title="New post on Feed" />
                                        )}
                                    </div>
                                    <span className="nav-item-label">Feed</span>
                                </NavLink>

                                <NavLink
                                    to="/network"
                                    className={({ isActive }) => `navbar-nav-item ${isActive ? "active" : ""}`}
                                    title="Network"
                                >
                                    <div className="nav-icon-wrap">
                                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                            <circle cx="9" cy="7" r="4" />
                                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                        </svg>
                                        {hasNetworkNotification && (
                                            <span className="nav-notification-dot pulse" title="New invitation or connection update" />
                                        )}
                                    </div>
                                    <span className="nav-item-label">Network</span>
                                </NavLink>

                                <NavLink
                                    to="/notifications"
                                    className={({ isActive }) => `navbar-nav-item ${isActive ? "active" : ""}`}
                                    title="Notifications"
                                >
                                    <div className="nav-icon-wrap">
                                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                                        </svg>
                                        {unreadNotifCount > 0 && (
                                            <span className="nav-notification-badge" title={`${unreadNotifCount} new notifications`}>
                                                {unreadNotifCount > 99 ? "99+" : unreadNotifCount}
                                            </span>
                                        )}
                                    </div>
                                    <span className="nav-item-label">Notifications</span>
                                </NavLink>

                                <NavLink
                                    to="/profile"
                                    className={({ isActive }) => `navbar-user-chip ${isActive ? "active" : ""}`}
                                    title="View Profile"
                                >
                                    <img
                                        src={user.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                                        alt={user.name}
                                        className="navbar-avatar-img"
                                        onError={(e) => {
                                            e.currentTarget.src = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
                                        }}
                                    />
                                    <span className="navbar-user-name">{user.name?.split(" ")[0] || "Profile"}</span>
                                </NavLink>

                                <button
                                    type="button"
                                    className="navbar-logout-btn"
                                    onClick={() => setShowLogoutModal(true)}
                                    title="Sign out"
                                    aria-label="Sign out"
                                >
                                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                        <polyline points="16 17 21 12 16 7" />
                                        <line x1="21" y1="12" x2="9" y2="12" />
                                    </svg>
                                </button>
                            </>
                        ) : (
                            <div className="navbar-auth-actions">
                                <NavLink
                                    to="/login"
                                    className={({ isActive }) => `navbar-link-btn ${isActive ? "active" : ""}`}
                                >
                                    Log in
                                </NavLink>
                                <Link to="/register" className="btn btn-primary btn-sm btn-nav-cta">
                                    Sign up
                                </Link>
                            </div>
                        )}
                    </nav>
                </div>
            </header>

            {showLogoutModal && (
                <div className="modal-overlay" onClick={() => setShowLogoutModal(false)} style={{ zIndex: 3500 }}>
                    <div className="modal-box delete-confirm-modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-icon-badge" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#f87171" }}>
                            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                        </div>
                        <h3>Sign out of Waverly?</h3>
                        <p>You can always log back in at any time to connect with your campus network.</p>
                        <div className="delete-confirm-actions">
                            <Button variant="secondary" onClick={() => setShowLogoutModal(false)}>
                                Cancel
                            </Button>
                            <Button variant="danger" onClick={handleConfirmLogout}>
                                Sign out
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
