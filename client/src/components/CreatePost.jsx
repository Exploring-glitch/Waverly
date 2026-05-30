import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { postApi } from "../services/api";

const CreatePost = ({ autoFocus, onClose }) => {
    const { user } = useAuth();

    const [content, setContent] = useState("");
    const [image, setImage] = useState("");

    const [isPosting, setIsPosting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);

    const handleCloseClick = () => {
        if (content.trim() || image.trim()) {
            setShowConfirm(true);
        } else {
            if (onClose) onClose();
        }
    };

    const handleDiscard = () => {
        setContent("");
        setImage("");
        setShowConfirm(false);
        if (onClose) onClose();
    };

    const textareaRef = useRef(null);

    useEffect(() => {
        if (autoFocus && textareaRef.current) {
            textareaRef.current.focus();
        }
    }, [autoFocus]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!content.trim()) {
            setError("Post content cannot be empty.");
            return;
        }

        setIsPosting(true);

        try {
            await postApi.createPost({
                content: content,
                image: image.trim() ? image : undefined
            });

            setContent("");
            setImage("");
            setIsPosting(false);
            setSuccess("Post created successfully!");

            setTimeout(() => {
                setSuccess("");
            }, 3000);
        }
        catch (err) {
            setIsPosting(false);
            setError(err.message || "Failed to create post. Please try again.");
        }
    };

    return (
        <div className="create-post-card" style={{ position: 'relative' }}>
            {onClose && (
                <button
                    onClick={handleCloseClick}
                    style={{
                        position: 'absolute', top: '1rem', right: '1rem',
                        background: 'transparent', border: 'none', color: '#71767b',
                        cursor: 'pointer', zIndex: 5
                    }}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            )}

            {showConfirm && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '16px', zIndex: 10
                }}>
                    <div style={{
                        background: '#16181c', border: '1px solid #2f3336', borderRadius: '12px',
                        padding: '2rem', textAlign: 'center', maxWidth: '420px', width: '90%'
                    }}>
                        <h3 style={{ margin: '0 0 1.5rem', color: '#e7e9ea', fontSize: '1.2rem', fontWeight: '600' }}>Are you sure you want to discard post?</h3>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <button
                                className="btn btn-secondary"
                                style={{ padding: '0.5rem 1.25rem', fontSize: '0.95rem' }}
                                onClick={() => setShowConfirm(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn"
                                style={{
                                    padding: '0.5rem 1.25rem',
                                    fontSize: '0.95rem',
                                    background: 'transparent',
                                    color: '#fff',
                                    border: '1px solid #1d9bf0'
                                }}
                                onClick={handleDiscard}
                            >
                                Discard
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="create-post-layout">
                {/* User avatar next to the form */}
                <img
                    src={user?.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                    alt={user?.name || "User"}
                    className="create-post-avatar"
                />

                <form onSubmit={handleSubmit} className="create-post-form">
                    {error && <div className="form-error" style={{ marginBottom: "0.5rem" }}>{error}</div>}
                    {success && <div className="alert-box alert-success" style={{ marginBottom: "0.5rem", padding: "0.5rem 1rem" }}>{success}</div>}

                    <textarea
                        ref={textareaRef}
                        placeholder="What's happening on campus?"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        disabled={isPosting}
                        rows="3"
                        className="create-post-textarea"
                    />

                    <input
                        type="text"
                        placeholder="Image URL (optional)"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        disabled={isPosting}
                        className="create-post-input"
                    />

                    <div className="create-post-actions">
                        <button
                            type="submit"
                            className="btn btn-primary btn-post"
                            disabled={isPosting || !content.trim()}
                        >
                            {isPosting ? "Posting..." : "Post"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePost;
