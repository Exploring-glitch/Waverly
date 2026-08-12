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
    const [followedUsers, setFollowedUsers] = useState({});
    const [isCollegeModalOpen, setIsCollegeModalOpen] = useState(false);
    const [isRecommendModalOpen, setIsRecommendModalOpen] = useState(false);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                const users = await userApi.getRecommendedUsers();
                setUsersToFollow(users || []);
            } catch (err) {
                console.error("Failed to fetch recommended users", err);
            }
        };

        const fetchCollegePeers = async () => {
            if (user?.collegeName) {
                try {
                    const data = await userApi.getCollegeMembers(user.collegeName);
                    if (data && data.members) {
                        const filtered = data.members.filter(m => m._id !== user._id);
                        // Sort alphabetically by name
                        filtered.sort((a, b) => a.name.localeCompare(b.name));
                        setCollegeUsers(filtered);
                    }
                } catch (err) {
                    console.error("Failed to fetch college members", err);
                }
            }
        };

        if (user) {
            fetchRecommendations();
            fetchCollegePeers();
        }
    }, [user]);

    if (!user) {
        return <div className="page-center"><div className="spinner" /></div>;
    }

    return (
        <>
            <div className="profile-grid">
                <div className="profile-main-content">
                    <ProfileHeader user={user} />
                    <ProfileAbout user={user} isOwnProfile={true} />
                    <ProfileSkills user={user} isOwnProfile={true} />
                    <ProfileActivity />
                </div>

                <div className="profile-right-sidebar">
                    {/* People You May Know - From your University/Clg */}
                    <div className="widget-card" style={{ padding: '0' }}>
                        <div style={{ padding: '1.25rem 1.25rem 0 1.25rem' }}>
                            <h3 className="widget-title" style={{ margin: 0 }}>People you may know</h3>
                            <p style={{ margin: '0.15rem 0 0 0', fontSize: '0.75rem', color: '#71767b', fontWeight: '600' }}>
                                From your University/Clg
                            </p>
                        </div>
                        <div className="widget-list" style={{ marginTop: '0.5rem', padding: '0 1.25rem 1.25rem 1.25rem' }}>
                            {!user.collegeName ? (
                                <div style={{ fontSize: '0.8rem', color: '#71767b', padding: '0.5rem 0' }}>
                                    Add your university/college to your profile to find peers.
                                </div>
                            ) : collegeUsers.length > 0 ? (
                                collegeUsers.slice(0, 5).map(item => (
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
                                <div style={{ fontSize: '0.8rem', color: '#71767b', padding: '0.5rem 0' }}>
                                    No members from your university/college found.
                                </div>
                            )}
                        </div>
                        {user.collegeName && collegeUsers.length > 5 && (
                            <button className="show-all-btn" onClick={() => setIsCollegeModalOpen(true)}>
                                Show all
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* People You May Know */}
                    <div className="widget-card" style={{ marginTop: '0.75rem', padding: '0' }}>
                        <div style={{ padding: '1.25rem 1.25rem 0 1.25rem' }}>
                            <h3 className="widget-title" style={{ margin: 0 }}>People you may know</h3>
                        </div>
                        <div className="widget-list" style={{ marginTop: '0.5rem', padding: '0 1.25rem 1.25rem 1.25rem' }}>
                            {usersToFollow.length > 0 ? (
                                usersToFollow.slice(0, 5).map(item => (
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
                        {usersToFollow.length > 5 && (
                            <button className="show-all-btn" onClick={() => setIsRecommendModalOpen(true)}>
                                Show all
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                    <polyline points="12 5 19 12 12 19"></polyline>
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* University Peers Modal */}
            {isCollegeModalOpen && (
                <div className="modal-overlay" onClick={() => setIsCollegeModalOpen(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3 className="modal-title">People you may know</h3>
                                <p className="modal-subtitle">From {user.collegeName}</p>
                            </div>
                            <button className="modal-close-btn" onClick={() => setIsCollegeModalOpen(false)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body">
                            {collegeUsers.map(item => (
                                <div key={item._id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', paddingBottom: '0.75rem', borderBottom: '1px solid #2f3336' }}>
                                    <Link to={`/users/${item.username}`} onClick={() => setIsCollegeModalOpen(false)}>
                                        <img
                                            src={item.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                                            alt={item.name}
                                            style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                                        />
                                    </Link>
                                    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0 }}>
                                        <Link to={`/users/${item.username}`} onClick={() => setIsCollegeModalOpen(false)} style={{ fontSize: '0.95rem', fontWeight: '700', color: '#e7e9ea', textDecoration: 'none' }} className="hover-underline">
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
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* General Recommendations Modal */}
            {isRecommendModalOpen && (
                <div className="modal-overlay" onClick={() => setIsRecommendModalOpen(false)}>
                    <div className="modal-box" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <div>
                                <h3 className="modal-title">People you may know</h3>
                                <p className="modal-subtitle">Recommended for you</p>
                            </div>
                            <button className="modal-close-btn" onClick={() => setIsRecommendModalOpen(false)}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body">
                            {[...usersToFollow].sort((a, b) => a.name.localeCompare(b.name)).map(item => (
                                <div key={item._id} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', paddingBottom: '0.75rem', borderBottom: '1px solid #2f3336' }}>
                                    <Link to={`/users/${item.username}`} onClick={() => setIsRecommendModalOpen(false)}>
                                        <img
                                            src={item.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                                            alt={item.name}
                                            style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                                        />
                                    </Link>
                                    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0 }}>
                                        <Link to={`/users/${item.username}`} onClick={() => setIsRecommendModalOpen(false)} style={{ fontSize: '0.95rem', fontWeight: '700', color: '#e7e9ea', textDecoration: 'none' }} className="hover-underline">
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
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Profile_Page;
