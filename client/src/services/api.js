const API_BASE = "/api/auth";

async function request(endpoint, options = {}) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_BASE}${endpoint}`, {
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
