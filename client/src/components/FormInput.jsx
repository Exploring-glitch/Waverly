import { useState } from "react";

const FormInput = ({
    label,
    id,
    type = "text",
    value,
    onChange,
    required = true,
    placeholder = "",
    autoFocus = false,
    icon = null,
    hint = "",
    error = "",
    autoComplete,
    ...props
}) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const isPassword = type === "password";

    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    return (
        <div className={`form-group ${error ? "has-error" : ""} ${isFocused ? "is-focused" : ""}`}>
            {label && (
                <div className="form-label-row">
                    <label htmlFor={id} className="form-label">
                        {label}
                        {required && <span className="required-star">*</span>}
                    </label>
                    {hint && <span className="form-hint">{hint}</span>}
                </div>
            )}
            <div className={`input-field-wrapper ${icon ? "has-leading-icon" : ""} ${isPassword ? "has-trailing-icon" : ""}`}>
                {icon && <span className="input-leading-icon">{icon}</span>}
                <input
                    id={id}
                    name={id}
                    type={isPassword ? (showPassword ? "text" : "password") : type}
                    value={value}
                    onChange={onChange}
                    required={required}
                    placeholder={placeholder}
                    autoFocus={autoFocus}
                    autoComplete={autoComplete || (isPassword ? "current-password" : undefined)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className="form-input-control"
                    {...props}
                />
                {isPassword && (
                    <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={togglePasswordVisibility}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        tabIndex={-1}
                    >
                        {showPassword ? (
                            <svg
                                viewBox="0 0 24 24"
                                width="18"
                                height="18"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                                <line x1="1" y1="1" x2="23" y2="23" />
                            </svg>
                        ) : (
                            <svg
                                viewBox="0 0 24 24"
                                width="18"
                                height="18"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        )}
                    </button>
                )}
            </div>
            {error && <p className="form-field-error">{error}</p>}
        </div>
    );
};

export default FormInput;
