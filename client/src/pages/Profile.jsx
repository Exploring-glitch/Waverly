import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import CreatePost from "../components/CreatePost";

const Profile_Page = () => {
    const { user } = useAuth();
    const [showCreatePost, setShowCreatePost] = useState(false);
    const createPostRef = useRef(null);

    const handleToggleCreatePost = () => {
        if (!showCreatePost) {
            setShowCreatePost(true);
        }
        setTimeout(() => {
            createPostRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    // For now we assume no posts fetched yet
    const posts = [];
    const hasPosts = posts.length > 0;

    if (!user) {
        return <div className="page-center">Loading profile...</div>;
    }

    return (
        <div className="page">
            <div className="profile-container">
                {/* Banner */}
                <div className="profile-banner"></div>

                <div className="profile-info-section">
                    <div className="profile-meta">
                        {/* Avatar */}
                        <div className="profile-avatar-wrapper">
                            <img
                                src={user.profilePic}
                                alt={user.name}
                                className="profile-avatar"
                            />
                        </div>
                        {/* Edit Button Link */}
                        <Link to="/edit-profile" className="btn btn-secondary">
                            Edit Profile
                        </Link>
                    </div>

                    {/* Name & Handle */}
                    <div className="profile-names">
                        <h2>
                            {user.name}
                            {user.additionalName && (
                                <span className="profile-additional-name">({user.additionalName})</span>
                            )}
                        </h2>
                        <p className="profile-handle">@{user.username}</p>
                    </div>

                    {/* Bio */}
                    {user.bio ? (
                        <p className="profile-bio">{user.bio}</p>
                    ) : (
                        <p className="profile-bio" style={{ color: "#71767b", fontStyle: "italic" }}>
                            No bio added yet.
                        </p>
                    )}

                    {/* College details and email */}
                    <div className="profile-metadata">
                        {user.collegeName && (
                            <div className="metadata-item">
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M22 7.24L12 3.3 2 7.24l10 3.93L22 7.24zM2.5 12h1v4h-1v-4zm15.5 0h1v4h-1v-4zM12 18.25L4.5 15.3v-4.06l7.5 2.95 7.5-2.95v4.06l-7.5 2.95z" />
                                </svg>
                                <span>{user.collegeName}</span>
                            </div>
                        )}
                        {(user.startYear || user.endYear) ? (
                            <div className="metadata-item">
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M19 4h-2V3c0-.55-.45-1-1-1s-1 .45-1 1v1H9V3c0-.55-.45-1-1-1s-1 .45-1 1v1H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V8h14v12z" />
                                </svg>
                                <span>{user.startYear} - {user.endYear}</span>
                            </div>
                        ) : null}
                        <div className="metadata-item">
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M1.998 5.5c0-1.381 1.11-2.5 2.5-2.5h15c1.38 0 2.5 1.119 2.5 2.5v13c0 1.381-1.12 2.5-2.5 2.5h-15c-1.39 0-2.5-1.119-2.5-2.5v-13zm2.5-.5c-.276 0-.5.224-.5.5v.19l7.585 5.56c.249.18.581.18.83 0l7.585-5.56V5.5c0-.276-.224-.5-.5-.5h-15zm15.5 2.19l-7.234 5.3c-.456.33-1.076.33-1.532 0L3.998 7.19V18c0 .28.224.5.5.5h15c.28 0 .5-.22.5-.5V7.19z" />
                            </svg>
                            <span>{user.email}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="activity-container" style={{ marginTop: '2rem', background: '#16181c', borderRadius: '16px', padding: '1.5rem', border: '1px solid #2f3336' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', color: '#e7e9ea' }}>Activity</h3>

                {hasPosts ? (
                    <div>
                        <h4 style={{ margin: '0 0 1rem 0', color: '#e7e9ea' }}>Posts</h4>
                        {/* Empty for now as requested */}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '2rem 0', color: '#71767b' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#e7e9ea', fontSize: '1.1rem' }}>You haven't posted yet</h4>
                        <p style={{ margin: 0, fontSize: '0.9rem' }}>Posts you share will be displayed here.</p>
                    </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', borderTop: '1px solid #2f3336', paddingTop: '1rem' }}>
                    <button className="btn btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
                        Show all posts
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleToggleCreatePost}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                    >
                        Create a post
                    </button>
                </div>
            </div>

            {showCreatePost && (
                <div
                    ref={createPostRef}
                    style={{
                        marginTop: '3rem',
                        paddingBottom: '4rem',
                        minHeight: '80vh'
                    }}
                >
                    <div style={{ marginBottom: '2rem', padding: '0 0.5rem' }}>
                        <h1 style={{ fontSize: '2.2rem', fontWeight: '800', color: '#e7e9ea', margin: '0 0 0.5rem' }}>Campus Feed</h1>
                        <p style={{ color: '#71767b', fontSize: '1.1rem', margin: 0 }}>Share what's happening around your community.</p>
                    </div>
                    <div style={{ transform: 'scale(1.05)', transformOrigin: 'top center' }}>
                        <CreatePost autoFocus={true} onClose={() => setShowCreatePost(false)} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile_Page;
