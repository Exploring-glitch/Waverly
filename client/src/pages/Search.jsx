import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { searchApi } from "../services/api";
import PostCard from "../components/PostCard";

const TABS = [
    { id: "all", label: "All" },
    { id: "users", label: "People" },
    { id: "colleges", label: "Colleges" },
    { id: "companies", label: "Companies" },
    { id: "posts", label: "Posts" },
];

const Search_Page = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const query = searchParams.get("q") || "";
    const tab = searchParams.get("tab") || "all";

    const [inputValue, setInputValue] = useState(query);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const runSearch = useCallback(async (searchQuery, searchTab) => {
        if (!searchQuery.trim()) {
            setResults(null);
            setError("");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const data = await searchApi.search(searchQuery.trim(), searchTab);
            setResults(data);
        } catch (err) {
            setError(err.message || "Search failed");
            setResults(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        setInputValue(query);
        runSearch(query, tab);
    }, [query, tab, runSearch]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const trimmed = inputValue.trim();
        if (!trimmed) return;
        setSearchParams({ q: trimmed, tab });
    };

    const handleTabChange = (nextTab) => {
        if (query) {
            setSearchParams({ q: query, tab: nextTab });
        } else {
            setSearchParams({ tab: nextTab });
        }
    };

    const showSection = (section) => tab === "all" || tab === section;

    const hasResults =
        results &&
        (results.users.length > 0 ||
            results.colleges.length > 0 ||
            results.companies.length > 0 ||
            results.posts.length > 0);

    return (
        <div className="page search-page">
            <div className="search-header">
                <h1>Search</h1>
                <p className="search-subtitle">Find people, colleges, companies, and posts</p>
            </div>

            <form className="search-form" onSubmit={handleSubmit}>
                <div className="search-input-wrapper">
                    <svg className="search-icon" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M10.25 3.75c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5c1.795 0 3.419-.726 4.596-1.904l4.154 4.154a1 1 0 1 0 1.414-1.414l-4.154-4.154A6.457 6.457 0 0 0 16.75 10.25c0-3.59-2.91-6.5-6.5-6.5z" />
                    </svg>
                    <input
                        type="search"
                        className="search-input"
                        placeholder="Search Waverly..."
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                </div>
                <button type="submit" className="btn btn-primary search-submit">
                    Search
                </button>
            </form>

            <div className="search-tabs">
                {TABS.map(({ id, label }) => (
                    <button
                        key={id}
                        type="button"
                        className={`search-tab ${tab === id ? "active" : ""}`}
                        onClick={() => handleTabChange(id)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {loading && (
                <div className="search-status">
                    <div className="spinner" />
                </div>
            )}

            {error && <div className="alert-box alert-danger">{error}</div>}

            {!loading && query && results && !hasResults && (
                <div className="search-empty">
                    <p>No results for &ldquo;{query}&rdquo;</p>
                    <span>Try a different search term or filter</span>
                </div>
            )}

            {!loading && results && (
                <div className="search-results">
                    {showSection("users") && results.users.length > 0 && (
                        <section className="search-section">
                            <h2>People</h2>
                            <div className="search-user-list">
                                {results.users.map((user) => (
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
                                            {user.collegeName && (
                                                <span className="search-user-meta">{user.collegeName}</span>
                                            )}
                                            {user.companyName && (
                                                <span className="search-user-meta">{user.companyName}</span>
                                            )}
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {showSection("colleges") && results.colleges.length > 0 && (
                        <section className="search-section">
                            <h2>Colleges</h2>
                            <div className="search-org-list">
                                {results.colleges.map((college) => (
                                    <Link
                                        key={college.name}
                                        to={`/college/${encodeURIComponent(college.name)}`}
                                        className="search-org-card"
                                    >
                                        <div className="search-org-icon college">
                                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                                <path d="M22 7.24L12 3.3 2 7.24l10 3.93L22 7.24zM2.5 12h1v4h-1v-4zm15.5 0h1v4h-1v-4zM12 18.25L4.5 15.3v-4.06l7.5 2.95 7.5-2.95v4.06l-7.5 2.95z" />
                                            </svg>
                                        </div>
                                        <div className="search-org-info">
                                            <span className="search-org-name">{college.name}</span>
                                            <span className="search-org-meta">
                                                {college.memberCount}{" "}
                                                {college.memberCount === 1 ? "member" : "members"}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {showSection("companies") && results.companies.length > 0 && (
                        <section className="search-section">
                            <h2>Companies</h2>
                            <div className="search-org-list">
                                {results.companies.map((company) => (
                                    <Link
                                        key={company.name}
                                        to={`/company/${encodeURIComponent(company.name)}`}
                                        className="search-org-card"
                                    >
                                        <div className="search-org-icon company">
                                            <svg viewBox="0 0 24 24" aria-hidden="true">
                                                <path d="M3 21h18v-2H3v2zM3 8v8h4V8H3zm6 0v8h4V8H9zm6 0v8h4V8h-4zM3 3v4h18V3H3z" />
                                            </svg>
                                        </div>
                                        <div className="search-org-info">
                                            <span className="search-org-name">{company.name}</span>
                                            <span className="search-org-meta">
                                                {company.memberCount}{" "}
                                                {company.memberCount === 1 ? "member" : "members"}
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {showSection("posts") && results.posts.length > 0 && (
                        <section className="search-section">
                            <h2>Posts</h2>
                            <div className="search-post-list">
                                {results.posts.map((post) => (
                                    <PostCard key={post._id} post={post} />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
};

export default Search_Page;
