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
            <div className="profile-container profile-card-elevated">
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
                            <div className="profile-banner-pattern-overlay" />
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
                            <div className="profile-action-buttons">
                                <Link to="/edit-profile" className="btn btn-primary btn-edit-profile">
                                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                    <span>Edit Profile</span>
                                </Link>
                            </div>
                        )}
                        {!isOwnProfile && (
                            <div className="profile-action-buttons">
                                {connectionStatus === "none" && (
                                    <button onClick={handleConnect} className="btn btn-primary btn-edit-profile">
                                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                            <circle cx="8.5" cy="7" r="4" />
                                            <line x1="20" y1="8" x2="20" y2="14" />
                                            <line x1="23" y1="11" x2="17" y2="11" />
                                        </svg>
                                        <span>Connect</span>
                                    </button>
                                )}
                                {connectionStatus === "pending_sent" && (
                                    <button onClick={handleCancelRequest} className="btn btn-secondary btn-share-profile" title="Click to cancel connection request">
                                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="12" cy="12" r="10" />
                                            <polyline points="12 6 12 12 16 14" />
                                        </svg>
                                        <span>Pending</span>
                                    </button>
                                )}
                                {connectionStatus === "pending_received" && (
                                    <div className="profile-action-buttons" style={{ margin: 0 }}>
                                        <button onClick={handleIgnoreRequest} className="btn btn-secondary btn-share-profile">
                                            Ignore
                                        </button>
                                        <button onClick={handleAcceptRequest} className="btn btn-primary btn-edit-profile">
                                            Accept
                                        </button>
                                    </div>
                                )}
                                {connectionStatus === "accepted" && (
                                    <button onClick={handleCancelRequest} className="btn btn-secondary btn-share-profile" title="Click to disconnect">
                                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        <span>Connected</span>
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
