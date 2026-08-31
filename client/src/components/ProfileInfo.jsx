import { useState } from "react";
import { Link } from "react-router-dom";
import { userApi } from "../services/api";

const ProfileInfo = ({ user, showEmail = true, connectionCount = 0, showConnections = false }) => {
    const [showConnectionsModal, setShowConnectionsModal] = useState(false);
    const [connectionsList, setConnectionsList] = useState([]);
    const [isFetchingConnections, setIsFetchingConnections] = useState(false);

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

    return (
        <>
            {/* Bio */}
            {user.bio ? (
                <p className="profile-bio">{user.bio}</p>
            ) : (
                <p className="profile-bio" style={{ color: "#71767b", fontStyle: "italic" }}>
                    No bio added yet.
                </p>
            )}

            {/* Location */}
            {(user.locationCity || user.locationCountry) && (
                <p className="profile-location" style={{ margin: '0.15rem 0 0.25rem 0', fontSize: '0.9rem', color: '#71767b' }}>
                    {[user.locationCity, user.locationCountry].filter(Boolean).join(", ")}
                </p>
            )}

            {/* Connections */}
            {showConnections && (
                <p className="profile-connections" style={{ margin: '0.25rem 0 1rem 0', fontSize: '0.9rem', color: '#1d9bf0', fontWeight: '600' }}>
                    <span className="hover-underline" style={{ cursor: 'pointer' }} onClick={handleOpenConnections}>
                        {connectionCount} connections
                    </span>
                </p>
            )}

            {/* Connections Modal Overlay */}
            {showConnectionsModal && (
                <div className="post-modal-overlay" onClick={() => setShowConnectionsModal(false)}>
                    <div className="post-modal-container" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '450px' }}>
                        <div className="post-modal-header">
                            <h2>Connections</h2>
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
                                            className="btn btn-secondary"
                                            style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem', borderRadius: '20px' }}
                                        >
                                            View
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* College details and email */}
            <div className="profile-metadata">
                {user.collegeName && (
                    <div className="metadata-item">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M22 7.24L12 3.3 2 7.24l10 3.93L22 7.24zM2.5 12h1v4h-1v-4zm15.5 0h1v4h-1v-4zM12 18.25L4.5 15.3v-4.06l7.5 2.95 7.5-2.95v4.06l-7.5 2.95z" />
                        </svg>
                        <span>{user.collegeName}</span>
                    </div>
                )}
                {user.companyName && (
                    <div className="metadata-item">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M3 21h18v-2H3v2zM3 8v8h4V8H3zm6 0v8h4V8H9zm6 0v8h4V8h-4zM3 3v4h18V3H3z" />
                        </svg>
                        <span>{user.companyName}</span>
                    </div>
                )}
                {((Number(user.startYear) > 0) || (Number(user.endYear) > 0)) ? (
                    <div className="metadata-item">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M19 4h-2V3c0-.55-.45-1-1-1s-1 .45-1 1v1H9V3c0-.55-.45-1-1-1s-1 .45-1 1v1H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V8h14v12z" />
                        </svg>
                        <span>
                            {Number(user.startYear) > 0 && Number(user.endYear) > 0
                                ? `${user.startYear} - ${user.endYear}`
                                : Number(user.startYear) > 0
                                ? `${user.startYear}`
                                : `${user.endYear}`}
                        </span>
                    </div>
                ) : null}
                {showEmail && (
                <div className="metadata-item">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M1.998 5.5c0-1.381 1.11-2.5 2.5-2.5h15c1.38 0 2.5 1.119 2.5 2.5v13c0 1.381-1.12 2.5-2.5 2.5h-15c-1.39 0-2.5-1.119-2.5-2.5v-13zm2.5-.5c-.276 0-.5.224-.5.5v.19l7.585 5.56c.249.18.581.18.83 0l7.585-5.56V5.5c0-.276-.224-.5-.5-.5h-15zm15.5 2.19l-7.234 5.3c-.456.33-1.076.33-1.532 0L3.998 7.19V18c0 .28.224.5.5.5h15c.28 0 .5-.22.5-.5V7.19z" />
                    </svg>
                    <span>{user.email}</span>
                </div>
                )}
            </div>
        </>
    );
};

export default ProfileInfo;
