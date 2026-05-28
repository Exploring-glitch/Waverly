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
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        try {
            await register(form);
            navigate("/");
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthLayout
            title="Create account"
            subtitle="Any email works for now. College verification comes later."
            footerText="Already have an account?"
            footerLink="/login"
            footerLabel="Log in"
        >
            <form onSubmit={handleSubmit} className="auth-form">
                <FormInput
                    label="Name"
                    id="name"
                    value={form.name}
                    onChange={handleChange}
                />
                <FormInput
                    label="Username"
                    id="username"
                    value={form.username}
                    onChange={handleChange}
                />
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
                    {submitting ? "Creating account..." : "Sign up"}
                </Button>
            </form>
        </AuthLayout>
    );
};

export default Register_Page;
