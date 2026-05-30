import { Link } from "react-router-dom";
import ProfileInfo from "./ProfileInfo";

const ProfileHeader = ({ user }) => {
    return (
        <div className="profile-container">
            {/* Banner */}
            <div className="profile-banner"></div>

            <div className="profile-info-section">
                <div className="profile-meta">
                    {/* Avatar */}
                    <div className="profile-avatar-wrapper">
                        <img
                            src={user.profilePic}
                            alt={user.name}
                            className="profile-avatar"
                        />
                    </div>
                    {/* Edit Button Link */}
                    <Link to="/edit-profile" className="btn btn-secondary">
                        Edit Profile
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

                <ProfileInfo user={user} />
            </div>
        </div>
    );
};

export default ProfileHeader;
