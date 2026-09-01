import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { userApi, postApi } from "../services/api";
import ProfileInfo from "../components/ProfileInfo";
import ProfileAbout from "../components/ProfileAbout";
import ProfileSkills from "../components/ProfileSkills";
import PostCard from "../components/PostCard";

const UserProfile_Page = () => {
    const { username } = useParams();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setError("");

            try {
                const [profileData, userPosts] = await Promise.all([
                    userApi.getByUsername(username),
                    postApi.getPostsByUsername(username),
                ]);
                setProfile(profileData);
                setPosts(userPosts);
            } catch (err) {
                setError(err.message || "Failed to load profile");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [username]);

    if (loading) {
        return <div className="page-center"><div className="spinner" /></div>;
    }

    if (error || !profile) {
        return (
            <div className="page-center">
                <p>{error || "User not found"}</p>
                <Link to="/search">Back to search</Link>
            </div>
        );
    }

    const { user, isOwnProfile, connectionCount, connectionStatus } = profile;

    const handleConnect = async () => {
        try {
            await userApi.sendConnectionRequest(user._id);
            setProfile(prev => ({
                ...prev,
                connectionStatus: "pending_sent"
            }));
        } catch (err) {
            console.error("Failed to connect", err);
        }
    };

    const handleAcceptRequest = async () => {
        try {
            await userApi.acceptConnectionRequest(user._id);
            setProfile(prev => ({
                ...prev,
                connectionStatus: "accepted",
                connectionCount: prev.connectionCount + 1
            }));
        } catch (err) {
            console.error("Failed to accept request", err);
        }
    };

    const handleIgnoreRequest = async () => {
        try {
            await userApi.rejectConnectionRequest(user._id);
            setProfile(prev => ({
                ...prev,
                connectionStatus: "none"
            }));
        } catch (err) {
            console.error("Failed to ignore request", err);
        }
    };

    const handleCancelRequest = async () => {
        try {
            if (window.confirm(connectionStatus === "accepted" ? "Are you sure you want to disconnect?" : "Cancel connection request?")) {
                await userApi.rejectConnectionRequest(user._id);
                setProfile(prev => ({
                    ...prev,
                    connectionStatus: "none",
                    connectionCount: connectionStatus === "accepted" ? prev.connectionCount - 1 : prev.connectionCount
                }));
            }
        } catch (err) {
            console.error("Failed to cancel request / disconnect", err);
        }
    };

    return (
        <div className="page">
            <div className="profile-container">
                <div className="profile-banner-container">
                    {user?.coverPic ? (
                        <img
                            src={user.coverPic}
                            alt={`${user.name}'s Banner`}
                            className="profile-banner-image"
                        />
                    ) : (
                        <div className="profile-banner-default">
                            <div className="profile-banner-glow" />
                        </div>
                    )}
                </div>

                <div className="profile-info-section">
                    <div className="profile-meta">
                        <div className="profile-avatar-wrapper">
                            <img
                                src={user.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                                alt={user.name}
                                className="profile-avatar"
                                onError={(e) => {
                                    e.currentTarget.src = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
                                }}
                            />
                        </div>
                        {isOwnProfile && (
                            <Link to="/edit-profile" className="btn btn-secondary">
                                Edit Profile
                            </Link>
                        )}
                        {!isOwnProfile && (
                            <div style={{ display: "flex", gap: "0.5rem", alignSelf: "center" }}>
                                {connectionStatus === "none" && (
                                    <button onClick={handleConnect} className="btn btn-primary" style={{ borderRadius: "20px", padding: "0.4rem 1.25rem", fontSize: "0.85rem" }}>
                                        Connect
                                    </button>
                                )}
                                {connectionStatus === "pending_sent" && (
                                    <button onClick={handleCancelRequest} className="btn btn-secondary" style={{ borderRadius: "20px", padding: "0.4rem 1.25rem", fontSize: "0.85rem" }}>
                                        Pending
                                    </button>
                                )}
                                {connectionStatus === "pending_received" && (
                                    <div style={{ display: "flex", gap: "0.5rem" }}>
                                        <button onClick={handleIgnoreRequest} className="btn btn-secondary" style={{ borderRadius: "20px", padding: "0.4rem 1.25rem", fontSize: "0.85rem" }}>
                                            Ignore
                                        </button>
                                        <button onClick={handleAcceptRequest} className="btn btn-primary" style={{ borderRadius: "20px", padding: "0.4rem 1.25rem", fontSize: "0.85rem" }}>
                                            Accept
                                        </button>
                                    </div>
                                )}
                                {connectionStatus === "accepted" && (
                                    <button onClick={handleCancelRequest} className="btn btn-secondary" style={{ borderRadius: "20px", padding: "0.4rem 1.25rem", fontSize: "0.85rem" }}>
                                        Connected
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="profile-names">
                        <h2>
                            {user.name}
                            {user.additionalName && (
                                <span className="profile-additional-name">
                                    ({user.additionalName})
                                </span>
                            )}
                        </h2>
                        <p className="profile-handle">@{user.username}</p>
                    </div>

                    <ProfileInfo user={user} showEmail={isOwnProfile} connectionCount={connectionCount} showConnections={true} />
                </div>
            </div>

            <ProfileAbout user={user} isOwnProfile={isOwnProfile} />
            <ProfileSkills user={user} isOwnProfile={isOwnProfile} />

            <div className="activity-container search-profile-activity">
                <h3>Posts</h3>
                {posts.length > 0 ? (
                    <div className="search-post-list">
                        {posts.map((post) => (
                            <PostCard
                                key={post._id}
                                post={post}
                                onDelete={(id) => setPosts(posts.filter((p) => p._id !== id))}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="search-empty-inline">No posts yet.</p>
                )}
            </div>
        </div>
    );
};

export default UserProfile_Page;
