const Button = ({
    children,
    type = "button",
    disabled = false,
    variant = "primary",
    size = "md",
    fullWidth = false,
    isLoading = false,
    icon = null,
    className = "",
    onClick,
    ...props
}) => {
    const classes = [
        "btn",
        `btn-${variant}`,
        size !== "md" ? `btn-${size}` : "",
        fullWidth ? "btn-full" : "",
        isLoading ? "btn-loading" : "",
        className
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <button
            type={type}
            disabled={disabled || isLoading}
            className={classes}
            onClick={onClick}
            {...props}
        >
            {isLoading ? (
                <span className="btn-spinner-container">
                    <svg className="btn-spinner" viewBox="0 0 24 24" fill="none">
                        <circle className="btn-spinner-track" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                        <path className="btn-spinner-head" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>{children}</span>
                </span>
            ) : (
                <>
                    {icon && <span className="btn-icon">{icon}</span>}
                    <span>{children}</span>
                </>
            )}
        </button>
    );
};

export default Button;
