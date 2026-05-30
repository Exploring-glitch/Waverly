import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { postApi } from "../services/api";

function timeAgo(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return `just now`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days} d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months} mo ago`;
    const years = Math.floor(days / 365);
    return `${years} yr ago`;
}

const PostCard = ({ post, onDelete }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const { user } = useAuth();
    
    if (!post) return null;

    const author = post.author || {};
    const isOwner = user && user._id === author._id;

    const handleDelete = async () => {
        try {
            await postApi.deletePost(post._id);
            if (onDelete) onDelete(post._id);
        } catch (err) {
            console.error("Failed to delete post", err);
            setShowDeleteConfirm(false);
        }
    };

    const renderContent = () => {
        if (!post.content) return null;
        const maxLength = 150; 
        if (post.content.length <= maxLength || isExpanded) {
            return <div className="post-content" style={{ marginTop: '0.5rem', fontSize: '0.95rem', lineHeight: '1.5' }}>{post.content}</div>;
        }
        return (
            <div className="post-content" style={{ marginTop: '0.5rem', fontSize: '0.95rem', lineHeight: '1.5' }}>
                {post.content.substring(0, maxLength)}... 
                <button 
                    onClick={() => setIsExpanded(true)}
                    style={{ background: 'transparent', border: 'none', color: '#1d9bf0', cursor: 'pointer', padding: 0, marginLeft: '5px', fontSize: 'inherit' }}
                >
                    more
                </button>
            </div>
        );
    };

    return (
        <div className="post-card" style={{ marginBottom: '1rem', maxWidth: '600px', width: '100%', position: 'relative' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Header Section (Avatar + User Info + Delete) */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                        <img 
                            src={author.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"} 
                            alt={author.name || "User"} 
                            className="post-avatar"
                            style={{ width: '52px', height: '52px', minWidth: '52px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        
                        <div className="post-header" style={{ flexDirection: 'column', flexGrow: 1 }}>
                        {/* Name and additional name */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            {author.username ? (
                                <Link to={`/users/${author.username}`} className="post-author-link">
                                    <span className="post-author-name">{author.name}</span>
                                </Link>
                            ) : (
                                <span className="post-author-name">{author.name}</span>
                            )}
                            {author.additionalName && (
                                <span className="post-additional-name-badge">({author.additionalName})</span>
                            )}
                        </div>
                        
                        {/* Username */}
                        <div style={{ color: '#71767b', fontSize: '0.85rem', fontWeight: '500', marginTop: '0.1rem' }}>
                            {author.username ? (
                                <Link to={`/users/${author.username}`} className="post-author-link">
                                    @{author.username}
                                </Link>
                            ) : (
                                `@${author.username}`
                            )}
                        </div>
                        
                        {/* Created Date */}
                        <div className="post-timestamp" style={{ marginTop: '-0.1rem', fontSize: '0.75rem', color: '#71767b', letterSpacing: '-0.03em' }}>
                            {timeAgo(post.createdAt)}
                        </div>
                    </div>
                    </div>

                    {isOwner && (
                        <div style={{ position: 'relative' }}>
                            <button 
                                className={`post-delete-btn ${showDeleteConfirm ? 'active' : ''}`} 
                                onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                                title="Delete post"
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                            
                            {showDeleteConfirm && (
                                <div style={{ 
                                    position: 'absolute', top: '100%', right: '0', marginTop: '0.5rem',
                                    background: '#000', border: '1px solid #1d9bf0', borderRadius: '12px', 
                                    padding: '1rem', width: '220px', boxShadow: '0 4px 12px rgba(255,255,255,0.1)', 
                                    zIndex: 10 
                                }}>
                                    <p style={{ margin: '0 0 1rem 0', color: '#fff', fontSize: '0.95rem' }}>Are you sure you want to delete?</p>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        <button 
                                            onClick={() => setShowDeleteConfirm(false)}
                                            style={{ background: 'transparent', border: '1px solid #71767b', color: '#fff', cursor: 'pointer', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem' }}
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            onClick={handleDelete}
                                            style={{ background: '#f4212e', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                {/* Content Section (Below Avatar & Header) */}
                <div className="post-main" style={{ width: '100%' }}>
                    {renderContent()}
                    
                    {post.image && (
                        <div className="post-image-container" style={{ marginTop: '1rem' }}>
                            <img src={post.image} alt="Post content" className="post-image" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostCard;
