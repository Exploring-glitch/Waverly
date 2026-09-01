import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { userApi } from "../services/api";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";

const MyNetwork_Page = () => {
    const { user } = useAuth();
    const [receivedRequests, setReceivedRequests] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [cityMembers, setCityMembers] = useState([]);
    const [collegeMembers, setCollegeMembers] = useState([]);
    const [totalConnectionsCount, setTotalConnectionsCount] = useState(0);
    const [activeTab, setActiveTab] = useState("all"); 

    const [isLoadingRequests, setIsLoadingRequests] = useState(true);
    const [isLoadingSent, setIsLoadingSent] = useState(true);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
    const [isLoadingCity, setIsLoadingCity] = useState(false);
    const [isLoadingCollege, setIsLoadingCollege] = useState(false);

    const [showConnectionsModal, setShowConnectionsModal] = useState(false);
    const [connectionsList, setConnectionsList] = useState([]);
    const [isFetchingConnections, setIsFetchingConnections] = useState(false);

    const fetchData = async () => {

        try {
            const reqs = await userApi.getReceivedConnections();
            setReceivedRequests(reqs || []);
        } catch (err) {
            console.error("Failed to load connection requests", err);
        } finally {
            setIsLoadingRequests(false);
        }

        try {
            const sent = await userApi.getSentConnections();
            setSentRequests(sent || []);
        } catch (err) {
            console.error("Failed to load sent connection requests", err);
        } finally {
            setIsLoadingSent(false);
        }

        try {
            const recs = await userApi.getRecommendedUsers();
            const filtered = (recs || []).filter(u => u._id !== user?._id);
            filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
            setSuggestions(filtered);
        } catch (err) {
            console.error("Failed to load suggestions", err);
        } finally {
            setIsLoadingSuggestions(false);
        }

        if (user?.locationCity) {
            setIsLoadingCity(true);
            try {
                const data = await userApi.getCityMembers(user.locationCity);
                if (data && data.members) {
                    const filtered = data.members.filter(m => m._id !== user._id);
                    filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
                    setCityMembers(filtered);
                }
            } catch (err) {
                console.error("Failed to load city members", err);
            } finally {
                setIsLoadingCity(false);
            }
        }

        if (user?.collegeName) {
            setIsLoadingCollege(true);
            try {
                const data = await userApi.getCollegeMembers(user.collegeName);
                if (data && data.members) {
                    const filtered = data.members.filter(m => m._id !== user._id);
                    filtered.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
                    setCollegeMembers(filtered);
                }
            } catch (err) {
                console.error("Failed to load college members", err);
            } finally {
                setIsLoadingCollege(false);
            }
        }

        try {
            const stats = await userApi.getConnectionStats();
            setTotalConnectionsCount(stats?.connectionCount || 0);
        } catch (err) {
            console.error("Failed to load connection stats", err);
        }
    };

    useEffect(() => {
        if (user) {
            fetchData();
        }
    }, [user]);

    const handleAcceptRequest = async (senderId) => {
        try {
            await userApi.acceptConnectionRequest(senderId);
            setReceivedRequests(prev => prev.filter(req => req.sender?._id !== senderId));
            setTotalConnectionsCount(prev => prev + 1);

            const updater = prev =>
                prev.map(item =>
                    item._id === senderId ? { ...item, connectionStatus: "accepted" } : item
                );
            setSuggestions(updater);
            setCityMembers(updater);
            setCollegeMembers(updater);
        } catch (err) {
            console.error("Failed to accept connection request", err);
            alert("Error accepting connection request");
        }
    };

    const handleIgnoreRequest = async (senderId) => {
        try {
            await userApi.rejectConnectionRequest(senderId);
            setReceivedRequests(prev => prev.filter(req => req.sender?._id !== senderId));
        } catch (err) {
            console.error("Failed to ignore connection request", err);
            alert("Error ignoring connection request");
        }
    };

    const handleWithdrawSentRequest = async (recipientId) => {
        try {
            await userApi.rejectConnectionRequest(recipientId);
            setSentRequests(prev => prev.filter(req => req.recipient?._id !== recipientId));

            const updater = prev =>
                prev.map(item =>
                    item._id === recipientId ? { ...item, connectionStatus: "none" } : item
                );
            setSuggestions(updater);
            setCityMembers(updater);
            setCollegeMembers(updater);
        } catch (err) {
            console.error("Failed to withdraw connection request", err);
            alert("Error withdrawing connection request");
        }
    };

    const handleConnect = async (userId, listType) => {
        try {
            await userApi.sendConnectionRequest(userId);
            const updater = prev =>
                prev.map(item =>
                    item._id === userId ? { ...item, connectionStatus: "pending_sent" } : item
                );
            if (listType === "suggestions") setSuggestions(updater);
            else if (listType === "city") setCityMembers(updater);
            else if (listType === "college") setCollegeMembers(updater);

            const updatedSent = await userApi.getSentConnections();
            setSentRequests(updatedSent || []);
        } catch (err) {
            console.error("Failed to send connection request", err);
            alert("Error sending connection request");
        }
    };

    const handleCancelRequest = async (userId, listType) => {
        try {
            await userApi.rejectConnectionRequest(userId);
            const updater = prev =>
                prev.map(item =>
                    item._id === userId ? { ...item, connectionStatus: "none" } : item
                );
            if (listType === "suggestions") setSuggestions(updater);
            else if (listType === "city") setCityMembers(updater);
            else if (listType === "college") setCollegeMembers(updater);

            setSentRequests(prev => prev.filter(req => req.recipient?._id !== userId));
        } catch (err) {
            console.error("Failed to cancel connection request", err);
            alert("Error cancelling connection request");
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

    const renderUserCard = (person, listType) => {
        return (
            <div key={person._id} className="network-user-card hover-lift">
                <div className="network-card-banner">
                    {person.coverPic ? (
                        <img src={person.coverPic} alt="" className="network-card-banner-img" />
                    ) : (
                        <div className="network-card-banner-glow" />
                    )}
                </div>

                <div className="network-card-avatar-wrap">
                    <Link to={`/users/${person.username}`}>
                        <img
                            src={person.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                            alt={person.name}
                            className="network-card-avatar"
                            onError={(e) => {
                                e.currentTarget.src = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
                            }}
                        />
                    </Link>
                </div>

                <div className="network-card-body">
                    <Link to={`/users/${person.username}`} className="network-card-name">
                        <span>{person.name}</span>
                        <span className="profile-verified-badge" style={{ padding: "2px" }}>
                            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                            </svg>
                        </span>
                    </Link>

                    <span className="network-card-handle">@{person.username}</span>

                    <p className="network-card-bio">
                        {person.bio || person.collegeName || person.companyName || "Student / Alumni on Waverly"}
                    </p>

                    {person.collegeName && (
                        <div className="network-card-badge-row">
                            <span className="network-card-chip">🎓 {person.collegeName}</span>
                        </div>
                    )}
                </div>

                <div className="network-card-action">
                    {person.connectionStatus === "accepted" ? (
                        <button disabled className="btn-network-status connected">
                            ✓ Connected
                        </button>
                    ) : person.connectionStatus === "pending_sent" ? (
                        <button
                            type="button"
                            onClick={() => handleCancelRequest(person._id, listType)}
                            className="btn-network-status pending"
                        >
                            ⏳ Pending
                        </button>
                    ) : person.connectionStatus === "pending_received" ? (
                        <button
                            type="button"
                            onClick={() => handleAcceptRequest(person._id)}
                            className="btn-network-status accept"
                        >
                            ✓ Accept
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={() => handleConnect(person._id, listType)}
                            className="btn-network-status connect"
                        >
                            + Connect
                        </button>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="network-page-wrapper">
            <div className="network-grid-layout">

                <aside className="network-sidebar-col">
                    <div className="network-sidebar-card">
                        <div className="network-sidebar-header">
                            <div className="network-sidebar-badge-icon">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                    <circle cx="9" cy="7" r="4" />
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                                </svg>
                            </div>
                            <h3 className="network-sidebar-title">Manage Network</h3>
                        </div>

                        <div className="network-sidebar-menu">
                            <div 
                                className={`network-sidebar-item hover-lift ${activeTab === "all" ? "active" : ""}`}
                                onClick={() => setActiveTab("all")}
                            >
                                <div className="network-item-label-group">
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                        <polyline points="16 11 18 13 22 9" />
                                    </svg>
                                    <span>Recommendations</span>
                                </div>
                                <span className="network-item-badge">{suggestions.length}</span>
                            </div>

                            <div className="network-sidebar-item hover-lift" onClick={handleOpenConnections}>
                                <div className="network-item-label-group">
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                        <circle cx="9" cy="7" r="4" />
                                    </svg>
                                    <span>Connections</span>
                                </div>
                                <span className="network-item-badge">{totalConnectionsCount}</span>
                            </div>

                            <div 
                                className={`network-sidebar-item hover-lift ${activeTab === "received" ? "active" : ""} ${receivedRequests.length > 0 ? "highlight-invitation" : ""}`}
                                onClick={() => setActiveTab("received")}
                                title="View connection requests you have received"
                            >
                                <div className="network-item-label-group">
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                    <span>Received Invitations</span>
                                </div>
                                <span className={`network-item-badge ${receivedRequests.length > 0 ? "alert" : ""}`}>
                                    {receivedRequests.length}
                                </span>
                            </div>

                            <div 
                                className={`network-sidebar-item hover-lift ${activeTab === "sent" ? "active" : ""}`}
                                onClick={() => setActiveTab("sent")}
                                title="View connection requests you have sent"
                            >
                                <div className="network-item-label-group">
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="22" y1="2" x2="11" y2="13" />
                                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                    </svg>
                                    <span>Sent Requests</span>
                                </div>
                                <span className="network-item-badge">{sentRequests.length}</span>
                            </div>

                            {user?.collegeName && (
                                <div 
                                    className={`network-sidebar-item hover-lift ${activeTab === "college" ? "active" : ""}`}
                                    onClick={() => setActiveTab("college")}
                                    title={`View peers from ${user.collegeName}`}
                                >
                                    <div className="network-item-label-group">
                                        <span>🎓</span>
                                        <span className="network-item-truncate">{user.collegeName}</span>
                                    </div>
                                    <span className="network-item-badge">{collegeMembers.length}</span>
                                </div>
                            )}

                            {user?.locationCity && (
                                <div 
                                    className={`network-sidebar-item hover-lift ${activeTab === "city" ? "active" : ""}`}
                                    onClick={() => setActiveTab("city")}
                                    title={`View peers in ${user.locationCity}`}
                                >
                                    <div className="network-item-label-group">
                                        <span>📍</span>
                                        <span className="network-item-truncate">{user.locationCity}</span>
                                    </div>
                                    <span className="network-item-badge">{cityMembers.length}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="network-tips-card">
                        <div className="tips-icon-badge">💡</div>
                        <h4>Expand your campus reach</h4>
                        <p>Connecting with peers from your college and city increases collaboration, internship opportunities, and shared knowledge.</p>
                    </div>
                </aside>

                <main className="network-main-col">

                    <div className="network-tabs-bar">
                        <button
                            type="button"
                            className={`network-filter-tab ${activeTab === "all" ? "active" : ""}`}
                            onClick={() => setActiveTab("all")}
                        >
                            <span>All Recommendations</span>
                            <span className="tab-count-badge">{suggestions.length}</span>
                        </button>

                        <button
                            type="button"
                            className={`network-filter-tab ${activeTab === "received" ? "active" : ""}`}
                            onClick={() => setActiveTab("received")}
                        >
                            <span>📥 Received Invitations</span>
                            <span className={`tab-count-badge ${receivedRequests.length > 0 ? "alert" : ""}`}>
                                {receivedRequests.length}
                            </span>
                        </button>

                        <button
                            type="button"
                            className={`network-filter-tab ${activeTab === "sent" ? "active" : ""}`}
                            onClick={() => setActiveTab("sent")}
                        >
                            <span>📤 Sent Requests</span>
                            <span className="tab-count-badge">{sentRequests.length}</span>
                        </button>

                        {user?.collegeName && (
                            <button
                                type="button"
                                className={`network-filter-tab ${activeTab === "college" ? "active" : ""}`}
                                onClick={() => setActiveTab("college")}
                            >
                                <span>🎓 From {user.collegeName}</span>
                                <span className="tab-count-badge">{collegeMembers.length}</span>
                            </button>
                        )}

                        {user?.locationCity && (
                            <button
                                type="button"
                                className={`network-filter-tab ${activeTab === "city" ? "active" : ""}`}
                                onClick={() => setActiveTab("city")}
                            >
                                <span>📍 In {user.locationCity}</span>
                                <span className="tab-count-badge">{cityMembers.length}</span>
                            </button>
                        )}
                    </div>

                    {activeTab === "received" && (
                        <div className="network-section-card" id="pending-invitations-section">
                            <div className="network-section-header">
                                <div className="section-title-group">
                                    <div className="section-badge-icon invitations">
                                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                            <polyline points="22,6 12,13 2,6" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="network-section-title">Received Invitations</h3>
                                        <span className="network-section-subtitle">
                                            {receivedRequests.length > 0 
                                                ? `${receivedRequests.length} people want to connect with you`
                                                : "Manage incoming requests from peers and classmates"}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="network-invitations-list">
                                {isLoadingRequests ? (
                                    <div className="page-center" style={{ padding: "2rem 0" }}><div className="spinner" /></div>
                                ) : receivedRequests.length === 0 ? (
                                    <div className="network-empty-state-card">
                                        <div className="empty-state-icon-circle">
                                            <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.8">
                                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                                <polyline points="22,6 12,13 2,6" />
                                            </svg>
                                        </div>
                                        <h3>No Pending Invitations</h3>
                                        <p>You don't have any incoming connection requests right now. When peers or classmates send you an invitation, it will appear here!</p>
                                        <Button variant="primary" onClick={() => setActiveTab("all")}>
                                            Explore Recommendations
                                        </Button>
                                    </div>
                                ) : (
                                    receivedRequests.map(req => (
                                        <div key={req._id} className="network-invitation-row">
                                            <div className="invitation-user-info">
                                                <Link to={`/users/${req.sender?.username}`}>
                                                    <img
                                                        src={req.sender?.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                                                        alt={req.sender?.name}
                                                        className="invitation-avatar"
                                                        onError={(e) => {
                                                            e.currentTarget.src = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
                                                        }}
                                                    />
                                                </Link>
                                                <div className="invitation-details">
                                                    <Link to={`/users/${req.sender?.username}`} className="invitation-name">
                                                        <span>{req.sender?.name}</span>
                                                        <span className="profile-verified-badge" style={{ padding: "2px" }}>
                                                            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                                                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                                            </svg>
                                                        </span>
                                                    </Link>
                                                    <span className="invitation-handle">@{req.sender?.username}</span>
                                                    <p className="invitation-bio">
                                                        {req.sender?.bio || req.sender?.collegeName || req.sender?.companyName || "Peer on Waverly"}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="invitation-action-group">
                                                <button
                                                    type="button"
                                                    onClick={() => handleIgnoreRequest(req.sender?._id)}
                                                    className="btn-invitation ignore"
                                                >
                                                    Ignore
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleAcceptRequest(req.sender?._id)}
                                                    className="btn-invitation accept"
                                                >
                                                    Accept
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Active View: Sent Requests */}
                    {activeTab === "sent" && (
                        <div className="network-section-card">
                            <div className="network-section-header">
                                <div className="section-title-group">
                                    <div className="section-badge-icon sent" style={{ background: "rgba(56, 189, 248, 0.12)", color: "var(--text-accent)" }}>
                                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="22" y1="2" x2="11" y2="13" />
                                            <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="network-section-title">Sent Connection Requests</h3>
                                        <span className="network-section-subtitle">{sentRequests.length} invitations sent waiting for response</span>
                                    </div>
                                </div>
                            </div>

                            <div className="network-invitations-list">
                                {isLoadingSent ? (
                                    <div className="page-center" style={{ padding: "2rem 0" }}><div className="spinner" /></div>
                                ) : sentRequests.length === 0 ? (
                                    <div className="network-empty-state-card">
                                        <div className="empty-state-icon-circle">
                                            <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" strokeWidth="1.8">
                                                <line x1="22" y1="2" x2="11" y2="13" />
                                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                            </svg>
                                        </div>
                                        <h3>No Sent Requests</h3>
                                        <p>You haven't sent any pending connection requests yet. Find classmates and alumni to grow your campus network!</p>
                                        <Button variant="primary" onClick={() => setActiveTab("all")}>
                                            Find People
                                        </Button>
                                    </div>
                                ) : (
                                    sentRequests.map(req => {
                                        const target = req.recipient || {};
                                        return (
                                            <div key={req._id} className="network-invitation-row">
                                                <div className="invitation-user-info">
                                                    <Link to={`/users/${target.username}`}>
                                                        <img
                                                            src={target.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                                                            alt={target.name}
                                                            className="invitation-avatar"
                                                            onError={(e) => {
                                                                e.currentTarget.src = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
                                                            }}
                                                        />
                                                    </Link>
                                                    <div className="invitation-details">
                                                        <Link to={`/users/${target.username}`} className="invitation-name">
                                                            <span>{target.name}</span>
                                                            <span className="profile-verified-badge" style={{ padding: "2px" }}>
                                                                <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                                                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                                                </svg>
                                                            </span>
                                                        </Link>
                                                        <span className="invitation-handle">@{target.username}</span>
                                                        <p className="invitation-bio">
                                                            {target.bio || target.collegeName || target.companyName || "Student / Peer on Waverly"}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="invitation-action-group">
                                                    <span className="sent-pending-tag">⏳ Pending Response</span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleWithdrawSentRequest(target._id)}
                                                        className="btn-invitation ignore"
                                                        title="Withdraw request"
                                                    >
                                                        Withdraw
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "all" && (
                        <div className="network-section-card">
                            <div className="network-section-header">
                                <div className="section-title-group">
                                    <div className="section-badge-icon suggestions">
                                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                            <circle cx="9" cy="7" r="4" />
                                            <polyline points="16 11 18 13 22 9" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="network-section-title">People you may know</h3>
                                        <span className="network-section-subtitle">Recommended connections based on your industry and campus profile</span>
                                    </div>
                                </div>
                            </div>

                            <div className="network-grid-body">
                                {isLoadingSuggestions ? (
                                    <div className="page-center" style={{ padding: "3rem 0" }}><div className="spinner" /></div>
                                ) : suggestions.length === 0 ? (
                                    <div className="network-empty-state">
                                        <p>No recommendations available at the moment.</p>
                                    </div>
                                ) : (
                                    <div className="network-user-cards-grid">
                                        {suggestions.map(person => renderUserCard(person, "suggestions"))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "college" && user?.collegeName && (
                        <div className="network-section-card">
                            <div className="network-section-header">
                                <div className="section-title-group">
                                    <div className="section-badge-icon college">🎓</div>
                                    <div>
                                        <h3 className="network-section-title">Campus Peers from {user.collegeName}</h3>
                                        <span className="network-section-subtitle">Connect with your batchmates, seniors, and alumni</span>
                                    </div>
                                </div>
                            </div>

                            <div className="network-grid-body">
                                {isLoadingCollege ? (
                                    <div className="page-center" style={{ padding: "3rem 0" }}><div className="spinner" /></div>
                                ) : collegeMembers.length === 0 ? (
                                    <div className="network-empty-state">
                                        <p>No other members found from {user.collegeName}. Invite your classmates to join!</p>
                                    </div>
                                ) : (
                                    <div className="network-user-cards-grid">
                                        {collegeMembers.map(person => renderUserCard(person, "college"))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "city" && user?.locationCity && (
                        <div className="network-section-card">
                            <div className="network-section-header">
                                <div className="section-title-group">
                                    <div className="section-badge-icon city">📍</div>
                                    <div>
                                        <h3 className="network-section-title">Peers in {user.locationCity}</h3>
                                        <span className="network-section-subtitle">Discover nearby developers, designers, and students</span>
                                    </div>
                                </div>
                            </div>

                            <div className="network-grid-body">
                                {isLoadingCity ? (
                                    <div className="page-center" style={{ padding: "3rem 0" }}><div className="spinner" /></div>
                                ) : cityMembers.length === 0 ? (
                                    <div className="network-empty-state">
                                        <p>No other members found in {user.locationCity}.</p>
                                    </div>
                                ) : (
                                    <div className="network-user-cards-grid">
                                        {cityMembers.map(person => renderUserCard(person, "city"))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </main>
            </div>

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
                                    <p className="modal-subtitle">{totalConnectionsCount} active connections</p>
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
        </div>
    );
};

export default MyNetwork_Page;
