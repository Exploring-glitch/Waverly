const FormInput = ({ label, id, type = "text", value, onChange, required = true }) => {
    return (
        <div className="form-group">
            <label htmlFor={id}>{label}</label>
            <input
                id={id}
                name={id}
                type={type}
                value={value}
                onChange={onChange}
                required={required}
                autoComplete={type === "password" ? "current-password" : undefined}
            />
        </div>
    );
};

export default FormInput;
