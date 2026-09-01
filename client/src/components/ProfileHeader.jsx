import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ProfileInfo from "./ProfileInfo";
import ImageCropModal from "./ImageCropModal";

const ProfileHeader = ({ user, connectionCount = 0 }) => {
    const { updateProfile } = useAuth();
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
    const [coverLoading, setCoverLoading] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    const handleSaveCover = async (croppedCoverUrl) => {
        setCoverLoading(true);
        try {
            await updateProfile({ coverPic: croppedCoverUrl });
        } catch (err) {
            console.error("Failed to update cover picture:", err);
        } finally {
            setCoverLoading(false);
        }
    };

    const handleSaveAvatar = async (croppedAvatarUrl) => {
        try {
            await updateProfile({ profilePic: croppedAvatarUrl });
        } catch (err) {
            console.error("Failed to update avatar:", err);
        }
    };

    const handleShareProfile = () => {
        const profileUrl = `${window.location.origin}/users/${user.username}`;
        navigator.clipboard.writeText(profileUrl);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
    };

    return (
        <>
            <div className="profile-container profile-card-elevated">
                {/* Profile Cover / Banner */}
                <div className="profile-banner-container">
                    {user?.coverPic ? (
                        <img
                            src={user.coverPic}
                            alt="Profile Banner"
                            className="profile-banner-image"
                        />
                    ) : (
                        <div className="profile-banner-default">
                            <div className="profile-banner-glow" />
                            <div className="profile-banner-pattern-overlay" />
                        </div>
                    )}

                    {/* Quick Edit Cover Button */}
                    <button
                        type="button"
                        className="banner-edit-btn"
                        onClick={() => setIsCropModalOpen(true)}
                        title="Edit Cover Banner"
                    >
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                            <circle cx="12" cy="13" r="4" />
                        </svg>
                        <span>{user?.coverPic ? "Change Cover" : "Add Cover"}</span>
                    </button>
                </div>

                <div className="profile-info-section">
                    <div className="profile-meta">
                        {/* Avatar with quick edit camera hover */}
                        <div className="profile-avatar-wrapper">
                            <img
                                src={user.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                                alt={user.name}
                                className="profile-avatar"
                                onError={(e) => {
                                    e.currentTarget.src = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
                                }}
                            />
                            <button
                                type="button"
                                className="avatar-edit-badge"
                                onClick={() => setIsAvatarModalOpen(true)}
                                title="Change Profile Picture"
                                aria-label="Change Profile Picture"
                            >
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                    <circle cx="12" cy="13" r="4" />
                                </svg>
                            </button>
                        </div>

                        {/* Profile Action Buttons (Edit + Share) */}
                        <div className="profile-action-buttons">
                            <button
                                type="button"
                                className="btn btn-secondary btn-share-profile"
                                onClick={handleShareProfile}
                                title="Copy Profile Link"
                            >
                                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                                    <polyline points="16 6 12 2 8 6" />
                                    <line x1="12" y1="2" x2="12" y2="15" />
                                </svg>
                                <span>{copiedLink ? "Link Copied!" : "Share"}</span>
                            </button>

                            <Link to="/edit-profile" className="btn btn-primary btn-edit-profile">
                                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                                <span>Edit Profile</span>
                            </Link>
                        </div>
                    </div>

                    {/* Name & Handle */}
                    <div className="profile-names">
                        <div className="profile-name-row">
                            <h2 className="profile-display-name">
                                {user.name}
                                {user.additionalName && (
                                    <span className="profile-additional-name">({user.additionalName})</span>
                                )}
                            </h2>
                            <span className="profile-verified-badge" title="Verified Waverly Member">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                                </svg>
                            </span>
                        </div>
                        <div className="profile-handle-row">
                            <span className="profile-handle-pill">@{user.username}</span>
                            {user.collegeName && (
                                <span className="profile-institution-tag">
                                    🎓 {user.collegeName}
                                </span>
                            )}
                        </div>
                    </div>

                    <ProfileInfo user={user} connectionCount={connectionCount} showConnections={true} />
                </div>
            </div>

            {/* Banner Crop / Edit Modal */}
            <ImageCropModal
                isOpen={isCropModalOpen}
                onClose={() => setIsCropModalOpen(false)}
                onSave={handleSaveCover}
                currentImage={user?.coverPic || ""}
                title="Edit Profile Banner"
                aspectRatio={3.6}
                cropShape="rect"
                outputWidth={1200}
                allowRemove={true}
            />

            {/* Avatar Crop / Edit Modal */}
            <ImageCropModal
                isOpen={isAvatarModalOpen}
                onClose={() => setIsAvatarModalOpen(false)}
                onSave={handleSaveAvatar}
                currentImage={user?.profilePic || ""}
                title="Edit Profile Photo"
                aspectRatio={1}
                cropShape="round"
                outputWidth={400}
                allowRemove={false}
            />
        </>
    );
};

export default ProfileHeader;
