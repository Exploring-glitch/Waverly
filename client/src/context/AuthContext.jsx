import { createContext, useContext, useEffect, useState } from "react";
import { authApi } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const saveSession = (token, userData) => {
        localStorage.setItem("token", token);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    const register = async (formData) => {
        const data = await authApi.register(formData);
        saveSession(data.token, data.user);
        return data;
    };

    const login = async (formData) => {
        const data = await authApi.login(formData);
        saveSession(data.token, data.user);
        return data;
    };

    // On refresh: if token exists, fetch current user from /me
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            setLoading(false);
            return;
        }

        authApi
            .getMe()
            .then((data) => setUser(data.user))
            .catch(() => logout())
            .finally(() => setLoading(false));
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, register, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
    return ctx;
};
