import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { userApi } from "../services/api";
import { useAuth } from "../context/AuthContext";

const MyNetwork_Page = () => {
    const { user } = useAuth();
    const [receivedRequests, setReceivedRequests] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [cityMembers, setCityMembers] = useState([]);
    const [collegeMembers, setCollegeMembers] = useState([]);
    const [totalConnectionsCount, setTotalConnectionsCount] = useState(0);
    
    const [isLoadingRequests, setIsLoadingRequests] = useState(true);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
    const [isLoadingCity, setIsLoadingCity] = useState(false);
    const [isLoadingCollege, setIsLoadingCollege] = useState(false);

    const fetchData = async () => {
        // Fetch received requests
        try {
            const reqs = await userApi.getReceivedConnections();
            setReceivedRequests(reqs || []);
        } catch (err) {
            console.error("Failed to load connection requests", err);
        } finally {
            setIsLoadingRequests(false);
        }

        // Fetch general suggestions
        try {
            const recs = await userApi.getRecommendedUsers();
            const filtered = (recs || []).filter(u => u._id !== user?._id);
            filtered.sort((a, b) => a.name.localeCompare(b.name));
            setSuggestions(filtered);
        } catch (err) {
            console.error("Failed to load suggestions", err);
        } finally {
            setIsLoadingSuggestions(false);
        }

        // Fetch city peers
        if (user?.locationCity) {
            setIsLoadingCity(true);
            try {
                const data = await userApi.getCityMembers(user.locationCity);
                if (data && data.members) {
                    const filtered = data.members.filter(m => m._id !== user._id);
                    filtered.sort((a, b) => a.name.localeCompare(b.name));
                    setCityMembers(filtered);
                }
            } catch (err) {
                console.error("Failed to load city members", err);
            } finally {
                setIsLoadingCity(false);
            }
        }

        // Fetch college peers
        if (user?.collegeName) {
            setIsLoadingCollege(true);
            try {
                const data = await userApi.getCollegeMembers(user.collegeName);
                if (data && data.members) {
                    const filtered = data.members.filter(m => m._id !== user._id);
                    filtered.sort((a, b) => a.name.localeCompare(b.name));
                    setCollegeMembers(filtered);
                }
            } catch (err) {
                console.error("Failed to load college members", err);
            } finally {
                setIsLoadingCollege(false);
            }
        }

        // Fetch connection stats
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
            setReceivedRequests(prev => prev.filter(req => req.sender._id !== senderId));
            setTotalConnectionsCount(prev => prev + 1);

            // Update status in list views if present
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
            setReceivedRequests(prev => prev.filter(req => req.sender._id !== senderId));
        } catch (err) {
            console.error("Failed to ignore connection request", err);
            alert("Error ignoring connection request");
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
        } catch (err) {
            console.error("Failed to cancel connection request", err);
            alert("Error cancelling connection request");
        }
    };

    const renderUserCard = (person, listType) => (
        <div key={person._id} style={{ border: '1px solid #38444d', borderRadius: '12px', overflow: 'hidden', background: '#192734', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '1rem', textAlign: 'center' }}>
            <Link to={`/users/${person.username}`} style={{ textDecoration: 'none' }}>
                <img
                    src={person.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                    alt={person.name}
                    style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', marginBottom: '0.75rem', border: '2px solid #38444d' }}
                />
            </Link>
            <Link to={`/users/${person.username}`} style={{ textDecoration: 'none', color: '#fff', fontWeight: 'bold', fontSize: '0.88rem', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} className="hover-underline">
                {person.name}
            </Link>
            <span style={{ fontSize: '0.72rem', color: '#8899a6', margin: '0.25rem 0 1rem 0', minHeight: '32px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.25' }}>
                {person.bio || person.collegeName || person.companyName || `@${person.username}`}
            </span>
            
            <div style={{ marginTop: 'auto', width: '100%' }}>
                {person.connectionStatus === "accepted" ? (
                    <button
                        disabled
                        className="btn btn-secondary"
                        style={{ width: '100%', padding: '0.35rem 0', fontSize: '0.78rem', borderRadius: '20px', cursor: 'default', opacity: 0.7 }}
                    >
                        Connected
                    </button>
                ) : person.connectionStatus === "pending_sent" ? (
                    <button
                        onClick={() => handleCancelRequest(person._id, listType)}
                        className="btn btn-secondary"
                        style={{ width: '100%', padding: '0.35rem 0', fontSize: '0.78rem', borderRadius: '20px' }}
                    >
                        Pending
                    </button>
                ) : person.connectionStatus === "pending_received" ? (
                    <button
                        onClick={() => handleAcceptRequest(person._id)}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '0.35rem 0', fontSize: '0.78rem', borderRadius: '20px' }}
                    >
                        Accept
                    </button>
                ) : (
                    <button
                        onClick={() => handleConnect(person._id, listType)}
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '0.35rem 0', fontSize: '0.78rem', borderRadius: '20px' }}
                    >
                        Connect
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <div className="page" style={{ maxWidth: '1128px', margin: '0 auto', padding: '1rem' }}>
            <div className="feed-container" style={{ display: 'grid', gridTemplateColumns: '290px 1fr', gap: '1.5rem', alignItems: 'start', maxWidth: 'none' }}>
                
                {/* Left Sidebar */}
                <div className="feed-sidebar" style={{ background: '#15202b', borderRadius: '16px', border: '1px solid #38444d', overflow: 'hidden', padding: '1.25rem' }}>
                    <h3 style={{ margin: '0 0 1rem 0', color: '#fff', fontSize: '1.1rem', fontWeight: 'bold', borderBottom: '1px solid #38444d', paddingBottom: '0.75rem' }}>
                        Manage My Network
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', width: '100%' }}>
                            <span style={{ color: '#8899a6', fontSize: '0.92rem' }}>Connections</span>
                            <span style={{ color: '#1d9bf0', fontWeight: 'bold', fontSize: '0.92rem', marginLeft: 'auto' }}>{totalConnectionsCount}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', width: '100%' }}>
                            <span style={{ color: '#8899a6', fontSize: '0.92rem' }}>Pending Invitations</span>
                            <span style={{ color: '#1d9bf0', fontWeight: 'bold', fontSize: '0.92rem', marginLeft: 'auto' }}>{receivedRequests.length}</span>
                        </div>
                    </div>
                </div>

                {/* Right Content */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    
                    {/* Received Invitations Section */}
                    <div style={{ background: '#15202b', borderRadius: '16px', border: '1px solid #38444d', overflow: 'hidden' }}>
                        <div style={{ padding: '1.25rem', borderBottom: '1px solid #38444d' }}>
                            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}>
                                Invitations ({receivedRequests.length})
                            </h3>
                        </div>
                        
                        <div style={{ padding: '1.25rem' }}>
                            {isLoadingRequests ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
                                    <div className="spinner" />
                                </div>
                            ) : receivedRequests.length === 0 ? (
                                <p style={{ color: '#8899a6', margin: 0, textAlign: 'center', padding: '1.5rem 0' }}>
                                    No pending invitations.
                                </p>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    {receivedRequests.map(req => (
                                        <div key={req._id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid #38444d' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                                                <Link to={`/users/${req.sender.username}`}>
                                                    <img
                                                        src={req.sender.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                                                        alt={req.sender.name}
                                                        style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                                                    />
                                                </Link>
                                                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                                    <Link to={`/users/${req.sender.username}`} style={{ textDecoration: 'none', color: '#fff', fontWeight: 'bold', fontSize: '0.95rem' }} className="hover-underline">
                                                        {req.sender.name}
                                                    </Link>
                                                    <span style={{ fontSize: '0.8rem', color: '#8899a6', marginTop: '0.15rem', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                        {req.sender.bio || req.sender.collegeName || req.sender.companyName || `@${req.sender.username}`}
                                                    </span>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                                <button
                                                    onClick={() => handleIgnoreRequest(req.sender._id)}
                                                    className="btn btn-secondary"
                                                    style={{ padding: '0.4rem 1rem', fontSize: '0.82rem', borderRadius: '20px' }}
                                                >
                                                    Ignore
                                                </button>
                                                <button
                                                    onClick={() => handleAcceptRequest(req.sender._id)}
                                                    className="btn btn-primary"
                                                    style={{ padding: '0.4rem 1rem', fontSize: '0.82rem', borderRadius: '20px' }}
                                                >
                                                    Accept
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* People in My City */}
                    {user?.locationCity && (
                        <div style={{ background: '#15202b', borderRadius: '16px', border: '1px solid #38444d', overflow: 'hidden' }}>
                            <div style={{ padding: '1.25rem', borderBottom: '1px solid #38444d' }}>
                                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}>
                                    People you may know in {user.locationCity}
                                </h3>
                            </div>
                            
                            <div style={{ padding: '1.25rem' }}>
                                {isLoadingCity ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
                                        <div className="spinner" />
                                    </div>
                                ) : cityMembers.length === 0 ? (
                                    <p style={{ color: '#8899a6', margin: 0, textAlign: 'center', padding: '1.5rem 0' }}>
                                        No other members found in {user.locationCity}.
                                    </p>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                        {cityMembers.map(person => renderUserCard(person, "city"))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* People from My College */}
                    {user?.collegeName && (
                        <div style={{ background: '#15202b', borderRadius: '16px', border: '1px solid #38444d', overflow: 'hidden' }}>
                            <div style={{ padding: '1.25rem', borderBottom: '1px solid #38444d' }}>
                                <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}>
                                    People you may know from {user.collegeName}
                                </h3>
                            </div>
                            
                            <div style={{ padding: '1.25rem' }}>
                                {isLoadingCollege ? (
                                    <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
                                        <div className="spinner" />
                                    </div>
                                ) : collegeMembers.length === 0 ? (
                                    <p style={{ color: '#8899a6', margin: 0, textAlign: 'center', padding: '1.5rem 0' }}>
                                        No other members found from {user.collegeName}.
                                    </p>
                                ) : (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                        {collegeMembers.map(person => renderUserCard(person, "college"))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Recommendations / People You May Know */}
                    <div style={{ background: '#15202b', borderRadius: '16px', border: '1px solid #38444d', overflow: 'hidden' }}>
                        <div style={{ padding: '1.25rem', borderBottom: '1px solid #38444d' }}>
                            <h3 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: 'bold' }}>
                                People you may know
                            </h3>
                        </div>
                        
                        <div style={{ padding: '1.25rem' }}>
                            {isLoadingSuggestions ? (
                                <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem 0' }}>
                                    <div className="spinner" />
                                </div>
                            ) : suggestions.length === 0 ? (
                                <p style={{ color: '#8899a6', margin: 0, textAlign: 'center', padding: '1.5rem 0' }}>
                                    No recommendations at the moment.
                                </p>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                                    {suggestions.map(person => renderUserCard(person, "suggestions"))}
                                </div>
                            )}
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default MyNetwork_Page;
