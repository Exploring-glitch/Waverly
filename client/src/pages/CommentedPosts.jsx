import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { postApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

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

const CommentedPosts_Page = () => {
    const { user } = useAuth();
    const [comments, setComments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [editValue, setEditValue] = useState("");
    const navigate = useNavigate();

    const fetchComments = async () => {
        if (!user) return;
        try {
            const allPosts = await postApi.getPosts();
            const userCommentsList = [];
            (allPosts || []).forEach(post => {
                if (post.comments) {
                    post.comments.forEach(comment => {
                        const authorId = comment.author?._id || comment.author;
                        if (authorId === user._id) {
                            userCommentsList.push({
                                ...comment,
                                postId: post._id,
                                post: {
                                    _id: post._id,
                                    content: post.content,
                                    author: post.author
                                }
                            });
                        }
                    });
                }
            });
            // Sort comments by creation date (newest first)
            userCommentsList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            setComments(userCommentsList);
        } catch (err) {
            console.error("Failed to fetch comments", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [user]);

    const handleEditStart = (comment) => {
        setEditingCommentId(comment._id);
        setEditValue(comment.content || "");
    };

    const handleEditSave = async (comment) => {
        if (!editValue.trim()) return;
        try {
            await postApi.editComment(comment.postId, comment._id, editValue.trim());
            setComments(prev => prev.map(c => c._id === comment._id ? { ...c, content: editValue.trim() } : c));
            setEditingCommentId(null);
        } catch (err) {
            console.error("Failed to edit comment", err);
            alert("Failed to save comment changes.");
        }
    };

    const handleDeleteComment = async (comment) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;
        try {
            await postApi.deleteComment(comment.postId, comment._id);
            setComments(prev => prev.filter(c => c._id !== comment._id));
        } catch (err) {
            console.error("Failed to delete comment", err);
            alert("Failed to delete comment.");
        }
    };

    if (!user || isLoading) {
        return <div className="page-center"><div className="spinner" /></div>;
    }

    return (
        <div className="page">
            <div style={{ maxWidth: '800px', margin: '0 auto', width: '100%', padding: '1rem 0' }}>
                {/* Header Section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', padding: '0 1rem' }}>
                    <button 
                        onClick={() => navigate('/feed')}
                        style={{ background: 'transparent', border: 'none', color: '#e7e9ea', cursor: 'pointer', padding: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7"/>
                        </svg>
                    </button>
                    <div>
                        <h2 style={{ margin: 0, color: '#e7e9ea', fontSize: '1.25rem', fontWeight: '700' }}>My Comments</h2>
                        <p style={{ margin: 0, color: '#71767b', fontSize: '0.9rem' }}>{comments.length} Comments</p>
                    </div>
                </div>

                {/* Comments List */}
                {comments.length > 0 ? (
                    <div style={{ padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {comments.map((comment) => {
                            const isEditing = editingCommentId === comment._id;
                            return (
                                <div 
                                    key={comment._id || comment.createdAt}
                                    style={{
                                        background: '#16181c',
                                        border: '1px solid #2f3336',
                                        borderRadius: '10px',
                                        padding: '1.25rem',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '0.75rem'
                                    }}
                                >
                                    {/* Author row */}
                                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                                            <img
                                                src={user.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                                                alt={user.name}
                                                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                                            />
                                            <div>
                                                <div style={{ color: '#f3f5f8', fontWeight: '700', fontSize: '0.9rem' }}>
                                                    {user.name}
                                                </div>
                                                <div style={{ color: '#71767b', fontSize: '0.75rem', marginTop: '0.1rem' }}>
                                                    @{user.username} • {timeAgo(comment.createdAt)}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions: Edit / Delete */}
                                        {!isEditing && (
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => handleEditStart(comment)}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: '#1d9bf0',
                                                        cursor: 'pointer',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600'
                                                    }}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteComment(comment)}
                                                    style={{
                                                        background: 'transparent',
                                                        border: 'none',
                                                        color: '#f4212e',
                                                        cursor: 'pointer',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600'
                                                    }}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {/* Comment text / Edit Form */}
                                    {isEditing ? (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
                                            <textarea
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                style={{
                                                    background: '#090a0f',
                                                    border: '1px solid #2f3336',
                                                    borderRadius: '6px',
                                                    color: '#fff',
                                                    padding: '0.75rem',
                                                    fontSize: '0.9rem',
                                                    resize: 'vertical',
                                                    minHeight: '60px',
                                                    fontFamily: 'inherit'
                                                }}
                                            />
                                            <div style={{ display: 'flex', gap: '0.5rem', alignSelf: 'flex-end' }}>
                                                <button
                                                    onClick={() => setEditingCommentId(null)}
                                                    style={{
                                                        background: '#2f3336',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: '16px',
                                                        padding: '0.4rem 1rem',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={() => handleEditSave(comment)}
                                                    style={{
                                                        background: '#1d9bf0',
                                                        color: '#fff',
                                                        border: 'none',
                                                        borderRadius: '16px',
                                                        padding: '0.4rem 1rem',
                                                        fontSize: '0.75rem',
                                                        fontWeight: '600',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    Save
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <p style={{ color: '#fff', fontSize: '0.9rem', margin: '0 0 0 0', whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>
                                            {comment.content}
                                        </p>
                                    )}

                                    {/* Reference Post Link Card */}
                                    <div 
                                        onClick={() => navigate(`/feed#post-${comment.post._id}`)}
                                        style={{ 
                                            marginTop: '0.25rem',
                                            padding: '0.75rem',
                                            background: '#090a0f',
                                            border: '1px solid #2f3336',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontSize: '0.82rem',
                                            transition: 'background-color 0.2s',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: '0.25rem'
                                        }}
                                        className="comment-post-preview-box"
                                    >
                                        <span style={{ color: '#71767b', fontSize: '0.7rem', fontWeight: '600' }}>
                                            On {comment.post.author?.name || "User"}'s post:
                                        </span>
                                        <div style={{ color: '#e7e9ea', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {comment.post.content || "[Image/Post]"}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#71767b' }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', color: '#e7e9ea' }}>No comments yet</h3>
                        <p style={{ margin: 0 }}>Comments you post will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CommentedPosts_Page;
