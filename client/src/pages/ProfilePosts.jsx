import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { postApi } from "../services/api";
import PostCard from "../components/PostCard";
import { useAuth } from "../context/AuthContext";

const ProfilePosts_Page = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPosts = async () => {
            if (!user) return;
            try {
                const fetchedPosts = await postApi.getMyPosts();
                setPosts(fetchedPosts);
            } catch (err) {
                console.error("Failed to fetch posts", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPosts();
    }, [user]);

    if (!user || isLoading) {
        return <div className="page-center"><div className="spinner" /></div>;
    }

    return (
        <div className="page">
            <div style={{ maxWidth: '1000px', margin: '0 auto', width: '100%', padding: '1rem 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', padding: '0 1rem' }}>
                    <button 
                        onClick={() => navigate('/profile')}
                        style={{ background: 'transparent', border: 'none', color: '#e7e9ea', cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7"/>
                        </svg>
                    </button>
                    <div>
                        <h2 style={{ margin: 0, color: '#e7e9ea', fontSize: '1.25rem', fontWeight: '700' }}>All Activity</h2>
                        <p style={{ margin: 0, color: '#71767b', fontSize: '0.9rem' }}>{posts.length} Posts</p>
                    </div>
                </div>

                {posts.length > 0 ? (
                    <div style={{ padding: '0 1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem', alignItems: 'start' }}>
                        {posts.map(post => (
                            <PostCard key={post._id} post={post} onDelete={(id) => setPosts(posts.filter(p => p._id !== id))} />
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#71767b' }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#e7e9ea' }}>No posts yet</h3>
                        <p style={{ margin: 0 }}>When you create posts, they'll show up here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePosts_Page;
