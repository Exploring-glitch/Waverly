import { useAuth } from "../context/AuthContext";

const Home_Page = () => {
    const { user } = useAuth();

    return (
        <div className="page">
            <h1>Home</h1>
            {user ? (
                <div className="welcome-card">
                    <p>You are logged in as <strong>{user.name}</strong> (@{user.username})</p>
                    <p>Email: {user.email}</p>
                    <p>
                        College verified:{" "}
                        {user.isCollegeVerified ? "Yes" : "Not yet — coming soon"}
                    </p>
                </div>
            ) : (
                <p>This page is public. Log in to see your profile here.</p>
            )}
        </div>
    );
};

export default Home_Page;
