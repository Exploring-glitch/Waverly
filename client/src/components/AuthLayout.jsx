import { Link } from "react-router-dom";

const AuthLayout = ({ title, subtitle, children, footerText, footerLink, footerLabel }) => {
    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>{title}</h1>
                {subtitle && <p className="auth-subtitle">{subtitle}</p>}
                {children}
                <p className="auth-footer">
                    {footerText}{" "}
                    <Link to={footerLink}>{footerLabel}</Link>
                </p>
            </div>
        </div>
    );
};

export default AuthLayout;
