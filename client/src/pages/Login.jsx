import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import FormInput from "../components/FormInput";
import Button from "../components/Button";

const Login_Page = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({ email: "", password: "" });
    const [rememberMe, setRememberMe] = useState(true);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            await login(form);
            navigate("/feed");
        } catch (err) {
            setError(err.message || "Failed to sign in. Please check your credentials.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Sign in to your Waverly account to continue"
            footerText="Don't have an account?"
            footerLink="/register"
            footerLabel="Sign up for free"
        >
            <form onSubmit={handleSubmit} className="auth-form">
                {error && (
                    <div className="auth-alert-error" role="alert">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <span>{error}</span>
                    </div>
                )}

                <FormInput
                    label="Email address"
                    id="email"
                    type="email"
                    placeholder="name@college.edu or personal email"
                    value={form.email}
                    onChange={handleChange}
                    autoComplete="email"
                    autoFocus
                    required
                    icon={
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                        </svg>
                    }
                />

                <FormInput
                    label="Password"
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                    required
                    icon={
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                    }
                />

                <div className="auth-form-options">
                    <label className="auth-remember-checkbox">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                        />
                        <span className="checkbox-custom" />
                        <span className="checkbox-label-text">Remember me</span>
                    </label>
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={submitting}
                >
                    {submitting ? "Signing in..." : "Sign in"}
                </Button>
            </form>
        </AuthLayout>
    );
};

export default Login_Page;
