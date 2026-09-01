import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { postApi, userApi } from "../services/api";
import PostCard from "../components/PostCard";
import Button from "../components/Button";

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
        { id: "j1", title: "Software Engineer Intern", company: "Google", location: "Mountain View, CA", type: "Hybrid", logoBg: "#ea4335", initials: "G" },
        { id: "j2", title: "Frontend Developer", company: "Waverly Labs", location: "New York, NY", type: "Remote", logoBg: "#0284c7", initials: "W" },
        { id: "j3", title: "UI/UX Designer", company: "Figma", location: "San Francisco, CA", type: "Hybrid", logoBg: "#a855f7", initials: "F" }
    ];

    const trendingTopics = [
        { tag: "CampusPlacements", count: "1.4k posts" },
        { tag: "WebDevelopment", count: "892 posts" },
        { tag: "OpenSource", count: "640 posts" },
        { tag: "AIandRobotics", count: "2.1k posts" },
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

        setPendingPost({ content, image });
        setIsPosting(true);
        setIsModalOpen(false);

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
            const data = await userApi.getProfileViewers();
            setViewersList(data?.viewers || []);
        } catch (err) {
            console.error("Failed to fetch profile viewers", err);
        } finally {
            setIsFetchingViewers(false);
        }
    };

    const handleApplyJob = (jobId) => {
        setAppliedJobs(prev => ({
            ...prev,
            [jobId]: !prev[jobId]
        }));
    };

    const handlePostDelete = (deletedPostId) => {
        setPosts((prevPosts) => prevPosts.filter((p) => p._id !== deletedPostId));
    };

    const handlePostUpdate = (updatedPost) => {
        setPosts((prevPosts) =>
            prevPosts.map((p) => (p._id === updatedPost._id ? updatedPost : p))
        );
    };

    const getSortedPosts = () => {
        const postsCopy = [...posts];
        return postsCopy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    };

    if (isLoading) {
        return (
            <div className="page-center" style={{ minHeight: "80vh" }}>
                <div className="spinner" />
            </div>
        );
    }

    const sortedPosts = getSortedPosts();

    return (
        <div className="feed-page-wrapper">
            <div className="feed-grid-layout">

                <aside className="feed-left-col">

                    <div className="feed-profile-mini-card">
                        <div className="feed-mini-banner">
                            {user?.coverPic ? (
                                <img src={user.coverPic} alt="" className="feed-mini-banner-img" />
                            ) : (
                                <div className="feed-mini-banner-glow" />
                            )}
                        </div>

                        <div className="feed-mini-avatar-wrap">
                            <Link to="/profile">
                                <img
                                    src={user?.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                                    alt={user?.name || "Avatar"}
                                    className="feed-mini-avatar"
                                />
                            </Link>
                        </div>

                        <div className="feed-mini-body">
                            <Link to="/profile" className="feed-mini-name">
                                <span>{user?.name}</span>
                                <span className="profile-verified-badge" style={{ padding: "2px" }} title="Verified">
                                    <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                    </svg>
                                </span>
                            </Link>
                            <span className="feed-mini-handle">@{user?.username}</span>

                            {user?.bio && (
                                <p className="feed-mini-bio">{user.bio}</p>
                            )}

                            {user?.collegeName && (
                                <div className="feed-mini-badge-row">
                                    <span className="feed-mini-tag">🎓 {user.collegeName}</span>
                                </div>
                            )}
                        </div>

                        <div className="feed-mini-stats-section">
                            <div className="feed-stat-item hover-lift" onClick={handleOpenConnections}>
                                <div className="feed-stat-label-group">
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                    </svg>
                                    <span>Connections</span>
                                </div>
                                <span className="feed-stat-num highlight">{stats.connectionCount}</span>
                            </div>

                            <div className="feed-stat-item hover-lift" onClick={handleOpenViewers}>
                                <div className="feed-stat-label-group">
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                    <span>Profile views</span>
                                </div>
                                <span className="feed-stat-num">{stats.viewsCount}</span>
                            </div>
                        </div>
                    </div>

                    <div className="feed-nav-shortcuts-card">
                        <Link to="/saved" className="feed-nav-link-row">
                            <div className="feed-nav-link-icon saved">
                                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                                </svg>
                            </div>
                            <span>Saved Items</span>
                        </Link>
                        <Link to="/liked" className="feed-nav-link-row">
                            <div className="feed-nav-link-icon liked">
                                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                                </svg>
                            </div>
                            <span>Liked Posts</span>
                        </Link>
                        <Link to="/commented" className="feed-nav-link-row">
                            <div className="feed-nav-link-icon commented">
                                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                                </svg>
                            </div>
                            <span>My Comments</span>
                        </Link>
                    </div>
                </aside>

                <main className="feed-main-col">

                    <div className="feed-composer-card">
                        <div className="feed-composer-top">
                            <img
                                src={user?.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                                alt="Me"
                                className="feed-composer-avatar"
                            />
                            <button
                                type="button"
                                className="feed-composer-trigger"
                                onClick={() => handleOpenModal(false)}
                            >
                                <span>Share an update, project, or campus thought...</span>
                            </button>
                        </div>

                        <div className="feed-composer-actions-bar">
                            <button
                                type="button"
                                className="composer-action-btn photo"
                                onClick={() => handleOpenModal(true)}
                            >
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                    <polyline points="21 15 16 10 5 21" />
                                </svg>
                                <span>Photo</span>
                            </button>
                            <button
                                type="button"
                                className="composer-action-btn video"
                                onClick={() => handleOpenModal(false)}
                            >
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                                    <polygon points="23 7 16 12 23 17 23 7" />
                                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                                </svg>
                                <span>Video</span>
                            </button>
                            <button
                                type="button"
                                className="composer-action-btn event"
                                onClick={() => handleOpenModal(false)}
                            >
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                                <span>Event</span>
                            </button>
                            <button
                                type="button"
                                className="composer-action-btn article"
                                onClick={() => handleOpenModal(false)}
                            >
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                </svg>
                                <span>Article</span>
                            </button>
                        </div>
                    </div>

                    <div className="feed-posts-stream">

                        {pendingPost && (
                            <div className="pending-post-card">
                                <div className="pending-post-progress-bar" />
                                <div className="pending-post-header">
                                    <img
                                        src={user?.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                                        alt="Me"
                                        className="pending-avatar"
                                    />
                                    <div>
                                        <div className="pending-name">{user?.name}</div>
                                        <div className="pending-status">Publishing post to feed...</div>
                                    </div>
                                </div>
                                <div className="pending-content">{pendingPost.content}</div>
                                {pendingPost.image && (
                                    <div className="pending-img-preview">
                                        <img src={pendingPost.image.trim()} alt="" />
                                    </div>
                                )}
                            </div>
                        )}

                        {sortedPosts.length === 0 && !pendingPost ? (
                            <div className="feed-empty-state-card">
                                <div className="empty-state-icon-circle">
                                    <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.8">
                                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                    </svg>
                                </div>
                                <h3>No posts in your feed yet</h3>
                                <p>Be the first to share an update, project milestone, or question with your campus network!</p>
                                <Button variant="primary" onClick={() => handleOpenModal(false)}>
                                    Create First Post
                                </Button>
                            </div>
                        ) : (
                            sortedPosts.map((post) => (
                                <PostCard
                                    key={post._id}
                                    post={post}
                                    onDelete={handlePostDelete}
                                    onUpdate={handlePostUpdate}
                                />
                            ))
                        )}
                    </div>
                </main>

                <aside className="feed-right-col">

                    <div className="feed-sidebar-card">
                        <div className="feed-sidebar-header">
                            <div className="feed-sidebar-title-group">
                                <div className="feed-sidebar-icon-badge jobs">
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="feed-sidebar-title">Recommended Jobs</h4>
                                    <span className="feed-sidebar-sub">Based on your profile</span>
                                </div>
                            </div>
                        </div>

                        <div className="feed-jobs-list">
                            {recommendedJobs.map((job) => (
                                <div key={job.id} className="feed-job-item">
                                    <div
                                        className="feed-job-logo"
                                        style={{ background: job.logoBg }}
                                    >
                                        {job.initials}
                                    </div>
                                    <div className="feed-job-details">
                                        <span className="feed-job-title">{job.title}</span>
                                        <span className="feed-job-company">{job.company}</span>
                                        <div className="feed-job-meta-row">
                                            <span className="feed-job-loc">{job.location}</span>
                                            <span className="feed-job-tag">{job.type}</span>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        className={`btn-job-apply ${appliedJobs[job.id] ? "applied" : ""}`}
                                        onClick={() => handleApplyJob(job.id)}
                                    >
                                        {appliedJobs[job.id] ? "Applied" : "Apply"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="feed-sidebar-card">
                        <div className="feed-sidebar-header">
                            <div className="feed-sidebar-title-group">
                                <div className="feed-sidebar-icon-badge trending">
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                                        <polyline points="17 6 23 6 23 12" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="feed-sidebar-title">Trending Today</h4>
                                    <span className="feed-sidebar-sub">Popular on Waverly</span>
                                </div>
                            </div>
                        </div>

                        <div className="feed-trending-list">
                            {trendingTopics.map((topic, i) => (
                                <div key={i} className="feed-trending-item">
                                    <span className="trending-hash">#{topic.tag}</span>
                                    <span className="trending-count">{topic.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)} style={{ zIndex: 3200 }}>
                    <div className="modal-box feed-composer-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-row">
                            <div className="modal-header-title-group">
                                <img
                                    src={user?.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                                    alt="User"
                                    className="post-modal-user-avatar"
                                />
                                <div>
                                    <span className="post-modal-author-name">{user?.name}</span>
                                    <div className="post-modal-visibility-tag">
                                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" />
                                            <line x1="2" y1="12" x2="22" y2="12" />
                                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                        </svg>
                                        <span>Public to Campus</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="crop-modal-close-btn"
                                onClick={() => setIsModalOpen(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreatePostSubmit} className="feed-modal-form">
                            <textarea
                                className="feed-modal-textarea"
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                placeholder="What do you want to share with your peers?"
                                rows={5}
                                autoFocus
                                required
                            />

                            {showImageInput && (
                                <div className="feed-modal-image-field">
                                    <input
                                        type="url"
                                        className="feed-modal-image-input"
                                        value={newPostImage}
                                        onChange={(e) => setNewPostImage(e.target.value)}
                                        placeholder="Paste image link URL (https://...)..."
                                    />
                                    {newPostImage.trim() && (
                                        <div className="feed-modal-img-preview-box">
                                            <img
                                                src={newPostImage.trim()}
                                                alt="Preview"
                                                onError={(e) => { e.currentTarget.parentElement.style.display = "none"; }}
                                            />
                                            <button
                                                type="button"
                                                className="feed-preview-remove-btn"
                                                onClick={() => setNewPostImage("")}
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
                                        title="Attach image link"
                                    >
                                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                            <circle cx="8.5" cy="8.5" r="1.5" />
                                            <polyline points="21 15 16 10 5 21" />
                                        </svg>
                                    </button>
                                </div>

                                <div className="feed-modal-submit-group">
                                    <Button
                                        variant="secondary"
                                        onClick={() => setIsModalOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="primary"
                                        type="submit"
                                        disabled={!newPostContent.trim() || isPosting}
                                        isLoading={isPosting}
                                    >
                                        {isPosting ? "Posting..." : "Publish Post"}
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showConnectionsModal && (
                <div className="modal-overlay" onClick={() => setShowConnectionsModal(false)} style={{ zIndex: 3200 }}>
                    <div className="modal-box connections-modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-row">
                            <div className="modal-header-title-group">
                                <div className="modal-icon-badge">
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="modal-title">My Connections</h3>
                                    <p className="modal-subtitle">{stats.connectionCount} active connections</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="crop-modal-close-btn"
                                onClick={() => setShowConnectionsModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="connections-modal-list">
                            {isFetchingConnections ? (
                                <div className="connections-loading-state"><div className="spinner" /></div>
                            ) : connectionsList.length === 0 ? (
                                <div className="connections-empty-state"><p>No connections found.</p></div>
                            ) : (
                                connectionsList.map(member => (
                                    <div key={member._id} className="connection-member-row">
                                        <Link to={`/users/${member.username}`} onClick={() => setShowConnectionsModal(false)} className="connection-avatar-link">
                                            <img
                                                src={member.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                                                alt={member.name}
                                                className="connection-avatar-img"
                                            />
                                        </Link>
                                        <div className="connection-info-col">
                                            <Link to={`/users/${member.username}`} onClick={() => setShowConnectionsModal(false)} className="connection-name-link">
                                                {member.name}
                                            </Link>
                                            <span className="connection-handle-text">@{member.username}</span>
                                            {member.bio && <span className="connection-college-text">{member.bio}</span>}
                                        </div>
                                        <Link to={`/users/${member.username}`} onClick={() => setShowConnectionsModal(false)} className="btn btn-secondary btn-sm">
                                            View
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showViewersModal && (
                <div className="modal-overlay" onClick={() => setShowViewersModal(false)} style={{ zIndex: 3200 }}>
                    <div className="modal-box connections-modal-box" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-row">
                            <div className="modal-header-title-group">
                                <div className="modal-icon-badge">
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="modal-title">Profile Viewers</h3>
                                    <p className="modal-subtitle">People who recently visited your profile</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="crop-modal-close-btn"
                                onClick={() => setShowViewersModal(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="connections-modal-list">
                            {isFetchingViewers ? (
                                <div className="connections-loading-state"><div className="spinner" /></div>
                            ) : viewersList.length === 0 ? (
                                <div className="connections-empty-state"><p>No profile views recorded yet.</p></div>
                            ) : (
                                viewersList.map(viewer => (
                                    <div key={viewer._id} className="connection-member-row">
                                        <Link to={`/users/${viewer.username}`} onClick={() => setShowViewersModal(false)} className="connection-avatar-link">
                                            <img
                                                src={viewer.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                                                alt={viewer.name}
                                                className="connection-avatar-img"
                                            />
                                        </Link>
                                        <div className="connection-info-col">
                                            <Link to={`/users/${viewer.username}`} onClick={() => setShowViewersModal(false)} className="connection-name-link">
                                                {viewer.name}
                                            </Link>
                                            <span className="connection-handle-text">@{viewer.username}</span>
                                            {viewer.viewTime && (
                                                <span className="connection-college-text" style={{ color: "var(--text-accent)" }}>
                                                    Viewed {viewer.viewTime}
                                                </span>
                                            )}
                                        </div>
                                        <Link to={`/users/${viewer.username}`} onClick={() => setShowViewersModal(false)} className="btn btn-primary btn-sm">
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
