import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";
import FormInput from "../components/FormInput";
import Button from "../components/Button";

const Register_Page = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [form, setForm] = useState({
        name: "",
        username: "",
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "username") {
            const cleaned = value.toLowerCase().replace(/[^a-z0-9_.]/g, "");
            setForm((prev) => ({ ...prev, username: cleaned }));
        } else {
            setForm((prev) => ({ ...prev, [name]: value }));
        }
        if (error) setError("");
    };

    const getPasswordStrength = (pass) => {
        if (!pass) return 0;
        let score = 0;
        if (pass.length >= 6) score += 1;
        if (pass.length >= 8 && /[0-9]/.test(pass)) score += 1;
        if (pass.length >= 10 && /[^A-Za-z0-9]/.test(pass)) score += 1;
        return score;
    };

    const strength = getPasswordStrength(form.password);
    const strengthLabels = ["", "Weak", "Good", "Strong"];
    const strengthColors = ["", "#f4212e", "#f59e0b", "#10b981"];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            await register(form);
            navigate("/feed");
        } catch (err) {
            setError(err.message || "Failed to create account. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthLayout
            title="Join Waverly"
            subtitle="Connect with students, alumni, and professionals in your network"
            footerText="Already have an account?"
            footerLink="/login"
            footerLabel="Sign in"
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
                    label="Full Name"
                    id="name"
                    placeholder="e.g. Alex Morgan"
                    value={form.name}
                    onChange={handleChange}
                    autoFocus
                    required
                    icon={
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                            <circle cx="12" cy="7" r="4" />
                        </svg>
                    }
                />

                <div>
                    <FormInput
                        label="Username"
                        id="username"
                        placeholder="e.g. alexmorgan"
                        value={form.username}
                        onChange={handleChange}
                        required
                        icon={
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="4" />
                                <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94" />
                            </svg>
                        }
                    />
                    {form.username && (
                        <div className="auth-username-preview">
                            <span>Your profile URL: </span>
                            <code>waverly.app/@{form.username}</code>
                        </div>
                    )}
                </div>

                <FormInput
                    label="Email address"
                    id="email"
                    type="email"
                    placeholder="name@college.edu or personal email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    hint="Any email works. Institutional badge unlocked later."
                    icon={
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                            <polyline points="22,6 12,13 2,6" />
                        </svg>
                    }
                />

                <div>
                    <FormInput
                        label="Password"
                        id="password"
                        type="password"
                        placeholder="At least 6 characters"
                        value={form.password}
                        onChange={handleChange}
                        required
                        autoComplete="new-password"
                        icon={
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                            </svg>
                        }
                    />
                    {form.password && (
                        <div className="password-strength-container">
                            <div className="strength-bars">
                                <div className={`strength-bar ${strength >= 1 ? "filled" : ""}`} style={{ backgroundColor: strength >= 1 ? strengthColors[strength] : undefined }} />
                                <div className={`strength-bar ${strength >= 2 ? "filled" : ""}`} style={{ backgroundColor: strength >= 2 ? strengthColors[strength] : undefined }} />
                                <div className={`strength-bar ${strength >= 3 ? "filled" : ""}`} style={{ backgroundColor: strength >= 3 ? strengthColors[strength] : undefined }} />
                            </div>
                            <span className="strength-text" style={{ color: strengthColors[strength] }}>
                                {strengthLabels[strength]}
                            </span>
                        </div>
                    )}
                </div>

                <p className="auth-terms-notice">
                    By creating an account, you agree to Waverly's{" "}
                    <span className="text-highlight">Community Guidelines</span> and{" "}
                    <span className="text-highlight">Privacy Policy</span>.
                </p>

                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    fullWidth
                    isLoading={submitting}
                >
                    {submitting ? "Creating your account..." : "Create account"}
                </Button>
            </form>
        </AuthLayout>
    );
};

export default Register_Page;
