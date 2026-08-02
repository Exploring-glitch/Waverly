import { useState, useEffect, useRef } from "react";
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

const renderReplyContent = (content) => {
    if (!content) return null;
    const mentionRegex = /^@(\w+)\s+(.*)/;
    const match = content.match(mentionRegex);
    if (match) {
        const username = match[1];
        const restText = match[2];
        return (
            <>
                <Link 
                    to={`/users/${username}`} 
                    className="reply-mention" 
                    style={{ color: '#1d9bf0', fontWeight: '600', marginRight: '4px', textDecoration: 'none' }}
                >
                    @{username}
                </Link>
                {restText}
            </>
        );
    }
    return content;
};

const ReplyItem = ({ reply, postId, commentId, currentUserId, onCommentsUpdate, onReplyClick }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(reply.content || "");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const replyAuthor = reply.author || {};
    const isReplyOwner = currentUserId && currentUserId === replyAuthor._id;
    const likes = reply.likes || [];
    const isReplyLiked = currentUserId && likes.includes(currentUserId);

    const handleLike = async () => {
        try {
            const data = await postApi.likeReply(postId, commentId, reply._id);
            onCommentsUpdate(data.comments || []);
        } catch (err) {
            console.error("Failed to like reply", err);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editText.trim()) return;
        try {
            const data = await postApi.editReply(postId, commentId, reply._id, editText);
            onCommentsUpdate(data.comments || []);
            setIsEditing(false);
        } catch (err) {
            console.error("Failed to edit reply", err);
        }
    };

    const handleDelete = async () => {
        try {
            const data = await postApi.deleteReply(postId, commentId, reply._id);
            onCommentsUpdate(data.comments || []);
            setShowDeleteConfirm(false);
        } catch (err) {
            console.error("Failed to delete reply", err);
        }
    };

    return (
        <div className="reply-item-container" style={{ display: 'flex', flexDirection: 'column', position: 'relative', width: '100%' }}>
            <div style={showDeleteConfirm ? { filter: 'blur(3px)', pointerEvents: 'none', transition: 'filter 0.2s ease' } : { transition: 'filter 0.2s ease' }}>
                <div className="reply-item">
                    <img
                        src={replyAuthor.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                        alt={replyAuthor.name || "User"}
                        className="reply-avatar"
                    />
                    
                    <div className="comment-row">
                        <div className="reply-bubble">
                            <div className="reply-header">
                                <div>
                                    {replyAuthor.username ? (
                                        <Link to={`/users/${replyAuthor.username}`} className="reply-author-name">
                                            {replyAuthor.name}
                                        </Link>
                                    ) : (
                                        <span className="reply-author-name">{replyAuthor.name}</span>
                                    )}
                                    {replyAuthor.additionalName && (
                                        <span className="reply-author-handle">({replyAuthor.additionalName})</span>
                                    )}
                                </div>
                                <span className="reply-time">{timeAgo(reply.createdAt)}</span>
                            </div>

                            {isEditing ? (
                                <form onSubmit={handleEditSubmit} className="comment-edit-wrapper">
                                    <textarea
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        className="comment-edit-input"
                                        required
                                    />
                                    <div className="comment-edit-actions">
                                        <button type="button" onClick={() => { setIsEditing(false); setEditText(reply.content); }} className="btn-edit-action btn-edit-cancel">Cancel</button>
                                        <button type="submit" className="btn-edit-action btn-edit-save">Save</button>
                                    </div>
                                </form>
                            ) : (
                                <div className="reply-content">{renderReplyContent(reply.content)}</div>
                            )}
                        </div>

                        {/* Like button on the right next to reply bubble */}
                        <button
                            onClick={handleLike}
                            className={`comment-like-btn ${isReplyLiked ? 'active' : ''}`}
                            title={isReplyLiked ? "Unlike reply" : "Like reply"}
                        >
                            <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                            </svg>
                            {likes.length > 0 && <span className="comment-like-count">{likes.length}</span>}
                        </button>
                    </div>
                </div>

                {/* Reply action buttons below reply bubble on left */}
                {!isEditing && (
                    <div className="comment-options-bar" style={{ marginLeft: '2.5rem' }}>
                        <button onClick={() => onReplyClick(replyAuthor.username || replyAuthor.name || "")} className="comment-option-btn">Reply</button>
                        {isReplyOwner && (
                            <>
                                <button onClick={() => setIsEditing(true)} className="comment-option-btn">Edit</button>
                                <button onClick={() => setShowDeleteConfirm(true)} className="comment-option-btn danger-hover">Delete</button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Deletion popover modal overlay centered on the reply item */}
            {showDeleteConfirm && (
                <div style={{ 
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(22, 24, 28, 0.96)', 
                    border: '1px solid #2f3336', 
                    borderRadius: '12px', 
                    padding: '0.85rem 1rem', 
                    width: '240px', 
                    boxShadow: '0 8px 32px rgba(0,0,0,0.65)', 
                    zIndex: 20,
                    textAlign: 'center',
                }}>
                    <p style={{ margin: '0 0 0.85rem 0', color: '#fff', fontSize: '0.75rem', fontWeight: '500', lineHeight: '1.4' }}>
                        Are you sure you want to delete this reply?
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button 
                            onClick={() => setShowDeleteConfirm(false)}
                            style={{ 
                                background: 'transparent', 
                                border: '1px solid #71767b', 
                                color: '#fff', 
                                cursor: 'pointer', 
                                padding: '0.3rem 0.7rem', 
                                borderRadius: '20px', 
                                fontSize: '0.7rem',
                                fontWeight: '600'
                            }}
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleDelete}
                            style={{ 
                                background: '#f4212e', 
                                border: 'none', 
                                color: '#fff', 
                                cursor: 'pointer', 
                                padding: '0.3rem 0.7rem', 
                                borderRadius: '20px', 
                                fontSize: '0.7rem', 
                                fontWeight: 'bold' 
                            }}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const CommentItem = ({ comment, postId, currentUserId, currentUserProfilePic, onCommentsUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment.content || "");
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const replyInputRef = useRef(null);

    const handleReplyClickFromChild = (username) => {
        setShowReplyForm(true);
        if (username) {
            setReplyText(`@${username} `);
        }
        setTimeout(() => {
            if (replyInputRef.current) {
                replyInputRef.current.focus();
            }
        }, 100);
    };

    const commentAuthor = comment.author || {};
    const isCommentOwner = currentUserId && currentUserId === commentAuthor._id;
    const likes = comment.likes || [];
    const isCommentLiked = currentUserId && likes.includes(currentUserId);
    const replies = comment.replies || [];

    const handleLike = async () => {
        try {
            const data = await postApi.likeComment(postId, comment._id);
            onCommentsUpdate(data.comments || []);
        } catch (err) {
            console.error("Failed to like comment", err);
        }
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        if (!editText.trim()) return;
        try {
            const data = await postApi.editComment(postId, comment._id, editText);
            onCommentsUpdate(data.comments || []);
            setIsEditing(false);
        } catch (err) {
            console.error("Failed to edit comment", err);
        }
    };

    const handleDelete = async () => {
        try {
            const data = await postApi.deleteComment(postId, comment._id);
            onCommentsUpdate(data.comments || []);
            setShowDeleteConfirm(false);
        } catch (err) {
            console.error("Failed to delete comment", err);
        }
    };

    const handleReplySubmit = async (e) => {
        e.preventDefault();
        if (!replyText.trim() || isSubmittingReply) return;
        setIsSubmittingReply(true);
        try {
            const data = await postApi.replyComment(postId, comment._id, replyText);
            onCommentsUpdate(data.comments || []);
            setReplyText("");
        } catch (err) {
            console.error("Failed to submit reply", err);
        } finally {
            setIsSubmittingReply(false);
        }
    };

    return (
        <div className="comment-item-container" style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div style={showDeleteConfirm ? { filter: 'blur(3px)', pointerEvents: 'none', transition: 'filter 0.2s ease' } : { transition: 'filter 0.2s ease' }}>
                <div className="comment-item">
                    <img
                        src={commentAuthor.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                        alt={commentAuthor.name || "User"}
                        className="comment-avatar"
                    />

                    <div className="comment-row">
                        <div className="comment-bubble">
                            <div className="comment-header">
                                <div>
                                    {commentAuthor.username ? (
                                        <Link to={`/users/${commentAuthor.username}`} className="comment-author-name">
                                            {commentAuthor.name}
                                        </Link>
                                    ) : (
                                        <span className="comment-author-name">{commentAuthor.name}</span>
                                    )}
                                    {commentAuthor.additionalName && (
                                        <span className="comment-author-handle">({commentAuthor.additionalName})</span>
                                    )}
                                </div>
                                <span className="comment-time">{timeAgo(comment.createdAt)}</span>
                            </div>

                            {isEditing ? (
                                <form onSubmit={handleEditSubmit} className="comment-edit-wrapper">
                                    <textarea
                                        value={editText}
                                        onChange={(e) => setEditText(e.target.value)}
                                        className="comment-edit-input"
                                        required
                                    />
                                    <div className="comment-edit-actions">
                                        <button type="button" onClick={() => { setIsEditing(false); setEditText(comment.content); }} className="btn-edit-action btn-edit-cancel">Cancel</button>
                                        <button type="submit" className="btn-edit-action btn-edit-save">Save</button>
                                    </div>
                                </form>
                            ) : (
                                <div className="comment-content">{comment.content}</div>
                            )}
                        </div>

                        {/* Like button on the right next to content */}
                        <button
                            onClick={handleLike}
                            className={`comment-like-btn ${isCommentLiked ? 'active' : ''}`}
                            title={isCommentLiked ? "Unlike comment" : "Like comment"}
                        >
                            <svg viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                            </svg>
                            {likes.length > 0 && <span className="comment-like-count">{likes.length}</span>}
                        </button>
                    </div>
                </div>

                {/* Actions Bar (Reply, Edit, Delete options below bubble on left) */}
                {!isEditing && (
                    <div className="comment-options-bar">
                        <button onClick={() => setShowReplyForm(!showReplyForm)} className="comment-option-btn">
                            Reply{replies.length > 0 ? ` (${replies.length})` : ''}
                        </button>
                        {isCommentOwner && (
                            <>
                                <button onClick={() => setIsEditing(true)} className="comment-option-btn">Edit</button>
                                <button onClick={() => setShowDeleteConfirm(true)} className="comment-option-btn danger-hover">Delete</button>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Absolute overlay delete confirmation box (rendered centered on top of the blurred content) */}
            {showDeleteConfirm && (
                <div style={{ 
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(22, 24, 28, 0.96)', 
                    border: '1px solid #2f3336', 
                    borderRadius: '12px', 
                    padding: '0.85rem 1rem', 
                    width: '260px', 
                    boxShadow: '0 8px 32px rgba(0,0,0,0.65)', 
                    zIndex: 20,
                    textAlign: 'center',
                }}>
                    <p style={{ margin: '0 0 0.85rem 0', color: '#fff', fontSize: '0.8rem', fontWeight: '500', lineHeight: '1.4' }}>
                        Are you sure you want to delete this comment?
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        <button 
                            onClick={() => setShowDeleteConfirm(false)}
                            style={{ 
                                background: 'transparent', 
                                border: '1px solid #71767b', 
                                color: '#fff', 
                                cursor: 'pointer', 
                                padding: '0.35rem 0.8rem', 
                                borderRadius: '20px', 
                                fontSize: '0.75rem',
                                fontWeight: '600'
                            }}
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleDelete}
                            style={{ 
                                background: '#f4212e', 
                                border: 'none', 
                                color: '#fff', 
                                cursor: 'pointer', 
                                padding: '0.35rem 0.8rem', 
                                borderRadius: '20px', 
                                fontSize: '0.75rem', 
                                fontWeight: 'bold' 
                            }}
                        >
                            Delete
                        </button>
                    </div>
                </div>
            )}

            {/* Replies section (Reply Form & List) */}
            {showReplyForm && (
                <div className="comment-replies-section">
                    {/* Reply Input Form */}
                    <div className="reply-input-wrapper">
                        <img
                            src={currentUserProfilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                            alt="Me"
                            className="reply-input-avatar"
                        />
                        <form onSubmit={handleReplySubmit} className="reply-form">
                            <input
                                ref={replyInputRef}
                                type="text"
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="Write a reply..."
                                className="reply-input"
                                disabled={isSubmittingReply}
                            />
                            <button
                                type="submit"
                                className="btn-reply-submit"
                                disabled={!replyText.trim() || isSubmittingReply}
                            >
                                {isSubmittingReply ? "..." : "Reply"}
                            </button>
                        </form>
                    </div>

                    {/* Replies List */}
                    {replies.length > 0 && (
                        <div className="replies-list">
                            {replies.map((reply) => (
                                <ReplyItem
                                    key={reply._id || reply.createdAt}
                                    reply={reply}
                                    postId={postId}
                                    commentId={comment._id}
                                    currentUserId={currentUserId}
                                    onCommentsUpdate={onCommentsUpdate}
                                    onReplyClick={handleReplyClickFromChild}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const PostCard = ({ post, onDelete, onSaveToggle }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const { user } = useAuth();

    const [likes, setLikes] = useState(post.likes || []);
    const [comments, setComments] = useState(post.comments || []);
    const [showComments, setShowComments] = useState(false);
    const [newCommentText, setNewCommentText] = useState("");
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isSaved, setIsSaved] = useState(() => {
        try {
            const saved = localStorage.getItem("savedPosts");
            if (saved) {
                const parsed = JSON.parse(saved);
                return parsed.includes(post._id);
            }
        } catch (e) {
            console.error(e);
        }
        return false;
    });

    useEffect(() => {
        if (post) {
            setLikes(post.likes || []);
            setComments(post.comments || []);
        }
    }, [post]);

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

    const handleLike = async () => {
        if (!user) return;
        const userId = user._id;
        const index = likes.indexOf(userId);
        let newLikes = [...likes];
        if (index === -1) {
            newLikes.push(userId);
        } else {
            newLikes.splice(index, 1);
        }
        setLikes(newLikes);

        try {
            const data = await postApi.likePost(post._id);
            setLikes(data.likes || []);
        } catch (err) {
            console.error("Failed to like post", err);
            setLikes(likes);
        }
    };

    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        if (!newCommentText.trim() || isSubmittingComment) return;

        setIsSubmittingComment(true);
        try {
            const data = await postApi.commentPost(post._id, newCommentText);
            setComments(data.comments || []);
            setNewCommentText("");
        } catch (err) {
            console.error("Failed to submit comment", err);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleShare = () => {
        const shareUrl = `${window.location.origin}/feed#post-${post._id}`;
        navigator.clipboard.writeText(shareUrl)
            .then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            })
            .catch((err) => {
                console.error("Failed to copy share link", err);
            });
    };

    const handleSave = () => {
        try {
            const saved = localStorage.getItem("savedPosts");
            let parsed = saved ? JSON.parse(saved) : [];
            const index = parsed.indexOf(post._id);
            if (index === -1) {
                parsed.push(post._id);
                setIsSaved(true);
            } else {
                parsed.splice(index, 1);
                setIsSaved(false);
            }
            localStorage.setItem("savedPosts", JSON.stringify(parsed));
            if (onSaveToggle) onSaveToggle(post._id, index === -1);
        } catch (e) {
            console.error(e);
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

                {/* Actions Bar */}
                <div className="post-actions-bar">
                    <div className="post-actions-left">
                        <button
                            onClick={handleLike}
                            className={`post-action-btn ${likes.includes(user?._id) ? 'active' : ''}`}
                        >
                            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                            </svg>
                            {likes.length > 0 && <span>{likes.length}</span>}
                        </button>

                        <button
                            onClick={() => setShowComments(!showComments)}
                            className="post-action-btn"
                        >
                            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                            </svg>
                            {comments.length > 0 && <span>{comments.length}</span>}
                        </button>

                        <button
                            onClick={handleShare}
                            className="post-action-btn"
                            style={{ position: 'relative' }}
                        >
                            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="18" cy="5" r="3" />
                                <circle cx="6" cy="12" r="3" />
                                <circle cx="18" cy="19" r="3" />
                                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                            </svg>
                            {copied && <span className="share-alert">Link copied!</span>}
                        </button>
                    </div>

                    <div className="post-actions-right">
                        <button
                            onClick={handleSave}
                            className={`post-action-btn ${isSaved ? 'active' : ''}`}
                            title={isSaved ? "Saved" : "Save"}
                        >
                            {isSaved ? (
                                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="currentColor" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                                </svg>
                            ) : (
                                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                                </svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Comments Section */}
                {showComments && (
                    <div className="post-comments-section">
                        {/* Add Comment Input */}
                        <div className="comment-input-wrapper">
                            <img
                                src={user?.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                                alt={user?.name || "Me"}
                                className="comment-input-avatar"
                            />
                            <form onSubmit={handleCommentSubmit} className="comment-form">
                                <input
                                    type="text"
                                    value={newCommentText}
                                    onChange={(e) => setNewCommentText(e.target.value)}
                                    placeholder="Add a comment..."
                                    className="comment-input"
                                    disabled={isSubmittingComment}
                                />
                                <button
                                    type="submit"
                                    className="btn-comment-submit"
                                    disabled={!newCommentText.trim() || isSubmittingComment}
                                >
                                    {isSubmittingComment ? "Posting..." : "Post"}
                                </button>
                            </form>
                        </div>

                        {/* Comments List */}
                        {comments.length > 0 && (
                            <div className="comments-list">
                                {[...comments].reverse().map((comment) => (
                                    <CommentItem
                                        key={comment._id || comment.createdAt}
                                        comment={comment}
                                        postId={post._id}
                                        currentUserId={user?._id}
                                        currentUserProfilePic={user?.profilePic}
                                        onCommentsUpdate={setComments}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PostCard;
