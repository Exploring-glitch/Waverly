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
    const [followedUsers, setFollowedUsers] = useState({});

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const users = await userApi.getRecommendedUsers();
                setUsersToFollow(users || []);
            } catch (err) {
                console.error("Failed to fetch recommended users", err);
            }
        };
        if (user) {
            fetchRecommendations();
        }
    }, [user]);

    if (!user) {
        return <div className="page-center"><div className="spinner" /></div>;
    }

    return (
        <div className="profile-grid">
            <div className="profile-main-content">
                <ProfileHeader user={user} />
                <ProfileAbout user={user} isOwnProfile={true} />
                <ProfileSkills user={user} isOwnProfile={true} />
                <ProfileActivity />
            </div>

            <div className="profile-right-sidebar">
                {/* People You May Know */}
                <div className="widget-card">
                    <h3 className="widget-title">People you may know</h3>
                    <div className="widget-list" style={{ marginTop: '0.25rem' }}>
                        {usersToFollow.length > 0 ? (
                            usersToFollow.map(item => (
                                <div key={item._id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', paddingBottom: '0.75rem', marginBottom: '0.75rem', borderBottom: '1px solid #2f3336' }}>
                                    <Link to={`/users/${item.username}`}>
                                        <img
                                            src={item.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                                            alt={item.name}
                                            style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                                        />
                                    </Link>
                                    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0 }}>
                                        <Link to={`/users/${item.username}`} style={{ fontSize: '0.95rem', fontWeight: '700', color: '#e7e9ea', textDecoration: 'none' }} className="hover-underline">
                                            {item.name}
                                        </Link>
                                        <span style={{ fontSize: '0.8rem', color: '#71767b', lineHeight: '1.25', margin: '0.15rem 0 0.45rem 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {item.bio || item.collegeName || item.companyName || "Waverly Member"}
                                        </span>
                                        <button
                                            onClick={() => setFollowedUsers(prev => ({ ...prev, [item._id]: !prev[item._id] }))}
                                            style={{
                                                background: 'transparent',
                                                border: followedUsers[item._id] ? '1px solid #71767b' : '1px solid #1d9bf0',
                                                color: followedUsers[item._id] ? '#71767b' : '#1d9bf0',
                                                borderRadius: '20px',
                                                padding: '0.3rem 0.9rem',
                                                fontSize: '0.75rem',
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
            </div>
        </div>
    );
};

export default Profile_Page;
