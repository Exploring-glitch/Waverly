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

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            await login(form);
            navigate("/");
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthLayout
            title="Welcome back"
            footerText="New here?"
            footerLink="/register"
            footerLabel="Create an account"
        >
            <form onSubmit={handleSubmit} className="auth-form">
                <FormInput
                    label="Email"
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                />
                <FormInput
                    label="Password"
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                />
                {error && <p className="form-error">{error}</p>}
                <Button type="submit" disabled={submitting}>
                    {submitting ? "Logging in..." : "Log in"}
                </Button>
            </form>
        </AuthLayout>
    );
};

export default Login_Page;
