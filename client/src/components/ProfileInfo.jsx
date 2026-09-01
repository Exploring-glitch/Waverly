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

    const hasEducationYears = Number(user.startYear) > 0 || Number(user.endYear) > 0;
    const educationYearString = Number(user.startYear) > 0 && Number(user.endYear) > 0
        ? `${user.startYear} – ${user.endYear}`
        : Number(user.startYear) > 0
        ? `Started ${user.startYear}`
        : `Class of ${user.endYear}`;

    return (
        <div className="profile-info-body">
            {/* Bio */}
            {user.bio ? (
                <div className="profile-bio-box">
                    <p className="profile-bio-text">{user.bio}</p>
                </div>
            ) : (
                <div className="profile-bio-empty">
                    <p>No bio added yet. Add a short bio to introduce yourself.</p>
                </div>
            )}

            {/* Metadata Badges / Tags Row */}
            <div className="profile-chips-grid">
                {/* College / Education Tag */}
                {user.collegeName && (
                    <div className="profile-meta-chip education-chip" title="University / College">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                            <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5" />
                        </svg>
                        <span className="chip-primary-text">{user.collegeName}</span>
                        {hasEducationYears && (
                            <span className="chip-secondary-tag">{educationYearString}</span>
                        )}
                    </div>
                )}

                {/* Company Tag */}
                {user.companyName && (
                    <div className="profile-meta-chip company-chip" title="Company / Organization">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
                            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
                        </svg>
                        <span className="chip-primary-text">{user.companyName}</span>
                    </div>
                )}

                {/* Location */}
                {(user.locationCity || user.locationCountry) && (
                    <div className="profile-meta-chip location-chip" title="Location">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span className="chip-primary-text">
                            {[user.locationCity, user.locationCountry].filter(Boolean).join(", ")}
                        </span>
                    </div>
                )}

                {/* Connections Pill */}
                {showConnections && (
                    <button
                        type="button"
                        className="profile-meta-chip connections-chip hover-lift"
                        onClick={handleOpenConnections}
                        title="View connections list"
                    >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        <span className="chip-highlight-text">{connectionCount} connections</span>
                    </button>
                )}

                {/* Email Tag if own profile */}
                {showEmail && user.email && (
                    <div className="profile-meta-chip email-chip" title="Contact email">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                        </svg>
                        <span className="chip-primary-text">{user.email}</span>
                    </div>
                )}
            </div>

            {/* Connections Modal Overlay */}
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
                                    <h3 className="modal-title">Connections</h3>
                                    <p className="modal-subtitle">{connectionCount} active connections</p>
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
                                <div className="connections-loading-state">
                                    <div className="spinner" />
                                </div>
                            ) : connectionsList.length === 0 ? (
                                <div className="connections-empty-state">
                                    <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
                                        <line x1="9" y1="9" x2="9.01" y2="9" />
                                        <line x1="15" y1="9" x2="15.01" y2="9" />
                                    </svg>
                                    <p>No connections yet.</p>
                                </div>
                            ) : (
                                connectionsList.map(member => (
                                    <div key={member._id} className="connection-member-row">
                                        <Link
                                            to={`/users/${member.username}`}
                                            onClick={() => setShowConnectionsModal(false)}
                                            className="connection-avatar-link"
                                        >
                                            <img
                                                src={member.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                                                alt={member.name}
                                                className="connection-avatar-img"
                                                onError={(e) => {
                                                    e.currentTarget.src = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
                                                }}
                                            />
                                        </Link>
                                        <div className="connection-info-col">
                                            <Link
                                                to={`/users/${member.username}`}
                                                onClick={() => setShowConnectionsModal(false)}
                                                className="connection-name-link"
                                            >
                                                {member.name}
                                            </Link>
                                            <span className="connection-handle-text">@{member.username}</span>
                                            {member.collegeName && (
                                                <span className="connection-college-text">🎓 {member.collegeName}</span>
                                            )}
                                        </div>
                                        <Link
                                            to={`/users/${member.username}`}
                                            onClick={() => setShowConnectionsModal(false)}
                                            className="btn btn-secondary btn-sm"
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
        </div>
    );
};

export default ProfileInfo;
