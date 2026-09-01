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

    return (
        <>
            <div className="profile-container">
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
                        </div>
                    )}

                    {/* Quick Edit Cover Button on top right of banner */}
                    <button
                        type="button"
                        className="banner-edit-btn"
                        onClick={() => setIsCropModalOpen(true)}
                        title="Edit Cover / Banner Image"
                    >
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                            <circle cx="12" cy="13" r="4" />
                        </svg>
                        <span>{user?.coverPic ? "Edit Cover" : "Add Cover"}</span>
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
                            >
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                    <circle cx="12" cy="13" r="4" />
                                </svg>
                            </button>
                        </div>

                        {/* Edit Profile Full Page Link */}
                        <Link to="/edit-profile" className="btn btn-secondary btn-edit-profile">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            <span>Edit Profile</span>
                        </Link>
                    </div>

                    {/* Name & Handle */}
                    <div className="profile-names">
                        <h2>
                            {user.name}
                            {user.additionalName && (
                                <span className="profile-additional-name">({user.additionalName})</span>
                            )}
                        </h2>
                        <p className="profile-handle">@{user.username}</p>
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
                outputWidth={1200}
                outputHeight={350}
                allowRemove={true}
            />

            {/* Avatar Crop / Edit Modal */}
            <ImageCropModal
                isOpen={isAvatarModalOpen}
                onClose={() => setIsAvatarModalOpen(false)}
                onSave={handleSaveAvatar}
                currentImage={user?.profilePic || ""}
                title="Edit Profile Picture"
                aspectRatio={1}
                outputWidth={400}
                outputHeight={400}
                allowRemove={false}
            />
        </>
    );
};

export default ProfileHeader;
