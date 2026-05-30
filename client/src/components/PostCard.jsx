import { useState } from "react";

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

const PostCard = ({ post }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    
    if (!post) return null;

    const author = post.author || {};

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
        <div className="post-card" style={{ marginBottom: '1rem', maxWidth: '600px', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {/* Header Section (Avatar + User Info) */}
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
                            <span className="post-author-name">{author.name}</span>
                            {author.additionalName && (
                                <span className="post-additional-name-badge">({author.additionalName})</span>
                            )}
                        </div>
                        
                        {/* Username */}
                        <div style={{ color: '#71767b', fontSize: '0.85rem', fontWeight: '500', marginTop: '0.1rem' }}>
                            @{author.username}
                        </div>
                        
                        {/* Created Date */}
                        <div className="post-timestamp" style={{ marginTop: '-0.1rem', fontSize: '0.75rem', color: '#71767b', letterSpacing: '-0.03em' }}>
                            {timeAgo(post.createdAt)}
                        </div>
                    </div>
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
