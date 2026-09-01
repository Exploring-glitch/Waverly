import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProfileHeader from "../components/ProfileHeader";
import ProfileAbout from "../components/ProfileAbout";
import ProfileSkills from "../components/ProfileSkills";
import ProfileActivity from "../components/ProfileActivity";
import { userApi } from "../services/api";

const Profile_Page = () => {
    const { user } = useAuth();
    const [usersToFollow, setUsersToFollow] = useState([]);
    const [collegeUsers, setCollegeUsers] = useState([]);
    const [isCollegeModalOpen, setIsCollegeModalOpen] = useState(false);
    const [isRecommendModalOpen, setIsRecommendModalOpen] = useState(false);
    const [connectionCount, setConnectionCount] = useState(0);

    const handleConnectUser = async (userId, listType) => {
        try {
            await userApi.sendConnectionRequest(userId);
            const updater = prev => prev.map(item => item._id === userId ? { ...item, connectionStatus: "pending_sent" } : item);
            if (listType === "suggestions") {
                setUsersToFollow(updater);
            } else if (listType === "college") {
                setCollegeUsers(updater);
            }
        } catch (err) {
            console.error("Failed to send connection request", err);
        }
    };

    const handleCancelUserRequest = async (userId, listType) => {
        try {
            await userApi.rejectConnectionRequest(userId);
            const updater = prev => prev.map(item => item._id === userId ? { ...item, connectionStatus: "none" } : item);
            if (listType === "suggestions") {
                setUsersToFollow(updater);
            } else if (listType === "college") {
                setCollegeUsers(updater);
            }
        } catch (err) {
            console.error("Failed to cancel connection request", err);
        }
    };

    const handleAcceptUserRequest = async (userId, listType) => {
        try {
            await userApi.acceptConnectionRequest(userId);
            const updater = prev => prev.map(item => item._id === userId ? { ...item, connectionStatus: "accepted" } : item);
            if (listType === "suggestions") {
                setUsersToFollow(updater);
            } else if (listType === "college") {
                setCollegeUsers(updater);
            }
            setConnectionCount(prev => prev + 1);
        } catch (err) {
            console.error("Failed to accept connection request", err);
        }
    };

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const users = await userApi.getRecommendedUsers();
                const filtered = (users || []).filter(u => u._id !== user?._id && u.username !== user?.username);
                setUsersToFollow(filtered);
            } catch (err) {
                console.error("Failed to fetch recommended users", err);
            }
        };

        const fetchCollegePeers = async () => {
            if (user?.collegeName) {
                try {
                    const data = await userApi.getCollegeMembers(user.collegeName);
                    if (data && data.members) {
                        const filtered = data.members.filter(m => m._id !== user?._id && m.username !== user?.username);
                        filtered.sort((a, b) => a.name.localeCompare(b.name));
                        setCollegeUsers(filtered);
                    }
                } catch (err) {
                    console.error("Failed to fetch college members", err);
                }
            }
        };

        const fetchStats = async () => {
            try {
                const data = await userApi.getConnectionStats();
                setConnectionCount(data?.connectionCount || 0);
            } catch (err) {
                console.error("Failed to fetch connection stats", err);
            }
        };

        if (user) {
            fetchRecommendations();
            fetchCollegePeers();
            fetchStats();
        }
    }, [user]);

    if (!user) {
        return <div className="page-center"><div className="spinner" /></div>;
    }

    // Profile Completion Calculation
    const profileChecks = [
        { label: "Profile photo", done: Boolean(user.profilePic) },
        { label: "Cover banner", done: Boolean(user.coverPic) },
        { label: "Short bio", done: Boolean(user.bio) },
        { label: "University/College", done: Boolean(user.collegeName) },
        { label: "Skills & expertise", done: Boolean(user.skills && user.skills.length > 0) },
        { label: "About summary", done: Boolean(user.about) },
    ];
    const completedCount = profileChecks.filter(c => c.done).length;
    const completionPercentage = Math.round((completedCount / profileChecks.length) * 100);

    return (
        <div className="profile-page-wrapper">
            <div className="profile-grid">
                {/* Main Left Column */}
                <div className="profile-main-content">
                    <ProfileHeader user={user} connectionCount={connectionCount} />
                    <ProfileAbout user={user} isOwnProfile={true} />
                    <ProfileSkills user={user} isOwnProfile={true} />
                    <ProfileActivity />
                </div>

                {/* Sidebar Right Column */}
                <div className="profile-right-sidebar">
                    {/* Profile Strength Widget (if not 100%) */}
                    {completionPercentage < 100 && (
                        <div className="sidebar-widget-card profile-strength-widget">
                            <div className="widget-header-row">
                                <div className="widget-icon-pill">
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                    </svg>
                                </div>
                                <div className="widget-title-col">
                                    <h4 className="widget-card-title">Profile Strength</h4>
                                    <span className="widget-card-subtitle">{completionPercentage}% Completed</span>
                                </div>
                            </div>

                            <div className="strength-progress-track">
                                <div
                                    className="strength-progress-fill"
                                    style={{ width: `${completionPercentage}%` }}
                                />
                            </div>

                            <p className="strength-suggestion-text">
                                Complete your profile to unlock more connection recommendations.
                            </p>

                            <Link to="/edit-profile" className="btn btn-secondary btn-sm strength-cta-btn">
                                Complete Profile
                            </Link>
                        </div>
                    )}

                    {/* University / College Peers */}
                    <div className="sidebar-widget-card">
                        <div className="widget-header-row">
                            <div className="widget-icon-pill university-pill">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                    <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5" />
                                </svg>
                            </div>
                            <div className="widget-title-col">
                                <h4 className="widget-card-title">Campus Peers</h4>
                                <span className="widget-card-subtitle">
                                    {user.collegeName ? `From ${user.collegeName}` : "Find your peers"}
                                </span>
                            </div>
                        </div>

                        <div className="widget-users-list">
                            {!user.collegeName ? (
                                <div className="widget-empty-msg">
                                    <p>Add your university or college to your profile to find classmates and alumni.</p>
                                    <Link to="/edit-profile" className="widget-inline-link">
                                        + Add College
                                    </Link>
                                </div>
                            ) : collegeUsers.length > 0 ? (
                                collegeUsers.slice(0, 4).map(item => (
                                    <div key={item._id} className="widget-user-row">
                                        <Link to={`/users/${item.username}`} className="widget-user-avatar-link">
                                            <img
                                                src={item.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                                                alt={item.name}
                                                className="widget-user-avatar"
                                                onError={(e) => {
                                                    e.currentTarget.src = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
                                                }}
                                            />
                                        </Link>
                                        <div className="widget-user-info">
                                            <Link to={`/users/${item.username}`} className="widget-user-name">
                                                {item.name}
                                            </Link>
                                            <span className="widget-user-bio">
                                                {item.bio || item.collegeName || "Campus Peer"}
                                            </span>
                                        </div>
                                        <div className="widget-user-action">
                                            {item.connectionStatus === "accepted" ? (
                                                <button
                                                    type="button"
                                                    onClick={() => handleCancelUserRequest(item._id, "college")}
                                                    className="btn-status-pill connected"
                                                >
                                                    Connected
                                                </button>
                                            ) : item.connectionStatus === "pending_sent" ? (
                                                <button
                                                    type="button"
                                                    onClick={() => handleCancelUserRequest(item._id, "college")}
                                                    className="btn-status-pill pending"
                                                >
                                                    Pending
                                                </button>
                                            ) : item.connectionStatus === "pending_received" ? (
                                                <button
                                                    type="button"
                                                    onClick={() => handleAcceptUserRequest(item._id, "college")}
                                                    className="btn-status-pill accept"
                                                >
                                                    Accept
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => handleConnectUser(item._id, "college")}
                                                    className="btn-status-pill connect"
                                                >
                                                    + Connect
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="widget-empty-msg">
                                    <p>No other members from your college found yet.</p>
                                </div>
                            )}
                        </div>

                        {user.collegeName && collegeUsers.length > 4 && (
                            <button
                                type="button"
                                className="widget-show-all-btn"
                                onClick={() => setIsCollegeModalOpen(true)}
                            >
                                <span>Show all ({collegeUsers.length})</span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Recommended Connections */}
                    <div className="sidebar-widget-card">
                        <div className="widget-header-row">
                            <div className="widget-icon-pill suggest-pill">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </div>
                            <div className="widget-title-col">
                                <h4 className="widget-card-title">People You May Know</h4>
                                <span className="widget-card-subtitle">Recommended for you</span>
                            </div>
                        </div>

                        <div className="widget-users-list">
                            {usersToFollow.length > 0 ? (
                                usersToFollow.slice(0, 4).map(item => (
                                    <div key={item._id} className="widget-user-row">
                                        <Link to={`/users/${item.username}`} className="widget-user-avatar-link">
                                            <img
                                                src={item.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                                                alt={item.name}
                                                className="widget-user-avatar"
                                                onError={(e) => {
                                                    e.currentTarget.src = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
                                                }}
                                            />
                                        </Link>
                                        <div className="widget-user-info">
                                            <Link to={`/users/${item.username}`} className="widget-user-name">
                                                {item.name}
                                            </Link>
                                            <span className="widget-user-bio">
                                                {item.bio || item.collegeName || item.companyName || "Waverly Member"}
                                            </span>
                                        </div>
                                        <div className="widget-user-action">
                                            {item.connectionStatus === "accepted" ? (
                                                <button
                                                    type="button"
                                                    onClick={() => handleCancelUserRequest(item._id, "suggestions")}
                                                    className="btn-status-pill connected"
                                                >
                                                    Connected
                                                </button>
                                            ) : item.connectionStatus === "pending_sent" ? (
                                                <button
                                                    type="button"
                                                    onClick={() => handleCancelUserRequest(item._id, "suggestions")}
                                                    className="btn-status-pill pending"
                                                >
                                                    Pending
                                                </button>
                                            ) : item.connectionStatus === "pending_received" ? (
                                                <button
                                                    type="button"
                                                    onClick={() => handleAcceptUserRequest(item._id, "suggestions")}
                                                    className="btn-status-pill accept"
                                                >
                                                    Accept
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => handleConnectUser(item._id, "suggestions")}
                                                    className="btn-status-pill connect"
                                                >
                                                    + Connect
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="widget-empty-msg">
                                    <p>No new recommendations at the moment.</p>
                                </div>
                            )}
                        </div>

                        {usersToFollow.length > 4 && (
                            <button
                                type="button"
                                className="widget-show-all-btn"
                                onClick={() => setIsRecommendModalOpen(true)}
                            >
                                <span>Show all ({usersToFollow.length})</span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="9 18 15 12 9 6" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* University Peers Full Modal */}
            {isCollegeModalOpen && (
                <div className="modal-overlay" onClick={() => setIsCollegeModalOpen(false)} style={{ zIndex: 3200 }}>
                    <div className="modal-box connections-modal-box" onClick={e => e.stopPropagation()}>
                        <div className="modal-header-row">
                            <div className="modal-header-title-group">
                                <div className="modal-icon-badge">
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                                        <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="modal-title">Campus Peers</h3>
                                    <p className="modal-subtitle">Members from {user.collegeName}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="crop-modal-close-btn"
                                onClick={() => setIsCollegeModalOpen(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="connections-modal-list">
                            {collegeUsers.map(item => (
                                <div key={item._id} className="connection-member-row">
                                    <Link
                                        to={`/users/${item.username}`}
                                        onClick={() => setIsCollegeModalOpen(false)}
                                        className="connection-avatar-link"
                                    >
                                        <img
                                            src={item.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                                            alt={item.name}
                                            className="connection-avatar-img"
                                            onError={(e) => {
                                                e.currentTarget.src = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
                                            }}
                                        />
                                    </Link>
                                    <div className="connection-info-col">
                                        <Link
                                            to={`/users/${item.username}`}
                                            onClick={() => setIsCollegeModalOpen(false)}
                                            className="connection-name-link"
                                        >
                                            {item.name}
                                        </Link>
                                        <span className="connection-handle-text">@{item.username}</span>
                                        <span className="connection-college-text">
                                            {item.bio || item.collegeName || "Campus Peer"}
                                        </span>
                                    </div>
                                    <div className="widget-user-action">
                                        {item.connectionStatus === "accepted" ? (
                                            <button
                                                type="button"
                                                onClick={() => handleCancelUserRequest(item._id, "college")}
                                                className="btn-status-pill connected"
                                            >
                                                Connected
                                            </button>
                                        ) : item.connectionStatus === "pending_sent" ? (
                                            <button
                                                type="button"
                                                onClick={() => handleCancelUserRequest(item._id, "college")}
                                                className="btn-status-pill pending"
                                            >
                                                Pending
                                            </button>
                                        ) : item.connectionStatus === "pending_received" ? (
                                            <button
                                                type="button"
                                                onClick={() => handleAcceptUserRequest(item._id, "college")}
                                                className="btn-status-pill accept"
                                            >
                                                Accept
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => handleConnectUser(item._id, "college")}
                                                className="btn-status-pill connect"
                                            >
                                                + Connect
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* General Recommendations Full Modal */}
            {isRecommendModalOpen && (
                <div className="modal-overlay" onClick={() => setIsRecommendModalOpen(false)} style={{ zIndex: 3200 }}>
                    <div className="modal-box connections-modal-box" onClick={e => e.stopPropagation()}>
                        <div className="modal-header-row">
                            <div className="modal-header-title-group">
                                <div className="modal-icon-badge">
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="modal-title">People You May Know</h3>
                                    <p className="modal-subtitle">Suggested connections for you</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="crop-modal-close-btn"
                                onClick={() => setIsRecommendModalOpen(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="connections-modal-list">
                            {[...usersToFollow].sort((a, b) => a.name.localeCompare(b.name)).map(item => (
                                <div key={item._id} className="connection-member-row">
                                    <Link
                                        to={`/users/${item.username}`}
                                        onClick={() => setIsRecommendModalOpen(false)}
                                        className="connection-avatar-link"
                                    >
                                        <img
                                            src={item.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                                            alt={item.name}
                                            className="connection-avatar-img"
                                            onError={(e) => {
                                                e.currentTarget.src = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
                                            }}
                                        />
                                    </Link>
                                    <div className="connection-info-col">
                                        <Link
                                            to={`/users/${item.username}`}
                                            onClick={() => setIsRecommendModalOpen(false)}
                                            className="connection-name-link"
                                        >
                                            {item.name}
                                        </Link>
                                        <span className="connection-handle-text">@{item.username}</span>
                                        <span className="connection-college-text">
                                            {item.bio || item.collegeName || item.companyName || "Waverly Member"}
                                        </span>
                                    </div>
                                    <div className="widget-user-action">
                                        {item.connectionStatus === "accepted" ? (
                                            <button
                                                type="button"
                                                onClick={() => handleCancelUserRequest(item._id, "suggestions")}
                                                className="btn-status-pill connected"
                                            >
                                                Connected
                                            </button>
                                        ) : item.connectionStatus === "pending_sent" ? (
                                            <button
                                                type="button"
                                                onClick={() => handleCancelUserRequest(item._id, "suggestions")}
                                                className="btn-status-pill pending"
                                            >
                                                Pending
                                            </button>
                                        ) : item.connectionStatus === "pending_received" ? (
                                            <button
                                                type="button"
                                                onClick={() => handleAcceptUserRequest(item._id, "suggestions")}
                                                className="btn-status-pill accept"
                                            >
                                                Accept
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => handleConnectUser(item._id, "suggestions")}
                                                className="btn-status-pill connect"
                                            >
                                                + Connect
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile_Page;
