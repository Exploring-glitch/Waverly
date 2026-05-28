import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "./Button";

const Navbar = () => {
    const { user, logout } = useAuth();

    return (
        <nav className="navbar">
            <Link to="/" className="navbar-brand">
                Waverly
            </Link>
            <div className="navbar-actions">
                {user ? (
                    <>
                        <Link to="/dashboard">Dashboard</Link>
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
