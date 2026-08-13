import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { postApi, userApi } from "../services/api";
import PostCard from "../components/PostCard";

const Feed_Page = () => {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newPostContent, setNewPostContent] = useState("");
    const [newPostImage, setNewPostImage] = useState("");
    const [showImageInput, setShowImageInput] = useState(false);
    const [isPosting, setIsPosting] = useState(false);
    const [pendingPost, setPendingPost] = useState(null);
    const [appliedJobs, setAppliedJobs] = useState({});
    const [stats, setStats] = useState({ connectionCount: 0, viewsCount: 0 });

    const [showConnectionsModal, setShowConnectionsModal] = useState(false);
    const [connectionsList, setConnectionsList] = useState([]);
    const [isFetchingConnections, setIsFetchingConnections] = useState(false);

    const [showViewersModal, setShowViewersModal] = useState(false);
    const [viewersList, setViewersList] = useState([]);
    const [isFetchingViewers, setIsFetchingViewers] = useState(false);

    const recommendedJobs = [
        { id: "j1", title: "Software Engineer Intern", company: "Google", location: "Mountain View, CA (Hybrid)", logoBg: "#ea4335", initials: "G" },
        { id: "j2", title: "Frontend Developer", company: "Waverly Labs", location: "New York, NY (Remote)", logoBg: "#1d9bf0", initials: "W" },
        { id: "j3", title: "UI/UX Designer", company: "Figma", location: "San Francisco, CA (Hybrid)", logoBg: "#a259ff", initials: "F" }
    ];

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const fetched = await postApi.getPosts();
                setPosts(fetched || []);
            } catch (err) {
                console.error("Failed to fetch posts", err);
            } finally {
                setIsLoading(false);
            }
        };
        const fetchStats = async () => {
            try {
                const data = await userApi.getConnectionStats();
                setStats(data || { connectionCount: 0, viewsCount: 0 });
            } catch (err) {
                console.error("Failed to fetch connection stats", err);
            }
        };
        fetchPosts();
        fetchStats();
    }, []);

    const handleCreatePostSubmit = async (e) => {
        e.preventDefault();
        if (!newPostContent.trim() || isPosting) return;

        const content = newPostContent.trim();
        const image = newPostImage.trim() || "";

        // Optimistically set the pending post and close the modal
        setPendingPost({ content, image });
        setIsPosting(true);
        setIsModalOpen(false);

        // Reset inputs
        setNewPostContent("");
        setNewPostImage("");
        setShowImageInput(false);

        try {
            const payload = { content };
            if (image) {
                payload.image = image;
            }
            const data = await postApi.createPost(payload);
            if (data && data.post) {
                setPosts((prevPosts) => [data.post, ...prevPosts]);
            }
        } catch (err) {
            console.error("Failed to create post", err);
            alert("Failed to create post. Please try again.");
            // Restore inputs and reopen modal
            setNewPostContent(content);
            setNewPostImage(image);
            if (image) setShowImageInput(true);
            setIsModalOpen(true);
        } finally {
            setPendingPost(null);
            setIsPosting(false);
        }
    };

    const handleOpenModal = (toggledImage = false) => {
        setIsModalOpen(true);
        if (toggledImage) {
            setShowImageInput(true);
        }
    };

    const handleOpenConnections = async () => {
        setShowConnectionsModal(true);
        setIsFetchingConnections(true);
        try {
            if (user?.username) {
                const data = await userApi.getUserConnections(user.username);
                setConnectionsList(data || []);
            }
        } catch (err) {
            console.error("Failed to fetch connections", err);
        } finally {
            setIsFetchingConnections(false);
        }
    };

    const handleOpenViewers = async () => {
        setShowViewersModal(true);
        setIsFetchingViewers(true);
        try {
            const data = await userApi.getRecommendedUsers();
            const list = (data || []).map((u, i) => ({
                ...u,
                viewTime: `${i * 2 + 1}h ago`,
                viewCount: Math.floor(Math.random() * 3) + 1
            }));
            setViewersList(list);
        } catch (err) {
            console.error("Failed to fetch profile viewers", err);
        } finally {
            setIsFetchingViewers(false);
        }
    };

    // Sort posts dynamically on presentation
    const getSortedPosts = () => {
        const postsCopy = [...posts];
        return postsCopy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', background: '#0f1419' }}>
                <div className="spinner" />
            </div>
        );
    }

    const sortedPosts = getSortedPosts();

    return (
        <div className="feed-page" style={{ background: "#0f1419", minHeight: "100vh" }}>
            <div className="feed-grid">

                {/* Left Sidebar Profile Summary Card */}
                <div className="feed-left-sidebar">
                    <Link to="/profile" className="feed-profile-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="feed-profile-banner" />
                        <div className="feed-profile-avatar-container">
                            <img
                                src={user?.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                                alt={user?.name || "Avatar"}
                                className="feed-profile-avatar"
                            />
                        </div>
                        <div className="feed-profile-info" style={{ borderBottom: 'none' }}>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem', flexWrap: 'wrap', width: '100%' }}>
                                <span className="feed-profile-name">{user?.name}</span>
                                {user?.additionalName && (
                                    <span style={{ fontSize: '0.85rem', color: '#71767b', fontWeight: '600' }}>
                                        ({user.additionalName})
                                    </span>
                                )}
                            </div>
                            <span className="feed-profile-handle" style={{ marginTop: '0.1rem' }}>@{user?.username}</span>
                            {user?.bio && (
                                <p className="feed-profile-bio-clamp" style={{ margin: '0.35rem 0 0 0' }}>
                                    {user.bio}
                                </p>
                            )}
                            {user?.collegeName && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', width: '100%' }}>
                                    <svg viewBox="0 0 24 24" fill="#fff" width="16" height="16" aria-hidden="true" style={{ flexShrink: 0 }}>
                                        <path d="M22 7.24L12 3.3 2 7.24l10 3.93L22 7.24zM2.5 12h1v4h-1v-4zm15.5 0h1v4h-1v-4zM12 18.25L4.5 15.3v-4.06l7.5 2.95 7.5-2.95v4.06l-7.5 2.95z" />
                                    </svg>
                                    <span style={{ fontSize: '0.72rem', color: '#fff', fontWeight: '500', wordBreak: 'break-word' }}>
                                        {user.collegeName}
                                    </span>
                                </div>
                            )}
                            {user?.companyName && !user?.collegeName && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', width: '100%' }}>
                                    <svg viewBox="0 0 24 24" fill="#fff" width="16" height="16" aria-hidden="true" style={{ flexShrink: 0 }}>
                                        <path d="M3 21h18v-2H3v2zM3 8v8h4V8H3zm6 0v8h4V8H9zm6 0v8h4V8h-4zM3 3v4h18V3H3z" />
                                    </svg>
                                    <span style={{ fontSize: '0.72rem', color: '#fff', fontWeight: '500', wordBreak: 'break-word' }}>
                                        {user.companyName}
                                    </span>
                                </div>
                            )}
                        </div>
                    </Link>

                    <div className="feed-profile-card" style={{ marginTop: '0.5rem' }}>
                        <div className="feed-profile-stats">
                            <div className="feed-profile-stat-row" onClick={handleOpenConnections}>
                                <span className="feed-profile-stat-label" style={{ fontWeight: 'bold' }}>Connections</span>
                                <span className="feed-profile-stat-value" style={{ fontWeight: 'bold' }}>{stats.connectionCount}</span>
                            </div>
                            <div className="feed-profile-stat-row" onClick={handleOpenViewers}>
                                <span className="feed-profile-stat-label" style={{ fontWeight: 'bold' }}>Profile Viewers</span>
                                <span className="feed-profile-stat-value" style={{ fontWeight: 'bold' }}>{stats.viewsCount}</span>
                            </div>
                        </div>
                    </div>

                    <div className="feed-profile-card" style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column' }}>
                        <Link to="/saved" className="feed-profile-my-items" style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #2f3336', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                            </svg>
                            My Saved Posts
                        </Link>
                        <Link to="/liked" className="feed-profile-my-items" style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #2f3336', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
                            </svg>
                            Liked Posts
                        </Link>
                        <Link to="/commented" className="feed-profile-my-items" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                            </svg>
                            My Comments
                        </Link>
                    </div>
                </div>

                {/* Middle Feed Column */}
                <div className="feed-middle">

                    {/* Create Post Header Card */}
                    <div className="create-post-card">
                        <div className="create-post-top">
                            <img
                                src={user?.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                                alt="Me"
                                className="create-post-avatar"
                            />
                            <button className="create-post-trigger-btn" onClick={() => handleOpenModal(false)}>
                                Start a post
                            </button>
                        </div>
                        <div className="create-post-options">
                            <button className="create-post-opt-btn photo" onClick={() => handleOpenModal(true)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                    <polyline points="21 15 16 10 5 21"></polyline>
                                </svg>
                                <span>Photo</span>
                            </button>
                            <button className="create-post-opt-btn video" onClick={() => handleOpenModal(false)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polygon points="23 7 16 12 23 17 23 7"></polygon>
                                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                                </svg>
                                <span>Video</span>
                            </button>
                            <button className="create-post-opt-btn event" onClick={() => handleOpenModal(false)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                    <line x1="16" y1="2" x2="16" y2="6"></line>
                                    <line x1="8" y1="2" x2="8" y2="6"></line>
                                    <line x1="3" y1="10" x2="21" y2="10"></line>
                                </svg>
                                <span>Event</span>
                            </button>
                            <button className="create-post-opt-btn article" onClick={() => handleOpenModal(false)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                    <polyline points="14 2 14 8 20 8"></polyline>
                                    <line x1="16" y1="13" x2="8" y2="13"></line>
                                    <line x1="16" y1="17" x2="8" y2="17"></line>
                                    <polyline points="10 9 9 9 8 9"></polyline>
                                </svg>
                                <span>Write article</span>
                            </button>
                        </div>
                    </div>


                    {/* Posts Feed */}
                    {isLoading ? (
                        <div className="page-center" style={{ padding: "3rem 0" }}>
                            <div className="spinner" />
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {/* Render Pending Post Card */}
                            {pendingPost && (
                                <div className="pending-post-card" style={{
                                    background: "#16181c",
                                    border: "1px solid #2f3336",
                                    borderRadius: "10px",
                                    padding: "1rem",
                                    opacity: 0.75,
                                    position: "relative",
                                    overflow: "hidden"
                                }}>
                                    {/* Top Progress Bar */}
                                    <div style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        height: "3px",
                                        background: "#1d9bf0",
                                        width: "100%",
                                        animation: "postingProgress 1.5s infinite linear"
                                    }} />

                                    <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "0.75rem" }}>
                                        <img
                                            src={user?.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                                            alt="Me"
                                            style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }}
                                        />
                                        <div>
                                            <div style={{ fontWeight: "700", color: "#e7e9ea", fontSize: "0.9rem" }}>{user?.name}</div>
                                            <div style={{ fontSize: "0.75rem", color: "#71767b" }}>Posting...</div>
                                        </div>
                                    </div>

                                    <div style={{ fontSize: "0.95rem", color: "#e7e9ea", lineHeight: "1.5", whiteSpace: "pre-wrap" }}>
                                        {pendingPost.content}
                                    </div>

                                    {pendingPost.image && (
                                        <div style={{ marginTop: "0.75rem", borderRadius: "8px", overflow: "hidden", border: "1px solid #2f3336" }}>
                                            <img src={pendingPost.image} alt="Preview" style={{ width: "100%", maxHeight: "300px", objectFit: "cover" }} />
                                        </div>
                                    )}
                                </div>
                            )}

                            {sortedPosts.length > 0 ? (
                                sortedPosts.map((post) => (
                                    <PostCard
                                        key={post._id}
                                        post={post}
                                        onDelete={(id) => setPosts(posts.filter((p) => p._id !== id))}
                                    />
                                ))
                            ) : !pendingPost ? (
                                <div style={{ background: "#16181c", border: "1px solid #2f3336", borderRadius: "10px", padding: "3rem 1rem", textAlign: "center", color: "#71767b" }}>
                                    <h3 style={{ margin: "0 0 0.5rem 0", color: "#e7e9ea" }}>No posts in the feed yet</h3>
                                    <p style={{ margin: 0 }}>Be the first to share something with the campus!</p>
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>

                {/* Right Sidebar Widgets */}
                <div className="feed-right-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>

                    {/* Recommended Jobs */}
                    <div className="widget-card">
                        <h3 className="widget-title">Recommended Jobs</h3>
                        <div className="widget-list" style={{ marginTop: '0.25rem' }}>
                            {recommendedJobs.map(job => (
                                <div key={job.id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', paddingBottom: '0.5rem', borderBottom: '1px solid #2f3336' }}>
                                    <div style={{
                                        width: '32px',
                                        height: '32px',
                                        background: job.logoBg,
                                        borderRadius: '6px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontWeight: '700',
                                        color: '#fff',
                                        fontSize: '0.85rem',
                                        flexShrink: 0
                                    }}>
                                        {job.initials}
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0 }}>
                                        <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#e7e9ea', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {job.title}
                                        </span>
                                        <span style={{ fontSize: '0.68rem', color: '#71767b', margin: '0.1rem 0 0.35rem 0' }}>
                                            {job.company} • {job.location}
                                        </span>
                                        <button
                                            onClick={() => setAppliedJobs(prev => ({ ...prev, [job.id]: !prev[job.id] }))}
                                            style={{
                                                background: appliedJobs[job.id] ? 'rgba(29, 155, 240, 0.1)' : '#1d9bf0',
                                                border: 'none',
                                                color: appliedJobs[job.id] ? '#1d9bf0' : '#fff',
                                                borderRadius: '20px',
                                                padding: '0.2rem 0.75rem',
                                                fontSize: '0.68rem',
                                                fontWeight: '700',
                                                cursor: 'pointer',
                                                width: 'fit-content'
                                            }}
                                        >
                                            {appliedJobs[job.id] ? "Applied" : "Easy Apply"}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ marginTop: '1rem', padding: '0 0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem 0.8rem', justifyContent: 'center' }}>
                        <a href="#" style={{ color: '#71767b', fontSize: '0.7rem' }} onClick={e => e.preventDefault()}>About</a>
                        <a href="#" style={{ color: '#71767b', fontSize: '0.7rem' }} onClick={e => e.preventDefault()}>Accessibility</a>
                        <a href="#" style={{ color: '#71767b', fontSize: '0.7rem' }} onClick={e => e.preventDefault()}>Help Center</a>
                        <a href="#" style={{ color: '#71767b', fontSize: '0.7rem' }} onClick={e => e.preventDefault()}>Privacy & Terms</a>
                        <a href="#" style={{ color: '#71767b', fontSize: '0.7rem' }} onClick={e => e.preventDefault()}>Ad Choices</a>
                        <a href="#" style={{ color: '#71767b', fontSize: '0.7rem' }} onClick={e => e.preventDefault()}>Advertising</a>
                        <a href="#" style={{ color: '#71767b', fontSize: '0.7rem' }} onClick={e => e.preventDefault()}>Business Services</a>

                        <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', marginTop: '0.5rem', color: '#71767b', fontSize: '0.7rem', fontWeight: '500' }}>
                            <span>Waverly Corporation © 2026</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Create Post Modal Overlay */}
            {isModalOpen && (
                <div className="post-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="post-modal-container" onClick={(e) => e.stopPropagation()}>

                        <div className="post-modal-header">
                            <h2>Create a post</h2>
                            <button className="post-modal-close-btn" onClick={() => setIsModalOpen(false)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        <div className="post-modal-user-info">
                            <img
                                src={user?.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                                alt="User"
                                className="post-modal-avatar"
                            />
                            <div className="post-modal-user-details">
                                <span className="post-modal-name">{user?.name}</span>
                                <div className="post-modal-dropdown">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <line x1="2" y1="12" x2="22" y2="12"></line>
                                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                                    </svg>
                                    <span>Anyone</span>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleCreatePostSubmit} className="post-modal-body">
                            <textarea
                                className="post-modal-textarea"
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                placeholder="What do you want to talk about?"
                                required
                            />

                            {showImageInput && (
                                <div className="post-modal-image-input-wrapper">
                                    <input
                                        type="url"
                                        className="post-modal-image-input"
                                        value={newPostImage}
                                        onChange={(e) => setNewPostImage(e.target.value)}
                                        placeholder="Paste image URL here..."
                                    />
                                    {newPostImage.trim() && (
                                        <div className="post-modal-image-preview-container">
                                            <img
                                                src={newPostImage.trim()}
                                                alt="Preview"
                                                className="post-modal-image-preview"
                                                onError={(e) => {
                                                    e.target.style.display = "none";
                                                }}
                                            />
                                            <button
                                                type="button"
                                                className="post-modal-image-remove"
                                                onClick={() => setNewPostImage("")}
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="post-modal-footer" style={{ padding: "1rem 0" }}>
                                <div className="post-modal-media-actions">
                                    <button
                                        type="button"
                                        className={`post-modal-action-icon ${showImageInput ? 'active' : ''}`}
                                        onClick={() => setShowImageInput(!showImageInput)}
                                        title="Add a photo"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                            <polyline points="21 15 16 10 5 21"></polyline>
                                        </svg>
                                    </button>
                                </div>
                                <button
                                    type="submit"
                                    className="btn-post-modal-submit"
                                    disabled={!newPostContent.trim() || isPosting}
                                >
                                    {isPosting ? "Posting..." : "Post"}
                                </button>
                            </div>
                        </form>

                    </div>
                </div>
            )}

            {/* Connections Modal Overlay */}
            {showConnectionsModal && (
                <div className="post-modal-overlay" onClick={() => setShowConnectionsModal(false)}>
                    <div className="post-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
                        <div className="post-modal-header">
                            <h2>My Connections</h2>
                            <button className="post-modal-close-btn" onClick={() => setShowConnectionsModal(false)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <div style={{ padding: '1rem', maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {isFetchingConnections ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
                                    <div className="spinner" />
                                </div>
                            ) : connectionsList.length === 0 ? (
                                <div style={{ textAlign: 'center', color: '#71767b', padding: '2rem 0' }}>
                                    No connections found.
                                </div>
                            ) : (
                                connectionsList.map(member => (
                                    <div key={member._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid #2f3336' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                                            <img
                                                src={member.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                                                alt={member.name}
                                                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                                            />
                                            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                                <Link
                                                    to={`/users/${member.username}`}
                                                    onClick={() => setShowConnectionsModal(false)}
                                                    style={{ textDecoration: 'none', fontWeight: 'bold', color: '#fff', fontSize: '0.88rem', wordBreak: 'break-word' }}
                                                >
                                                    {member.name}
                                                </Link>
                                                <div style={{ fontSize: '0.72rem', color: '#71767b', marginTop: '0.15rem', wordBreak: 'break-word', whiteSpace: 'normal' }}>
                                                    {member.bio || `@${member.username}`}
                                                </div>
                                            </div>
                                        </div>
                                        <Link
                                            to={`/users/${member.username}`}
                                            onClick={() => setShowConnectionsModal(false)}
                                            style={{
                                                textDecoration: 'none', background: '#1d9bf0', border: 'none',
                                                color: '#fff', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', whiteSpace: 'nowrap'
                                            }}
                                        >
                                            View Profile
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Profile Viewers Modal Overlay */}
            {showViewersModal && (
                <div className="post-modal-overlay" onClick={() => setShowViewersModal(false)}>
                    <div className="post-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
                        <div className="post-modal-header">
                            <h2>Profile Viewers</h2>
                            <button className="post-modal-close-btn" onClick={() => setShowViewersModal(false)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <div style={{ padding: '1rem', maxHeight: '400px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {isFetchingViewers ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
                                    <div className="spinner" />
                                </div>
                            ) : viewersList.length === 0 ? (
                                <div style={{ textAlign: 'center', color: '#71767b', padding: '2rem 0' }}>
                                    No profile viewers found.
                                </div>
                            ) : (
                                viewersList.map(viewer => (
                                    <div key={viewer._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'space-between', paddingBottom: '0.75rem', borderBottom: '1px solid #2f3336' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                                            <img
                                                src={viewer.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                                                alt={viewer.name}
                                                style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                                            />
                                            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                                <Link
                                                    to={`/users/${viewer.username}`}
                                                    onClick={() => setShowViewersModal(false)}
                                                    style={{ textDecoration: 'none', fontWeight: 'bold', color: '#fff', fontSize: '0.88rem', wordBreak: 'break-word' }}
                                                >
                                                    {viewer.name}
                                                </Link>
                                                <div style={{ fontSize: '0.72rem', color: '#71767b', marginTop: '0.15rem', wordBreak: 'break-word', whiteSpace: 'normal' }}>
                                                    {viewer.bio || `@${viewer.username}`}
                                                </div>
                                                <div style={{ fontSize: '0.68rem', color: '#1d9bf0', marginTop: '0.2rem', fontWeight: '500' }}>
                                                    Viewed {viewer.viewTime}
                                                </div>
                                            </div>
                                        </div>
                                        <Link
                                            to={`/users/${viewer.username}`}
                                            onClick={() => setShowViewersModal(false)}
                                            style={{
                                                textDecoration: 'none', background: '#1d9bf0', border: 'none',
                                                color: '#fff', padding: '0.35rem 0.85rem', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600', whiteSpace: 'nowrap'
                                            }}
                                        >
                                            Connect
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Feed_Page;
