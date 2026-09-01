import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "../components/Button";

const Home_Page = () => {
    const { user } = useAuth();

    return (
        <div className="home-page-container">

            <div className="home-ambient-glow" />

            <div className="home-content">

                <div className="home-hero-section">
                    <div className="home-hero-badge">
                        <span className="badge-dot" />
                        <span>The next-generation campus & alumni platform</span>
                    </div>

                    <h1 className="home-hero-title">
                        Where ambitious minds <span className="text-gradient">connect</span> &{" "}
                        <span className="text-gradient-cyan">grow</span>.
                    </h1>

                    <p className="home-hero-subtitle">
                        Connect with peers across colleges, discover opportunities, share ideas, and build meaningful professional relationships across institutional networks.
                    </p>

                    <div className="home-hero-cta-group">
                        {user ? (
                            <>
                                <Link to="/feed">
                                    <Button variant="primary" size="lg">
                                        Go to your Feed →
                                    </Button>
                                </Link>
                                <Link to="/profile">
                                    <Button variant="secondary" size="lg">
                                        View Profile
                                    </Button>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Link to="/register">
                                    <Button variant="primary" size="lg">
                                        Join Waverly for free
                                    </Button>
                                </Link>
                                <Link to="/login">
                                    <Button variant="secondary" size="lg">
                                        Sign in to account
                                    </Button>
                                </Link>
                            </>
                        )}
                    </div>
                </div>

                <div className="home-features-grid">
                    <div className="home-feature-card">
                        <div className="feature-icon-badge">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </div>
                        <h3>Campus & Alumni Circles</h3>
                        <p>Discover students, faculty, and alumni from your institution and collaborate across universities worldwide.</p>
                    </div>

                    <div className="home-feature-card">
                        <div className="feature-icon-badge">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                            </svg>
                        </div>
                        <h3>Verified Institutional Profiles</h3>
                        <p>Showcase your academic journey, verified degree credentials, technical skills, projects, and career milestones.</p>
                    </div>

                    <div className="home-feature-card">
                        <div className="feature-icon-badge">
                            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                        <h3>Insightful Feed & Discussions</h3>
                        <p>Engage in substantive discussions, share project milestones, find project partners, and gain mentorship.</p>
                    </div>
                </div>

                {user && (
                    <div className="home-authenticated-status-card">
                        <div className="status-avatar-col">
                            <img
                                src={user.profilePic || "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"}
                                alt={user.name}
                                className="status-avatar"
                            />
                        </div>
                        <div className="status-info-col">
                            <h4>Signed in as {user.name} <span className="status-handle">(@{user.username})</span></h4>
                            <p className="status-email">{user.email}</p>
                            <div className="status-tags">
                                <span className="status-tag verified-badge">
                                    {user.isCollegeVerified ? "✓ Verified Institution" : "⚡ Active Member"}
                                </span>
                                {user.college && <span className="status-tag">{user.college}</span>}
                            </div>
                        </div>
                        <div className="status-action-col">
                            <Link to="/feed">
                                <Button variant="primary" size="md">
                                    Open Feed
                                </Button>
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Home_Page;
