import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "./Button";

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [showLogoutModal, setShowLogoutModal] = useState(false);

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
                    {/* Left: Brand */}
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

                    {/* Center: Search */}
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

                    {/* Right: Actions */}
                    <nav className="navbar-actions">
                        {user ? (
                            <>
                                <NavLink
                                    to="/feed"
                                    className={({ isActive }) => `navbar-nav-item ${isActive ? "active" : ""}`}
                                    title="Feed"
                                >
                                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                                        <polyline points="9 22 9 12 15 12 15 22" />
                                    </svg>
                                    <span className="nav-item-label">Feed</span>
                                </NavLink>

                                <NavLink
                                    to="/network"
                                    className={({ isActive }) => `navbar-nav-item ${isActive ? "active" : ""}`}
                                    title="Network"
                                >
                                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                    <span className="nav-item-label">Network</span>
                                </NavLink>

                                <NavLink
                                    to="/dashboard"
                                    className={({ isActive }) => `navbar-nav-item ${isActive ? "active" : ""}`}
                                    title="Dashboard"
                                >
                                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <rect x="3" y="3" width="7" height="7" />
                                        <rect x="14" y="3" width="7" height="7" />
                                        <rect x="14" y="14" width="7" height="7" />
                                        <rect x="3" y="14" width="7" height="7" />
                                    </svg>
                                    <span className="nav-item-label">Dashboard</span>
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

            {/* Professional Logout Confirmation Modal */}
            {showLogoutModal && user && (
                <div className="modal-overlay" onClick={() => setShowLogoutModal(false)} style={{ zIndex: 3000 }}>
                    <div
                        className="modal-box modal-logout-box"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="logout-modal-header">
                            <div className="logout-modal-icon-badge">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                    <polyline points="16 17 21 12 16 7"></polyline>
                                    <line x1="21" y1="12" x2="9" y2="12"></line>
                                </svg>
                            </div>
                            <h3 className="logout-modal-title">
                                Sign out of Waverly?
                            </h3>
                            <p className="logout-modal-subtitle">
                                You can always log back in to access your connections and posts.
                            </p>
                        </div>

                        {/* User Account Details */}
                        <div className="logout-user-preview">
                            <img
                                src={user.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                                alt={user.name}
                                className="logout-user-avatar"
                                onError={(e) => {
                                    e.currentTarget.src = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
                                }}
                            />
                            <div className="logout-user-info">
                                <span className="logout-user-name">{user.name}</span>
                                <span className="logout-user-handle">@{user.username}</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="logout-modal-actions">
                            <Button
                                variant="secondary"
                                onClick={() => setShowLogoutModal(false)}
                                fullWidth
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="danger"
                                onClick={handleConfirmLogout}
                                fullWidth
                            >
                                Log out
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;
