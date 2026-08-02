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
    const [sortBy, setSortBy] = useState("recent");
    const [followedUsers, setFollowedUsers] = useState({});
    const [appliedJobs, setAppliedJobs] = useState({});

    const [usersToFollow, setUsersToFollow] = useState([]);
    const [stats, setStats] = useState({ connectionCount: 0, viewsCount: 0 });

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
        const fetchRecommendations = async () => {
            try {
                const users = await userApi.getRecommendedUsers();
                setUsersToFollow(users || []);
            } catch (err) {
                console.error("Failed to fetch recommended users", err);
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
        fetchRecommendations();
        fetchStats();
    }, []);

    const handleCreatePostSubmit = async (e) => {
        e.preventDefault();
        if (!newPostContent.trim() || isPosting) return;

        setIsPosting(true);
        try {
            const payload = { content: newPostContent.trim() };
            if (newPostImage.trim()) {
                payload.image = newPostImage.trim();
            }
            const newPost = await postApi.createPost(payload);
            setPosts((prevPosts) => [newPost, ...prevPosts]);
            
            // Reset state and close modal
            setNewPostContent("");
            setNewPostImage("");
            setShowImageInput(false);
            setIsModalOpen(false);
        } catch (err) {
            console.error("Failed to create post", err);
        } finally {
            setIsPosting(false);
        }
    };

    const handleOpenModal = (toggledImage = false) => {
        setIsModalOpen(true);
        if (toggledImage) {
            setShowImageInput(true);
        }
    };

    // Sort posts dynamically on presentation
    const getSortedPosts = () => {
        const postsCopy = [...posts];
        if (sortBy === "top") {
            return postsCopy.sort((a, b) => {
                const aLikes = a.likes ? a.likes.length : 0;
                const bLikes = b.likes ? b.likes.length : 0;
                if (bLikes !== aLikes) {
                    return bLikes - aLikes;
                }
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
        }
        // default recent
        return postsCopy.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    };

    const sortedPosts = getSortedPosts();

    return (
        <div className="feed-page" style={{ background: "#0f1419", minHeight: "100vh" }}>
            <div className="feed-grid">
                
                {/* Left Sidebar Profile Summary Card */}
                <div className="feed-left-sidebar">
                    <div className="feed-profile-card">
                        <div className="feed-profile-banner" />
                        <div className="feed-profile-avatar-container">
                            <img 
                                src={user?.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"} 
                                alt={user?.name || "Avatar"} 
                                className="feed-profile-avatar"
                            />
                        </div>
                        <div className="feed-profile-info">
                            <Link to="/profile" className="feed-profile-name">{user?.name}</Link>
                            <span className="feed-profile-handle">@{user?.username}</span>
                            {user?.additionalName && (
                                <span className="feed-profile-handle" style={{ fontSize: "0.7rem", color: "#1d9bf0", fontStyle: "italic", marginTop: "0.1rem" }}>
                                    {user?.additionalName}
                                </span>
                            )}
                        </div>
                        <div className="feed-profile-stats">
                            <div className="feed-profile-stat-row">
                                <span className="feed-profile-stat-label">Connections</span>
                                <span className="feed-profile-stat-value">0</span>
                            </div>
                            <div className="feed-profile-stat-row">
                                <span className="feed-profile-stat-label">Who viewed your profile</span>
                                <span className="feed-profile-stat-value">0</span>
                            </div>
                        </div>
                        <Link to="/saved" className="feed-profile-my-items">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                            </svg>
                            My Saved Posts
                        </Link>
                    </div>

                    <div className="feed-profile-card" style={{ marginTop: '0.75rem' }}>
                        <div style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                <span style={{ fontSize: '0.75rem', color: '#71767b', fontWeight: '600' }}>Recent</span>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#e7e9ea', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}>
                                    <span style={{ color: '#71767b' }}>#</span>
                                    <span>javascript</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#e7e9ea', fontSize: '0.75rem', fontWeight: '600', cursor: 'pointer' }}>
                                    <span style={{ color: '#71767b' }}>#</span>
                                    <span>reactjs</span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingTop: '0.25rem', borderTop: '1px solid #2f3336' }}>
                                <span style={{ fontSize: '0.75rem', color: '#1d9bf0', fontWeight: '600', cursor: 'pointer' }}>Groups</span>
                                <span style={{ fontSize: '0.75rem', color: '#1d9bf0', fontWeight: '600', cursor: 'pointer' }}>Events</span>
                                <span style={{ fontSize: '0.75rem', color: '#1d9bf0', fontWeight: '600', cursor: 'pointer' }}>Followed Hashtags</span>
                            </div>
                        </div>
                        <div style={{ borderTop: '1px solid #2f3336', padding: '0.6rem 1rem', textAlign: 'center' }}>
                            <a href="#" style={{ color: '#71767b', fontSize: '0.75rem', fontWeight: '600', textDecoration: 'none' }} onClick={e => e.preventDefault()}>
                                Discover more
                            </a>
                        </div>
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

                    {/* Sorting Bar */}
                    <div className="feed-sort-divider">
                        <div className="feed-sort-line" />
                        <span className="feed-sort-label">Sort by:</span>
                        <select 
                            className="feed-sort-select" 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value)}
                        >
                            <option value="recent">Recent</option>
                            <option value="top">Top Likes</option>
                        </select>
                    </div>

                    {/* Posts Feed */}
                    {isLoading ? (
                        <div className="page-center" style={{ padding: "3rem 0" }}>
                            <div className="spinner" />
                        </div>
                    ) : sortedPosts.length > 0 ? (
                        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                            {sortedPosts.map((post) => (
                                <PostCard 
                                    key={post._id} 
                                    post={post} 
                                    onDelete={(id) => setPosts(posts.filter((p) => p._id !== id))} 
                                />
                            ))}
                        </div>
                    ) : (
                        <div style={{ background: "#16181c", border: "1px solid #2f3336", borderRadius: "10px", padding: "3rem 1rem", textAlign: "center", color: "#71767b" }}>
                            <h3 style={{ margin: "0 0 0.5rem 0", color: "#e7e9ea" }}>No posts in the feed yet</h3>
                            <p style={{ margin: 0 }}>Be the first to share something with the campus!</p>
                        </div>
                    )}
                </div>

                {/* Right Sidebar Widgets */}
                <div className="feed-right-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    
                    {/* People You May Know */}
                    <div className="widget-card">
                        <h3 className="widget-title">People you may know</h3>
                        <div className="widget-list" style={{ marginTop: '0.25rem' }}>
                            {usersToFollow.length > 0 ? (
                                usersToFollow.map(item => (
                                    <div key={item._id} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', paddingBottom: '0.5rem', borderBottom: '1px solid #2f3336' }}>
                                        <Link to={`/users/${item.username}`}>
                                            <img 
                                                src={item.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"} 
                                                alt={item.name} 
                                                style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} 
                                            />
                                        </Link>
                                        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0 }}>
                                            <Link to={`/users/${item.username}`} style={{ fontSize: '0.8rem', fontWeight: '700', color: '#e7e9ea', textDecoration: 'none' }} className="hover-underline">
                                                {item.name}
                                            </Link>
                                            <span style={{ fontSize: '0.68rem', color: '#71767b', lineHeight: '1.2', margin: '0.1rem 0 0.35rem 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                {item.bio || item.collegeName || item.companyName || "Waverly Member"}
                                            </span>
                                            <button 
                                                onClick={() => setFollowedUsers(prev => ({ ...prev, [item._id]: !prev[item._id] }))}
                                                style={{
                                                    background: 'transparent',
                                                    border: followedUsers[item._id] ? '1px solid #71767b' : '1px solid #1d9bf0',
                                                    color: followedUsers[item._id] ? '#71767b' : '#1d9bf0',
                                                    borderRadius: '20px',
                                                    padding: '0.15rem 0.65rem',
                                                    fontSize: '0.7rem',
                                                    fontWeight: '600',
                                                    cursor: 'pointer',
                                                    width: 'fit-content',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '0.2rem'
                                                }}
                                            >
                                                {followedUsers[item._id] ? (
                                                    <>
                                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="20 6 9 17 4 12"></polyline>
                                                        </svg>
                                                        Pending
                                                    </>
                                                ) : (
                                                    <>
                                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                            <line x1="12" y1="5" x2="12" y2="19"></line>
                                                            <line x1="5" y1="12" x2="19" y2="12"></line>
                                                        </svg>
                                                        Connect
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div style={{ fontSize: '0.75rem', color: '#71767b', textAlign: 'center', padding: '0.5rem 0' }}>
                                    No suggestions at the moment
                                </div>
                            )}
                        </div>
                    </div>

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
        </div>
    );
};

export default Feed_Page;
