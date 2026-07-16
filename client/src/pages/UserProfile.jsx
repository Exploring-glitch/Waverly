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

    const { user, isOwnProfile } = profile;

    return (
        <div className="page">
            <div className="profile-container">
                <div className="profile-banner" />

                <div className="profile-info-section">
                    <div className="profile-meta">
                        <div className="profile-avatar-wrapper">
                            <img
                                src={user.profilePic}
                                alt={user.name}
                                className="profile-avatar"
                            />
                        </div>
                        {isOwnProfile && (
                            <Link to="/edit-profile" className="btn btn-secondary">
                                Edit Profile
                            </Link>
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

                    <ProfileInfo user={user} showEmail={isOwnProfile} />
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
