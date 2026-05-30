import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "./Button";

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const trimmed = searchQuery.trim();
        if (!trimmed) return;
        navigate(`/search?q=${encodeURIComponent(trimmed)}`);
    };

    return (
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
                        <Link to="/dashboard">Dashboard</Link>
                        <Link to="/feed">Feed</Link>
                        <Link to="/profile" className="navbar-user">Hi, {user.name}</Link>
                        <Button variant="secondary" onClick={logout}>
                            Logout
                        </Button>
                    </>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register" className="btn btn-primary btn-link">
                            Sign up
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
