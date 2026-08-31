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
            <nav className="navbar">
                <Link to="/" className="navbar-brand">
                    Waverly
                </Link>

                {user && (
                    <form className="navbar-search" onSubmit={handleSearchSubmit}>
                        <svg className="search-icon" viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904l4.154 4.154a1 1 0 1 0 1.414-1.414l-4.154-4.154A6.457 6.457 0 0 0 16.75 10.25c0-3.59-2.91-6.5-6.5-6.5z" />
                        </svg>
                        <input
                            type="search"
                            className="navbar-search-input"
                            placeholder="Search people, colleges, companies..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>
                )}

                <div className="navbar-actions">
                    {user ? (
                        <>
                            <NavLink to="/dashboard" className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}>Dashboard</NavLink>
                            <NavLink to="/feed" className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}>Feed</NavLink>
                            <NavLink to="/network" className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}>My Network</NavLink>
                            <NavLink to="/profile" className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}>Hi, {user.name}</NavLink>
                            <Button variant="secondary" onClick={() => setShowLogoutModal(true)}>
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <NavLink to="/login" className={({ isActive }) => `navbar-link ${isActive ? "active" : ""}`}>Login</NavLink>
                            <Link to="/register" className="btn btn-primary btn-link">
                                Sign up
                            </Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Professional Logout Confirmation Modal */}
            {showLogoutModal && user && (
                <div className="modal-overlay" onClick={() => setShowLogoutModal(false)} style={{ zIndex: 3000 }}>
                    <div
                        className="modal-box"
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxWidth: '420px', padding: '1.75rem', borderRadius: '16px', background: '#16181c', border: '1px solid #2f3336' }}
                    >
                        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
                            <div style={{
                                width: '52px',
                                height: '52px',
                                borderRadius: '50%',
                                background: 'rgba(244, 33, 46, 0.12)',
                                color: '#f4212e',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 1rem auto'
                            }}>
                                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                    <polyline points="16 17 21 12 16 7"></polyline>
                                    <line x1="21" y1="12" x2="9" y2="12"></line>
                                </svg>
                            </div>
                            <h3 style={{ margin: '0 0 0.4rem 0', fontSize: '1.25rem', color: '#e7e9ea', fontWeight: '700' }}>
                                Sign out of Waverly?
                            </h3>
                            <p style={{ margin: 0, fontSize: '0.88rem', color: '#71767b', lineHeight: '1.4' }}>
                                You can always log back in at any time.
                            </p>
                        </div>

                        {/* User Account Details */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem 1rem',
                            background: '#0f1419',
                            border: '1px solid #2f3336',
                            borderRadius: '12px',
                            marginBottom: '1.5rem'
                        }}>
                            <img
                                src={user.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                                alt={user.name}
                                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                                onError={(e) => {
                                    e.currentTarget.src = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
                                }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, textAlign: 'left' }}>
                                <span style={{ fontWeight: '700', color: '#e7e9ea', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {user.name}
                                </span>
                                <span style={{ fontSize: '0.75rem', color: '#71767b' }}>
                                    @{user.username}
                                </span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setShowLogoutModal(false)}
                                style={{ flex: 1, padding: '0.65rem 1rem', borderRadius: '25px', fontWeight: '600', fontSize: '0.9rem' }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmLogout}
                                style={{
                                    flex: 1,
                                    padding: '0.65rem 1rem',
                                    borderRadius: '25px',
                                    background: '#f4212e',
                                    color: '#fff',
                                    border: 'none',
                                    fontWeight: '700',
                                    fontSize: '0.9rem',
                                    cursor: 'pointer',
                                    transition: 'background-color 0.2s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#dc1e29'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f4212e'}
                            >
                                Log out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;

