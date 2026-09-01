import { Link } from "react-router-dom";

const AuthLayout = ({
    title,
    subtitle,
    children,
    footerText,
    footerLink,
    footerLabel,
    badgeText = "Campus & Professional Network"
}) => {
    return (
        <div className="auth-page-container">

            <div className="auth-ambient-glow auth-ambient-top" />
            <div className="auth-ambient-glow auth-ambient-bottom" />

            <div className="auth-card-wrapper">

                <div className="auth-brand-header">
                    <Link to="/" className="auth-brand-link">
                        <div className="auth-logo-icon">
                            <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M2 12c1.5-2 3.5-3 5.5-3s4 2 5.5 3c1.5 1 3.5 2 5.5 2s4-1 5.5-3" />
                                <path d="M2 7c1.5-2 3.5-3 5.5-3s4 2 5.5 3c1.5 1 3.5 2 5.5 2s4-1 5.5-3" />
                                <path d="M2 17c1.5-2 3.5-3 5.5-3s4 2 5.5 3c1.5 1 3.5 2 5.5 2s4-1 5.5-3" />
                            </svg>
                        </div>
                        <span className="auth-brand-title">Waverly</span>
                    </Link>
                    {badgeText && <span className="auth-badge-pill">{badgeText}</span>}
                </div>

                <div className="auth-glass-card">
                    <div className="auth-header-text">
                        <h1 className="auth-title">{title}</h1>
                        {subtitle && <p className="auth-subtitle">{subtitle}</p>}
                    </div>

                    <div className="auth-card-body">
                        {children}
                    </div>

                    <div className="auth-card-footer">
                        <p className="auth-footer-prompt">
                            {footerText}{" "}
                            <Link to={footerLink} className="auth-footer-action-link">
                                {footerLabel}
                            </Link>
                        </p>
                    </div>
                </div>

                <div className="auth-security-footer">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span>Secured with end-to-end institutional verification</span>
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
