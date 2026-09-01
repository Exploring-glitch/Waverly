import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { postApi } from "../services/api";

function timeAgo(dateString) {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    const years = Math.floor(days / 365);
    return `${years}y ago`;
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
                    className="reply-mention-pill"
                >
                    @{username}
                </Link>{" "}
                {restText}
            </>
        );
    }
    return content;
};

/* ==========================================================================
   Reply Item Component
   ========================================================================== */
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
        e?.preventDefault();
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
        <div className="feed-reply-item-wrapper">
            <div className="feed-reply-item">
                <Link to={`/users/${replyAuthor.username || ""}`}>
                    <img
                        src={replyAuthor.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                        alt={replyAuthor.name || "User"}
                        className="feed-reply-avatar"
                        onError={(e) => {
                            e.currentTarget.src = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
                        }}
                    />
                </Link>

                <div className="feed-reply-main">
                    <div className="feed-reply-bubble">
                        <div className="feed-reply-header">
                            <div className="feed-reply-author-col">
                                <Link to={`/users/${replyAuthor.username || ""}`} className="feed-reply-author-name">
                                    {replyAuthor.name}
                                </Link>
                                {replyAuthor.username && (
                                    <span className="feed-reply-author-handle">@{replyAuthor.username}</span>
                                )}
                            </div>
                            <span className="feed-reply-time">{timeAgo(reply.createdAt)}</span>
                        </div>

                        {isEditing ? (
                            <form onSubmit={handleEditSubmit} className="feed-comment-edit-form">
                                <textarea
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    className="feed-comment-edit-input"
                                    required
                                />
                                <div className="feed-comment-edit-actions">
                                    <button type="button" onClick={() => { setIsEditing(false); setEditText(reply.content); }} className="btn btn-secondary btn-sm">
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary btn-sm">
                                        Save
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="feed-reply-content-text">
                                {renderReplyContent(reply.content)}
                            </div>
                        )}
                    </div>

                    {/* Reply Actions Bar */}
                    <div className="feed-reply-actions-row">
                        <button
                            type="button"
                            onClick={handleLike}
                            className={`feed-mini-action-btn ${isReplyLiked ? "active" : ""}`}
                        >
                            👍 {likes.length > 0 && <span>{likes.length}</span>}
                        </button>

                        <button
                            type="button"
                            onClick={() => onReplyClick && onReplyClick(replyAuthor.username)}
                            className="feed-mini-action-btn"
                        >
                            Reply
                        </button>

                        {isReplyOwner && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="feed-mini-action-btn"
                                >
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="feed-mini-action-btn danger"
                                >
                                    Delete
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Modal Confirmation */}
            {showDeleteConfirm && (
                <div className="mini-delete-confirm-popup">
                    <p>Delete this reply?</p>
                    <div className="mini-delete-actions">
                        <button type="button" onClick={() => setShowDeleteConfirm(false)} className="btn-cancel">
                            Cancel
                        </button>
                        <button type="button" onClick={handleDelete} className="btn-delete">
                            Delete
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ==========================================================================
   Comment Item Component
   ========================================================================== */
const CommentItem = ({ comment, postId, currentUserId, currentUserProfilePic, onCommentsUpdate }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState(comment.content || "");
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [isSubmittingReply, setIsSubmittingReply] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const replyInputRef = useRef(null);
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
        e?.preventDefault();
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
        e?.preventDefault();
        if (!replyText.trim() || isSubmittingReply) return;
        setIsSubmittingReply(true);
        try {
            const data = await postApi.createReply(postId, comment._id, replyText);
            onCommentsUpdate(data.comments || []);
            setReplyText("");
        } catch (err) {
            console.error("Failed to post reply", err);
        } finally {
            setIsSubmittingReply(false);
        }
    };

    const handleNestedReplyClick = (targetUsername) => {
        setShowReplyForm(true);
        if (targetUsername) {
            setReplyText(`@${targetUsername} `);
        }
        setTimeout(() => replyInputRef.current?.focus(), 50);
    };

    return (
        <div className="feed-comment-item-wrapper">
            <div className="feed-comment-item">
                <Link to={`/users/${commentAuthor.username || ""}`}>
                    <img
                        src={commentAuthor.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                        alt={commentAuthor.name || "User"}
                        className="feed-comment-avatar"
                        onError={(e) => {
                            e.currentTarget.src = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
                        }}
                    />
                </Link>

                <div className="feed-comment-main">
                    <div className="feed-comment-bubble">
                        <div className="feed-comment-header">
                            <div className="feed-comment-author-col">
                                <Link to={`/users/${commentAuthor.username || ""}`} className="feed-comment-author-name">
                                    {commentAuthor.name}
                                </Link>
                                {commentAuthor.username && (
                                    <span className="feed-comment-author-handle">@{commentAuthor.username}</span>
                                )}
                            </div>
                            <span className="feed-comment-time">{timeAgo(comment.createdAt)}</span>
                        </div>

                        {isEditing ? (
                            <form onSubmit={handleEditSubmit} className="feed-comment-edit-form">
                                <textarea
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    className="feed-comment-edit-input"
                                    required
                                />
                                <div className="feed-comment-edit-actions">
                                    <button type="button" onClick={() => { setIsEditing(false); setEditText(comment.content); }} className="btn btn-secondary btn-sm">
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary btn-sm">
                                        Save
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="feed-comment-content-text">
                                {comment.content}
                            </div>
                        )}
                    </div>

                    {/* Actions Bar */}
                    <div className="feed-comment-actions-row">
                        <button
                            type="button"
                            onClick={handleLike}
                            className={`feed-mini-action-btn ${isCommentLiked ? "active" : ""}`}
                        >
                            👍 {likes.length > 0 && <span>{likes.length}</span>}
                        </button>

                        <button
                            type="button"
                            onClick={() => {
                                setShowReplyForm(!showReplyForm);
                                setTimeout(() => replyInputRef.current?.focus(), 50);
                            }}
                            className="feed-mini-action-btn"
                        >
                            Reply {replies.length > 0 && `(${replies.length})`}
                        </button>

                        {isCommentOwner && (
                            <>
                                <button
                                    type="button"
                                    onClick={() => setIsEditing(true)}
                                    className="feed-mini-action-btn"
                                >
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="feed-mini-action-btn danger"
                                >
                                    Delete
                                </button>
                            </>
                        )}
                    </div>

                    {/* Replies Form & List */}
                    {showReplyForm && (
                        <div className="feed-replies-drawer">
                            {/* Reply Input Form */}
                            <form onSubmit={handleReplySubmit} className="feed-reply-input-bar">
                                <img
                                    src={currentUserProfilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                                    alt="Me"
                                    className="feed-reply-input-avatar"
                                />
                                <input
                                    ref={replyInputRef}
                                    type="text"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Write a reply..."
                                    className="feed-reply-input-field"
                                    disabled={isSubmittingReply}
                                />
                                <button
                                    type="submit"
                                    className="btn-reply-send"
                                    disabled={!replyText.trim() || isSubmittingReply}
                                >
                                    Reply
                                </button>
                            </form>

                            {/* Replies List */}
                            {replies.length > 0 && (
                                <div className="feed-replies-tree">
                                    {replies.map((reply) => (
                                        <ReplyItem
                                            key={reply._id}
                                            reply={reply}
                                            postId={postId}
                                            commentId={comment._id}
                                            currentUserId={currentUserId}
                                            onCommentsUpdate={onCommentsUpdate}
                                            onReplyClick={handleNestedReplyClick}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Modal Confirmation */}
            {showDeleteConfirm && (
                <div className="mini-delete-confirm-popup">
                    <p>Delete this comment?</p>
                    <div className="mini-delete-actions">
                        <button type="button" onClick={() => setShowDeleteConfirm(false)} className="btn-cancel">
                            Cancel
                        </button>
                        <button type="button" onClick={handleDelete} className="btn-delete">
                            Delete
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

/* ==========================================================================
   Main PostCard Component
   ========================================================================== */
const PostCard = ({ post, onDelete, onUpdate, onSaveToggle }) => {
    const { user } = useAuth();
    const [likes, setLikes] = useState(post.likes || []);
    const [comments, setComments] = useState(post.comments || []);
    const [showComments, setShowComments] = useState(false);
    const [newCommentText, setNewCommentText] = useState("");
    const [isSubmittingComment, setIsSubmittingComment] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.content || "");
    const [editImage, setEditImage] = useState(post.image || "");
    const [showImageInput, setShowImageInput] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [showLightbox, setShowLightbox] = useState(false);

    const { author = {}, content, image, createdAt } = post;
    const isOwner = user && user._id === author._id;
    const isLiked = user && likes.includes(user._id);

    useEffect(() => {
        try {
            const saved = localStorage.getItem("savedPosts");
            if (saved) {
                const parsed = JSON.parse(saved);
                setIsSaved(parsed.includes(post._id));
            }
        } catch (e) {
            console.error(e);
        }
    }, [post._id]);

    const handleLike = async () => {
        try {
            const updated = await postApi.likePost(post._id);
            if (updated && updated.likes) {
                setLikes(updated.likes);
                if (onUpdate) onUpdate(updated);
            }
        } catch (err) {
            console.error("Failed to like post", err);
        }
    };

    const handleCommentSubmit = async (e) => {
        e?.preventDefault();
        if (!newCommentText.trim() || isSubmittingComment) return;
        setIsSubmittingComment(true);
        try {
            const updated = await postApi.createComment(post._id, newCommentText);
            if (updated && updated.comments) {
                setComments(updated.comments);
                setNewCommentText("");
                if (onUpdate) onUpdate(updated);
            }
        } catch (err) {
            console.error("Failed to create comment", err);
        } finally {
            setIsSubmittingComment(false);
        }
    };

    const handleEditSubmit = async (e) => {
        e?.preventDefault();
        if (!editContent.trim() || isSaving) return;
        setIsSaving(true);
        try {
            const payload = { content: editContent.trim(), image: editImage.trim() };
            const updated = await postApi.editPost(post._id, payload);
            if (updated) {
                if (onUpdate) onUpdate(updated);
                setIsEditing(false);
            }
        } catch (err) {
            console.error("Failed to edit post", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        try {
            await postApi.deletePost(post._id);
            if (onDelete) onDelete(post._id);
            setShowDeleteConfirm(false);
        } catch (err) {
            console.error("Failed to delete post", err);
        }
    };

    const handleShare = () => {
        const shareUrl = `${window.location.origin}/feed#post-${post._id}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
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
        if (!content) return null;
        const maxLength = 220;
        if (content.length <= maxLength || isExpanded) {
            return (
                <div className="feed-post-text-body">
                    {content}
                </div>
            );
        }
        return (
            <div className="feed-post-text-body">
                {content.substring(0, maxLength)}...{" "}
                <button
                    type="button"
                    onClick={() => setIsExpanded(true)}
                    className="feed-post-read-more"
                >
                    see more
                </button>
            </div>
        );
    };

    return (
        <article className="feed-post-card-container" id={`post-${post._id}`}>
            {/* Header: Author + Meta + Options Menu */}
            <div className="feed-post-header-row">
                <div className="feed-post-author-group">
                    <Link to={`/users/${author.username || ""}`}>
                        <img
                            src={author.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                            alt={author.name || "User"}
                            className="feed-post-author-avatar"
                            onError={(e) => {
                                e.currentTarget.src = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
                            }}
                        />
                    </Link>

                    <div className="feed-post-author-details">
                        <div className="feed-post-name-row">
                            <Link to={`/users/${author.username || ""}`} className="feed-post-author-name">
                                {author.name}
                            </Link>
                            <span className="profile-verified-badge" style={{ padding: "2px" }}>
                                <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                </svg>
                            </span>
                            {author.additionalName && (
                                <span className="feed-post-author-additional">({author.additionalName})</span>
                            )}
                        </div>

                        <div className="feed-post-meta-sub">
                            <span className="feed-post-handle">@{author.username}</span>
                            <span className="feed-post-dot">•</span>
                            <span className="feed-post-time">{timeAgo(createdAt)}</span>
                            <span className="feed-post-dot">•</span>
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" title="Public">
                                <circle cx="12" cy="12" r="10" />
                                <line x1="2" y1="12" x2="22" y2="12" />
                                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Post Options Menu */}
                {isOwner && (
                    <div className="feed-post-menu-wrapper">
                        <button
                            type="button"
                            className="feed-post-menu-btn"
                            onClick={() => setShowMenu(!showMenu)}
                            title="Post options"
                        >
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="1" />
                                <circle cx="19" cy="12" r="1" />
                                <circle cx="5" cy="12" r="1" />
                            </svg>
                        </button>

                        {showMenu && (
                            <>
                                <div className="feed-menu-backdrop" onClick={() => setShowMenu(false)} />
                                <div className="feed-post-dropdown-menu">
                                    <button
                                        type="button"
                                        className="feed-dropdown-item"
                                        onClick={() => {
                                            setEditContent(content);
                                            setEditImage(image || "");
                                            setShowImageInput(Boolean(image));
                                            setIsEditing(true);
                                            setShowMenu(false);
                                        }}
                                    >
                                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                        </svg>
                                        <span>Edit post</span>
                                    </button>

                                    <button
                                        type="button"
                                        className="feed-dropdown-item danger"
                                        onClick={() => {
                                            setShowDeleteConfirm(true);
                                            setShowMenu(false);
                                        }}
                                    >
                                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polyline points="3 6 5 6 21 6" />
                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                        </svg>
                                        <span>Delete post</span>
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Post Content */}
            <div className="feed-post-content-area">
                {renderContent()}

                {image && typeof image === "string" && image.trim() !== "" && !imageError && (
                    <div
                        className="feed-post-media-frame"
                        onClick={() => setShowLightbox(true)}
                        title="Click to view full image"
                    >
                        <img
                            src={image.trim()}
                            alt="Post attachment"
                            onError={() => setImageError(true)}
                            className="feed-post-media-img"
                        />
                    </div>
                )}
            </div>

            {/* Reactions & Engagement Summary Stats Bar */}
            <div className="feed-post-stats-row">
                <div className="feed-post-stats-likes">
                    {likes.length > 0 && (
                        <div className="reactions-bubble-icons">
                            <span className="reaction-bubble thumb" title="Likes">👍</span>
                            <span className="reaction-count-text">{likes.length}</span>
                        </div>
                    )}
                </div>

                <div className="feed-post-stats-meta">
                    {comments.length > 0 && (
                        <span
                            className="feed-post-stats-comments-trigger"
                            onClick={() => setShowComments(!showComments)}
                        >
                            {comments.length} {comments.length === 1 ? "comment" : "comments"}
                        </span>
                    )}
                </div>
            </div>

            {/* Action Buttons Bar */}
            <div className="feed-post-actions-panel">
                <button
                    type="button"
                    onClick={handleLike}
                    className={`feed-action-button like ${isLiked ? "active" : ""}`}
                >
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill={isLiked ? "currentColor" : "none"} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                    </svg>
                    <span>Like</span>
                </button>

                <button
                    type="button"
                    onClick={() => setShowComments(!showComments)}
                    className={`feed-action-button comment ${showComments ? "active" : ""}`}
                >
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                    <span>Comment</span>
                </button>

                <button
                    type="button"
                    onClick={handleSave}
                    className={`feed-action-button save ${isSaved ? "active" : ""}`}
                    title={isSaved ? "Remove from saved" : "Save post"}
                >
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill={isSaved ? "currentColor" : "none"} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                    <span>{isSaved ? "Saved" : "Save"}</span>
                </button>

                <button
                    type="button"
                    onClick={handleShare}
                    className="feed-action-button share"
                    title="Copy share link"
                >
                    <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="18" cy="5" r="3" />
                        <circle cx="6" cy="12" r="3" />
                        <circle cx="18" cy="19" r="3" />
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                    </svg>
                    <span>{copied ? "Copied!" : "Share"}</span>
                </button>
            </div>

            {/* Comments Drawer */}
            {showComments && (
                <div className="feed-comments-container">
                    {/* Add Comment Field */}
                    <form onSubmit={handleCommentSubmit} className="feed-comment-composer">
                        <img
                            src={user?.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                            alt="Me"
                            className="feed-comment-user-avatar"
                        />
                        <div className="feed-comment-input-wrap">
                            <input
                                type="text"
                                value={newCommentText}
                                onChange={(e) => setNewCommentText(e.target.value)}
                                placeholder="Add a comment or thought..."
                                className="feed-comment-input"
                                disabled={isSubmittingComment}
                            />
                            <button
                                type="submit"
                                className="btn-comment-publish"
                                disabled={!newCommentText.trim() || isSubmittingComment}
                            >
                                {isSubmittingComment ? "..." : "Send"}
                            </button>
                        </div>
                    </form>

                    {/* Comments List */}
                    {comments.length > 0 ? (
                        <div className="feed-comments-stream">
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
                    ) : (
                        <p className="feed-no-comments-msg">No comments yet. Start the conversation!</p>
                    )}
                </div>
            )}

            {/* Edit Post Modal */}
            {isEditing && (
                <div className="modal-overlay" onClick={() => setIsEditing(false)} style={{ zIndex: 3200 }}>
                    <div className="modal-box feed-composer-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-row">
                            <div className="modal-header-title-group">
                                <img
                                    src={author?.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                                    alt="User"
                                    className="post-modal-user-avatar"
                                />
                                <div>
                                    <span className="post-modal-author-name">{author?.name}</span>
                                    <span className="post-modal-visibility-tag">Edit post</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="crop-modal-close-btn"
                                onClick={() => setIsEditing(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="feed-modal-form">
                            <textarea
                                className="feed-modal-textarea"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                placeholder="Edit your post content..."
                                rows={5}
                                required
                            />

                            {showImageInput && (
                                <div className="feed-modal-image-field">
                                    <input
                                        type="url"
                                        className="feed-modal-image-input"
                                        value={editImage}
                                        onChange={(e) => setEditImage(e.target.value)}
                                        placeholder="Paste image link URL..."
                                    />
                                    {editImage.trim() && (
                                        <div className="feed-modal-img-preview-box">
                                            <img
                                                src={editImage.trim()}
                                                alt="Preview"
                                                onError={(e) => { e.currentTarget.parentElement.style.display = "none"; }}
                                            />
                                            <button
                                                type="button"
                                                className="feed-preview-remove-btn"
                                                onClick={() => setEditImage("")}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="feed-modal-bottom-bar">
                                <div className="feed-modal-tools">
                                    <button
                                        type="button"
                                        className={`feed-tool-icon-btn ${showImageInput ? "active" : ""}`}
                                        onClick={() => setShowImageInput(!showImageInput)}
                                        title="Attach image"
                                    >
                                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                            <circle cx="8.5" cy="8.5" r="1.5" />
                                            <polyline points="21 15 16 10 5 21" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="feed-modal-submit-group">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setIsEditing(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={!editContent.trim() || isSaving}
                                    >
                                        {isSaving ? "Saving..." : "Save Changes"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Post Modal Confirmation */}
            {showDeleteConfirm && (
                <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)} style={{ zIndex: 3200 }}>
                    <div className="modal-box delete-confirm-modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-icon-badge" style={{ background: "rgba(239, 68, 68, 0.15)", color: "#f87171" }}>
                            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                        </div>
                        <h3>Delete this post?</h3>
                        <p>This action cannot be undone. Your post and its comments will be permanently removed.</p>
                        <div className="delete-confirm-actions">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={() => setShowDeleteConfirm(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={handleDelete}
                            >
                                Delete Post
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Lightbox Modal */}
            {showLightbox && image && (
                <div className="lightbox-modal-overlay" onClick={() => setShowLightbox(false)} style={{ zIndex: 4000 }}>
                    <div className="lightbox-content-box" onClick={(e) => e.stopPropagation()}>
                        <button
                            type="button"
                            className="lightbox-close-btn"
                            onClick={() => setShowLightbox(false)}
                        >
                            ✕
                        </button>
                        <img src={image.trim()} alt="Full size" className="lightbox-full-img" />
                    </div>
                </div>
            )}
        </article>
    );
};

export default PostCard;
