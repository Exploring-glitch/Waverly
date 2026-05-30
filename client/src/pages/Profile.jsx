import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import CreatePost from "../components/CreatePost";
import ProfileHeader from "../components/ProfileHeader";

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
            <ProfileHeader user={user} />

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
