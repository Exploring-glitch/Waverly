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
};

export const postApi = {
    createPost: (body) =>
        request("/api/posts", { method: "POST", body: JSON.stringify(body) }),
    getPosts: (authorId) => 
        request(authorId ? `/api/posts?authorId=${authorId}` : "/api/posts"),
};
