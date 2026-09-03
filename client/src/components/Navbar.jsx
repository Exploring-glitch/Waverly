import { useState, useEffect, useCallback, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { userApi, postApi, notificationApi } from "../services/api";
import Button from "./Button";

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [searchQuery, setSearchQuery] = useState("");
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    const [hasNetworkNotification, setHasNetworkNotification] = useState(false);
    const [hasFeedNotification, setHasFeedNotification] = useState(false);
    const [unreadNotifCount, setUnreadNotifCount] = useState(0);

    const checkNotifications = useCallback(async () => {
        if (!user) return;

        // Check general notifications count (likes, comments, replies, connections)
        try {
            const countData = await notificationApi.getUnreadCount();
            if (countData && typeof countData.unreadCount === "number") {
                setUnreadNotifCount(countData.unreadCount);
            }
        } catch (err) {
            console.error("Failed to fetch unread notification count", err);
        }

        try {
            const [receivedReqs, statsData] = await Promise.allSettled([
                userApi.getReceivedConnections(),
                userApi.getConnectionStats()
            ]);

            const reqs = receivedReqs.status === "fulfilled" ? (receivedReqs.value || []) : [];
            const stats = statsData.status === "fulfilled" ? statsData.value : null;

            const storedConnectionCount = parseInt(
                localStorage.getItem("waverly_last_seen_connections_count") || "-1",
                10
            );

            if (location.pathname === "/network") {
                if (stats && stats.connectionCount !== undefined) {
                    localStorage.setItem("waverly_last_seen_connections_count", String(stats.connectionCount));
                }
                localStorage.setItem("waverly_last_network_visit", new Date().toISOString());
                setHasNetworkNotification(reqs.length > 0);
            } else {
                const hasPendingInvitations = reqs.length > 0;
                const hasNewAcceptedConnection =
                    storedConnectionCount !== -1 &&
                    stats &&
                    stats.connectionCount > storedConnectionCount;

                setHasNetworkNotification(hasPendingInvitations || Boolean(hasNewAcceptedConnection));
            }
        } catch (err) {
            console.error("Failed to check network notifications", err);
        }

        try {
            if (location.pathname === "/feed") {
                localStorage.setItem("waverly_last_feed_visit", new Date().toISOString());
                setHasFeedNotification(false);
            } else {
                const posts = await postApi.getPosts();
                const lastFeedVisitStr = localStorage.getItem("waverly_last_feed_visit");
                const lastFeedVisit = lastFeedVisitStr ? new Date(lastFeedVisitStr).getTime() : 0;

                if (Array.isArray(posts) && posts.length > 0) {
                    const otherUsersPosts = posts.filter(
                        p => p.author?._id !== user._id && p.author !== user._id
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

        const handleFocus = () => checkNotifications();
        window.addEventListener("focus", handleFocus);
        const intervalId = setInterval(checkNotifications, 20000);

        return () => {
            window.removeEventListener("focus", handleFocus);
            clearInterval(intervalId);
        };
    }, [user, checkNotifications]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const trimmed = searchQuery.trim();
        if (!trimmed) return;
        navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    };

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
                        <div className="navbar-center">
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
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                    <span className="navbar-search-shortcut">⌘K</span>
                                </div>
                            </form>
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
