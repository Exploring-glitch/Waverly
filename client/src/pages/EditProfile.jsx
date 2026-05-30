import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Edit_Profile_Page = () => {
    const { user, updateProfile } = useAuth();
    const navigate = useNavigate();

    // Form states
    const [name, setName] = useState("");
    const [additionalName, setAdditionalName] = useState("");
    const [bio, setBio] = useState("");
    const [profilePic, setProfilePic] = useState("");
    const [collegeName, setCollegeName] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [startYear, setStartYear] = useState("");
    const [endYear, setEndYear] = useState("");

    // UI Feedback states
    const [error, setError] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Prefill form states when user context is loaded
    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setAdditionalName(user.additionalName || "");
            setBio(user.bio || "");
            setProfilePic(user.profilePic || "");
            setCollegeName(user.collegeName || "");
            setCompanyName(user.companyName || "");
            // If year is 0 or empty, prefill empty string for nicer UX
            setStartYear(user.startYear ? String(user.startYear) : "");
            setEndYear(user.endYear ? String(user.endYear) : "");
        }
    }, [user]);

    if (!user) {
        return <div className="page-center">Loading user details...</div>;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setShowToast(false);

        if (!name.trim()) {
            setError("Name is required");
            return;
        }

        setIsSaving(true);

        try {
            await updateProfile({
                name,
                additionalName,
                bio,
                collegeName,
                companyName,
                startYear: startYear.trim() === "" ? "" : Number(startYear),
                endYear: endYear.trim() === "" ? "" : Number(endYear),
                profilePic,
            });

            setShowToast(true);
            setIsSaving(false);

            // Wait briefly so the user sees the toaster notification, then redirect to profile page
            setTimeout(() => {
                setShowToast(false);
                navigate("/profile");
            }, 1800);
        } catch (err) {
            setIsSaving(false);
            setError(err.message || "Something went wrong while updating your profile.");
        }
    };

    return (
        <div className="page">
            {showToast && (
                <div className="toast-notification">
                    <div className="toast-icon-success">✓</div>
                    <span>Saved successfully!</span>
                </div>
            )}

            <div className="edit-profile-card">
                {/* Header */}
                <div className="edit-profile-header">
                    <h1>Edit profile</h1>
                    <p className="edit-profile-subtitle">Keep your basic info and academic credentials up to date.</p>
                </div>

                {/* Feedback Alerts */}
                {error && <div className="alert-box alert-danger">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">
                    
                    {/* SECTION 1: BASIC INFO */}
                    <div className="edit-profile-section">
                        <h3 className="edit-section-title">Basic Info</h3>
                        
                        {/* Live Avatar Preview */}
                        <div className="avatar-preview-section">
                            <img 
                                src={profilePic.trim() ? profilePic : "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"} 
                                alt="Avatar Preview" 
                                className="avatar-preview-frame"
                                onError={(e) => {
                                    e.target.src = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
                                }}
                            />
                            <div className="avatar-preview-info">
                                <strong>Avatar Preview</strong>
                                <span>Updates in real-time based on the URL below</span>
                            </div>
                        </div>

                        <div className="form-grid form-grid-2" style={{ marginBottom: "1.25rem" }}>
                            <div className="form-group">
                                <label htmlFor="name">Name *</label>
                                <input
                                    id="name"
                                    type="text"
                                    placeholder="e.g. John Doe"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="additionalName">Additional Name</label>
                                <input
                                    id="additionalName"
                                    type="text"
                                    placeholder="e.g. JD or nickname"
                                    value={additionalName}
                                    onChange={(e) => setAdditionalName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                            <label htmlFor="profilePic">Profile Picture URL</label>
                            <input
                                id="profilePic"
                                type="text"
                                placeholder="Paste image address/URL"
                                value={profilePic}
                                onChange={(e) => setProfilePic(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="bio">Bio</label>
                            <textarea
                                id="bio"
                                placeholder="Talk about your hobbies, career goals, or skills..."
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* SECTION 2: COLLEGE DETAILS */}
                    <div className="edit-profile-section">
                        <h3 className="edit-section-title">College Details</h3>
                        
                        <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                            <label htmlFor="collegeName">College Name</label>
                            <input
                                id="collegeName"
                                type="text"
                                placeholder="e.g. Stanford University"
                                value={collegeName}
                                onChange={(e) => setCollegeName(e.target.value)}
                            />
                        </div>

                        <div className="form-grid form-grid-2">
                            <div className="form-group">
                                <label htmlFor="startYear">Start Year</label>
                                <input
                                    id="startYear"
                                    type="number"
                                    placeholder="YYYY"
                                    min="1900"
                                    max="2100"
                                    value={startYear}
                                    onChange={(e) => setStartYear(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="endYear">End Year</label>
                                <input
                                    id="endYear"
                                    type="number"
                                    placeholder="YYYY"
                                    min="1900"
                                    max="2100"
                                    value={endYear}
                                    onChange={(e) => setEndYear(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: COMPANY DETAILS */}
                    <div className="edit-profile-section">
                        <h3 className="edit-section-title">Company Details</h3>

                        <div className="form-group">
                            <label htmlFor="companyName">Company Name</label>
                            <input
                                id="companyName"
                                type="text"
                                placeholder="e.g. Google"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Action Buttons: Cancel on left/middle, Save on right */}
                    <div className="edit-actions">
                        <Link to="/profile" className="btn btn-secondary" style={{ display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                            Cancel
                        </Link>
                        <button type="submit" className="btn btn-primary" disabled={isSaving}>
                            {isSaving ? "Saving..." : "Save"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Edit_Profile_Page;