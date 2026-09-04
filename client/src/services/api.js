const BACKEND_URL = import.meta.env.VITE_API_URL || "";
const API_BASE = "/api/auth";

async function request(endpoint, options = {}) {
    const token = localStorage.getItem("token");

    const path = endpoint.startsWith("/api") ? endpoint : `${API_BASE}${endpoint}`;
    const url = `${BACKEND_URL}${path}`;

    const res = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
        },
    });

    // Safely parse JSON or fallback to text/status message
    const contentType = res.headers.get("content-type");
    let data;
    if (contentType && contentType.includes("application/json")) {
        data = await res.json();
    } else {
        const text = await res.text();
        throw new Error(`Server returned ${res.status} (${res.statusText}): ${text.slice(0, 100)}`);
    }

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


    getCityMembers: (name) =>
        request(`/api/users/city/${encodeURIComponent(name)}/members`),

    getRecommendedUsers: () => request("/api/users/recommend"),

    getConnectionStats: () => request("/api/users/stats"),
    getProfileViewers: () => request("/api/users/profile-viewers"),

    getUserConnections: (username) => request(`/api/users/${encodeURIComponent(username)}/connections`),

    sendConnectionRequest: (userId) =>
        request(`/api/users/connect/${userId}`, { method: "POST" }),

    acceptConnectionRequest: (senderId) =>
        request(`/api/users/connect/accept/${senderId}`, { method: "POST" }),

    rejectConnectionRequest: (targetUserId) =>
        request(`/api/users/connect/reject/${targetUserId}`, { method: "POST" }),

    getReceivedConnections: () => request("/api/users/connect/requests/received"),
    getSentConnections: () => request("/api/users/connect/requests/sent"),
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
    updatePost: (id, body) =>
        request(`/api/posts/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    editPost: (id, body) =>
        request(`/api/posts/${id}`, { method: "PUT", body: JSON.stringify(body) }),
    getPosts: () => request("/api/posts"),
    getMyPosts: () => request("/api/posts/me"),
    getPostsByUsername: (username) =>
        request(`/api/posts/user/${encodeURIComponent(username)}`),
    deletePost: (id) => request(`/api/posts/${id}`, { method: "DELETE" }),
    likePost: (id) => request(`/api/posts/${id}/like`, { method: "POST" }),
    commentPost: (id, content) =>
        request(`/api/posts/${id}/comment`, {
            method: "POST",
            body: JSON.stringify({ content }),
        }),
    createComment: (id, content) =>
        request(`/api/posts/${id}/comment`, {
            method: "POST",
            body: JSON.stringify({ content }),
        }),
    likeComment: (postId, commentId) =>
        request(`/api/posts/${postId}/comments/${commentId}/like`, { method: "POST" }),
    replyComment: (postId, commentId, content) =>
        request(`/api/posts/${postId}/comments/${commentId}/reply`, {
            method: "POST",
            body: JSON.stringify({ content }),
        }),
    createReply: (postId, commentId, content) =>
        request(`/api/posts/${postId}/comments/${commentId}/reply`, {
            method: "POST",
            body: JSON.stringify({ content }),
        }),
    editComment: (postId, commentId, content) =>
        request(`/api/posts/${postId}/comments/${commentId}`, {
            method: "PUT",
            body: JSON.stringify({ content }),
        }),
    deleteComment: (postId, commentId) =>
        request(`/api/posts/${postId}/comments/${commentId}`, { method: "DELETE" }),
    likeReply: (postId, commentId, replyId) =>
        request(`/api/posts/${postId}/comments/${commentId}/replies/${replyId}/like`, { method: "POST" }),
    editReply: (postId, commentId, replyId, content) =>
        request(`/api/posts/${postId}/comments/${commentId}/replies/${replyId}`, {
            method: "PUT",
            body: JSON.stringify({ content }),
        }),
    deleteReply: (postId, commentId, replyId) =>
        request(`/api/posts/${postId}/comments/${commentId}/replies/${replyId}`, { method: "DELETE" }),
};

export const notificationApi = {
    getNotifications: () => request("/api/notifications"),
    getUnreadCount: () => request("/api/notifications/unread-count"),
    markAsRead: (id) => request(`/api/notifications/${id}/read`, { method: "PUT" }),
    markAsReplied: (id) => request(`/api/notifications/${id}/replied`, { method: "PUT" }),
    markAllAsRead: () => request("/api/notifications/read-all", { method: "PUT" }),
    deleteNotification: (id) => request(`/api/notifications/${id}`, { method: "DELETE" }),
    clearAll: () => request("/api/notifications", { method: "DELETE" }),
};

