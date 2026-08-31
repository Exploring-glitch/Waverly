import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CreatePost from "./CreatePost";
import PostCard from "./PostCard";
import { postApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

const ProfileActivity = () => {
    const { user } = useAuth();
    const [showCreatePost, setShowCreatePost] = useState(false);
    const [posts, setPosts] = useState([]);
    const createPostRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPosts = async () => {
            if (!user) return;
            try {
                const fetchedPosts = await postApi.getMyPosts();
                setPosts(fetchedPosts);
            } catch (err) {
                console.error("Failed to fetch posts", err);
            }
        };
        fetchPosts();
    }, [user, showCreatePost]);

    const handleToggleCreatePost = () => {
        if (!showCreatePost) {
            setShowCreatePost(true);
        }
        setTimeout(() => {
            createPostRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const hasPosts = posts.length > 0;
    const latestPost = hasPosts ? posts[0] : null;

    return (
        <>
            <div className="activity-container" style={{ marginTop: '2rem', background: '#16181c', borderRadius: '16px', padding: '1.5rem', border: '1px solid #2f3336' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <div>
                        <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#e7e9ea', fontWeight: '600' }}>Activity</h3>
                        {hasPosts && (
                            <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: '#1d9bf0', fontWeight: '600' }}>
                                {posts.length} {posts.length === 1 ? 'post' : 'posts'}
                            </p>
                        )}
                    </div>
                    <button
                        className="btn btn-primary"
                        onClick={handleToggleCreatePost}
                        style={{
                            borderRadius: '20px',
                            padding: '0.45rem 1.1rem',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            cursor: 'pointer'
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Create a post
                    </button>
                </div>

                {hasPosts ? (
                    <div>
                        <h4 style={{ margin: '0 0 1rem 0', color: '#71767b', fontSize: '0.9rem', fontWeight: '500' }}>Latest Post</h4>
                        <PostCard post={latestPost} onDelete={(id) => setPosts(posts.filter(p => p._id !== id))} />
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#71767b' }}>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#e7e9ea', fontSize: '1.1rem' }}>You haven't posted yet</h4>
                        <p style={{ margin: '0 0 1.25rem 0', fontSize: '0.9rem' }}>Posts you share will be displayed here.</p>
                        <button
                            className="btn btn-primary"
                            onClick={handleToggleCreatePost}
                            style={{
                                borderRadius: '20px',
                                padding: '0.5rem 1.25rem',
                                fontSize: '0.85rem',
                                fontWeight: '600',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem'
                            }}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            Create a post
                        </button>
                    </div>
                )}

                {hasPosts && (
                    <div style={{ marginTop: '1.25rem', borderTop: '1px solid #2f3336', margin: '1.25rem -1.5rem -1.5rem -1.5rem' }}>
                        <button 
                            className="show-all-btn" 
                            style={{ width: '100%', padding: '0.85rem 1rem' }}
                            onClick={() => navigate('/profile/posts')}
                        >
                            Show all posts
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </button>
                    </div>
                )}
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
        </>
    );
};

export default ProfileActivity;
