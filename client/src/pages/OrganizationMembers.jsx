import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { userApi } from "../services/api";

const OrganizationMembers_Page = ({ type }) => {
    const { name } = useParams();
    const decodedName = decodeURIComponent(name);

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const isCollege = type === "college";
    const label = isCollege ? "College" : "Company";

    useEffect(() => {
        const fetchMembers = async () => {
            setLoading(true);
            setError("");

            try {
                const result = isCollege
                    ? await userApi.getCollegeMembers(decodedName)
                    : await userApi.getCompanyMembers(decodedName);
                setData(result);
            } catch (err) {
                setError(err.message || "Failed to load members");
            } finally {
                setLoading(false);
            }
        };

        fetchMembers();
    }, [decodedName, isCollege]);

    if (loading) {
        return <div className="page-center"><div className="spinner" /></div>;
    }

    if (error || !data) {
        return (
            <div className="page-center">
                <p>{error || `${label} not found`}</p>
                <Link to="/search">Back to search</Link>
            </div>
        );
    }

    return (
        <div className="page search-page">
            <div className="search-header">
                <Link to="/search" className="search-back-link">&larr; Back to search</Link>
                <div className="search-org-header">
                    <div className={`search-org-icon ${type}`}>
                        {isCollege ? (
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M22 7.24L12 3.3 2 7.24l10 3.93L22 7.24zM2.5 12h1v4h-1v-4zm15.5 0h1v4h-1v-4zM12 18.25L4.5 15.3v-4.06l7.5 2.95 7.5-2.95v4.06l-7.5 2.95z" />
                            </svg>
                        ) : (
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path d="M3 21h18v-2H3v2zM3 8v8h4V8H3zm6 0v8h4V8H9zm6 0v8h4V8h-4zM3 3v4h18V3H3z" />
                            </svg>
                        )}
                    </div>
                    <div>
                        <p className="search-org-type">{label}</p>
                        <h1>{data.name}</h1>
                        <p className="search-subtitle">
                            {data.memberCount} {data.memberCount === 1 ? "member" : "members"}
                        </p>
                    </div>
                </div>
            </div>

            {data.members.length > 0 ? (
                <div className="search-user-list">
                    {data.members.map((user) => (
                        <Link
                            key={user._id}
                            to={`/users/${user.username}`}
                            className="search-user-card"
                        >
                            <img
                                src={user.profilePic}
                                alt={user.name}
                                className="search-user-avatar"
                            />
                            <div className="search-user-info">
                                <span className="search-user-name">{user.name}</span>
                                {user.additionalName && (
                                    <span className="search-user-additional">
                                        ({user.additionalName})
                                    </span>
                                )}
                                <span className="search-user-handle">@{user.username}</span>
                                {user.bio && (
                                    <span className="search-user-bio">{user.bio}</span>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="search-empty">
                    <p>No members found</p>
                </div>
            )}
        </div>
    );
};

export default OrganizationMembers_Page;
