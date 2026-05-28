const Button = ({ children, type = "button", disabled = false, variant = "primary" }) => {
    return (
        <button type={type} disabled={disabled} className={`btn btn-${variant}`}>
            {children}
        </button>
    );
};

export default Button;
