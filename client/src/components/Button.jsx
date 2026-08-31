const Button = ({ children, type = "button", disabled = false, variant = "primary", onClick, ...props }) => {
    return (
        <button type={type} disabled={disabled} className={`btn btn-${variant}`} onClick={onClick} {...props}>
            {children}
        </button>
    );
};

export default Button;
