import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { searchApi } from "../services/api";

const TABS = [
    { id: "all", label: "All" },
    { id: "users", label: "People" },
    { id: "colleges", label: "Colleges" },
    { id: "companies", label: "Companies" },
    { id: "universities", label: "Universities" },
    { id: "posts", label: "Posts" },
];

const OrgResult = ({ item, onSelect }) => (
    <button type="button" className="search-org-card" onClick={() => onSelect(item.name)}>
        <span className="search-org-name">{item.name}</span>
        <span className="search-org-count">
            {item.count} {item.count === 1 ? "member" : "members"}
        </span>
    </button>
);

const UserResult = ({ user }) => (
    <article className="search-user-card">
        <img src={user.profilePic} alt={user.name} className="search-avatar" />
        <div className="search-user-meta">
            <strong>{user.name}</strong>
            {user.additionalName && <span className="search-user-sub">{user.additionalName}</span>}
            <span className="search-user-handle">@{user.username}</span>
            {user.bio && <p className="search-user-bio">{user.bio}</p>}
            <div className="search-user-tags">
                {user.company && <span>{user.company}</span>}
                {user.collegeName && <span>{user.collegeName}</span>}
                {user.university && <span>{user.university}</span>}
            </div>
        </div>
    </article>
);

const PostResult = ({ post }) => (
    <article className="search-post-card">
        <div className="search-post-header">
            <img src={post.author.profilePic} alt={post.author.name} className="search-avatar-sm" />
            <div>
                <strong>{post.author.name}</strong>
                <span className="search-user-handle">@{post.author.username}</span>
            </div>
        </div>
        <p className="search-post-content">{post.content}</p>
    </article>
);

const Search_Page = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const queryParam = searchParams.get("q") || "";
    const typeParam = searchParams.get("type") || "all";

    const [input, setInput] = useState(queryParam);
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const runSearch = useCallback(async (q, type) => {
        if (q.trim().length < 2) {
            setResults(null);
            setError("");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const data = await searchApi.search({ q: q.trim(), type });
            setResults(data.results);
        } catch (err) {
            setError(err.message || "Search failed");
            setResults(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        setInput(queryParam);
    }, [queryParam]);

    useEffect(() => {
        const timer = setTimeout(() => {
            const trimmed = input.trim();

            setSearchParams(
                (prev) => {
                    const next = new URLSearchParams(prev);
                    next.set("type", typeParam);

                    if (trimmed.length >= 2) {
                        next.set("q", trimmed);
                    } else {
                        next.delete("q");
                    }

                    return next;
                },
                { replace: true }
            );

            if (trimmed.length < 2) {
                setResults(null);
                setError("");
            }
        }, 350);

        return () => clearTimeout(timer);
    }, [input, typeParam, setSearchParams]);

    useEffect(() => {
        runSearch(queryParam, typeParam);
    }, [queryParam, typeParam, runSearch]);

    const setType = (type) => {
        setSearchParams(
            (prev) => {
                const next = new URLSearchParams(prev);
                if (queryParam) next.set("q", queryParam);
                next.set("type", type);
                return next;
            },
            { replace: true }
        );
    };

    const handleOrgSelect = (name) => {
        setInput(name);
        setType("users");
    };

    const hasResults =
        results &&
        (results.users?.length ||
            results.colleges?.length ||
            results.companies?.length ||
            results.universities?.length ||
            results.posts?.length);

    const showSection = (key) => typeParam === "all" || typeParam === key;

    return (
        <div className="page search-page">
            <header className="search-header">
                <h1>Search</h1>
                <p>Find people, schools, companies, and posts</p>
            </header>

            <div className="search-bar-wrap">
                <input
                    type="search"
                    className="search-input"
                    placeholder="Search users, colleges, companies, universities, posts..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    autoFocus
                />
            </div>

            <div className="search-tabs" role="tablist">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={typeParam === tab.id}
                        className={`search-tab ${typeParam === tab.id ? "search-tab-active" : ""}`}
                        onClick={() => setType(tab.id)}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {input.trim().length > 0 && input.trim().length < 2 && (
                <p className="search-hint">Type at least 2 characters to search</p>
            )}

            {loading && <p className="search-status">Searching...</p>}
            {error && <p className="search-status search-error">{error}</p>}

            {!loading && !error && queryParam.length >= 2 && !hasResults && (
                <p className="search-status">No results for &ldquo;{queryParam}&rdquo;</p>
            )}

            {hasResults && (
                <div className="search-results">
                    {showSection("users") && results.users?.length > 0 && (
                        <section className="search-section">
                            {typeParam === "all" && <h2>People</h2>}
                            <div className="search-user-list">
                                {results.users.map((user) => (
                                    <UserResult key={user._id} user={user} />
                                ))}
                            </div>
                        </section>
                    )}

                    {showSection("colleges") && results.colleges?.length > 0 && (
                        <section className="search-section">
                            {typeParam === "all" && <h2>Colleges</h2>}
                            <div className="search-org-list">
                                {results.colleges.map((item) => (
                                    <OrgResult key={item.name} item={item} onSelect={handleOrgSelect} />
                                ))}
                            </div>
                        </section>
                    )}

                    {showSection("companies") && results.companies?.length > 0 && (
                        <section className="search-section">
                            {typeParam === "all" && <h2>Companies</h2>}
                            <div className="search-org-list">
                                {results.companies.map((item) => (
                                    <OrgResult key={item.name} item={item} onSelect={handleOrgSelect} />
                                ))}
                            </div>
                        </section>
                    )}

                    {showSection("universities") && results.universities?.length > 0 && (
                        <section className="search-section">
                            {typeParam === "all" && <h2>Universities</h2>}
                            <div className="search-org-list">
                                {results.universities.map((item) => (
                                    <OrgResult key={item.name} item={item} onSelect={handleOrgSelect} />
                                ))}
                            </div>
                        </section>
                    )}

                    {showSection("posts") && results.posts?.length > 0 && (
                        <section className="search-section">
                            {typeParam === "all" && <h2>Posts</h2>}
                            <div className="search-post-list">
                                {results.posts.map((post) => (
                                    <PostResult key={post._id} post={post} />
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
