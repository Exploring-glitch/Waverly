const API_BASE = "/api/auth";

async function request(endpoint, options = {}) {
    const token = localStorage.getItem("token");

    const url = endpoint.startsWith("/api") ? endpoint : `${API_BASE}${endpoint}`;

    const res = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
    });

    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.message || "Request failed");
    }

    return data;
}

export const authApi = {
    register: (body) =>
        request("/register", { method: "POST", body: JSON.stringify(body) }),

    login: (body) =>
        request("/login", { method: "POST", body: JSON.stringify(body) }),

    getMe: () => request("/me"),
};

export const userApi = {
    updateProfile: (body) =>
        request("/api/users/profile", { method: "PUT", body: JSON.stringify(body) }),

    getByUsername: (username) => request(`/api/users/${encodeURIComponent(username)}`),

    getCollegeMembers: (name) =>
        request(`/api/users/college/${encodeURIComponent(name)}/members`),

    getCompanyMembers: (name) =>
        request(`/api/users/company/${encodeURIComponent(name)}/members`),
};

export const searchApi = {
    search: (q, type = "all", limit = 10) => {
        const params = new URLSearchParams({ q, type, limit: String(limit) });
        return request(`/api/search?${params.toString()}`);
    },
};

export const postApi = {
    createPost: (body) =>
        request("/api/posts", { method: "POST", body: JSON.stringify(body) }),
    getPosts: () => request("/api/posts"),
    getMyPosts: () => request("/api/posts/me"),
    getPostsByUsername: (username) =>
        request(`/api/posts/user/${encodeURIComponent(username)}`),
    deletePost: (id) => request(`/api/posts/${id}`, { method: "DELETE" }),
};
