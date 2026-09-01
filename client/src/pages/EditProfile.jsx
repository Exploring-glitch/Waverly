import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ImageCropModal from "../components/ImageCropModal";
import Button from "../components/Button";

const Edit_Profile_Page = () => {
    const { user, updateProfile } = useAuth();
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [additionalName, setAdditionalName] = useState("");
    const [bio, setBio] = useState("");
    const [profilePic, setProfilePic] = useState("");
    const [coverPic, setCoverPic] = useState("");
    const [collegeName, setCollegeName] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [startYear, setStartYear] = useState("");
    const [endYear, setEndYear] = useState("");
    const [locationCountry, setLocationCountry] = useState("");
    const [locationPostalCode, setLocationPostalCode] = useState("");
    const [locationCity, setLocationCity] = useState("");

    const [isCoverCropOpen, setIsCoverCropOpen] = useState(false);
    const [isAvatarCropOpen, setIsAvatarCropOpen] = useState(false);

    const [error, setError] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setName(user.name || "");
            setAdditionalName(user.additionalName || "");
            setBio(user.bio || "");
            setProfilePic(user.profilePic || "");
            setCoverPic(user.coverPic || "");
            setCollegeName(user.collegeName || "");
            setCompanyName(user.companyName || "");
            setStartYear(user.startYear ? String(user.startYear) : "");
            setEndYear(user.endYear ? String(user.endYear) : "");
            setLocationCountry(user.locationCountry || "");
            setLocationPostalCode(user.locationPostalCode || "");
            setLocationCity(user.locationCity || "");
        }
    }, [user]);

    if (!user) {
        return <div className="page-center"><div className="spinner" /></div>;
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
                coverPic,
                locationCountry,
                locationPostalCode,
                locationCity,
            });

            setShowToast(true);
            setIsSaving(false);

            setTimeout(() => {
                setShowToast(false);
                navigate("/profile");
            }, 1500);
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
                    <span>Saved successfully! Redirecting to profile...</span>
                </div>
            )}

            <div className="edit-profile-card">

                <div className="edit-profile-header">
                    <h1>Edit profile</h1>
                    <p className="edit-profile-subtitle">Keep your branding, basic info, and academic credentials up to date.</p>
                </div>

                {error && <div className="alert-box alert-danger">{error}</div>}

                <form onSubmit={handleSubmit} className="auth-form">

                    <div className="edit-profile-section">
                        <h3 className="edit-section-title">Profile Imagery</h3>

                        <div className="edit-cover-wrapper">
                            <label className="form-label" style={{ marginBottom: "0.5rem", display: "block" }}>
                                Cover Banner
                            </label>
                            <div className="edit-cover-preview-box">
                                {coverPic ? (
                                    <img src={coverPic} alt="Cover preview" className="edit-cover-img" />
                                ) : (
                                    <div className="edit-cover-placeholder">
                                        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                            <circle cx="8.5" cy="8.5" r="1.5" />
                                            <polyline points="21 15 16 10 5 21" />
                                        </svg>
                                        <span>No custom cover image set (default gradient shown)</span>
                                    </div>
                                )}
                                <div className="edit-cover-overlay-actions">
                                    <Button
                                        type="button"
                                        variant="primary"
                                        size="sm"
                                        onClick={() => setIsCoverCropOpen(true)}
                                    >
                                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                            <circle cx="12" cy="13" r="4" />
                                        </svg>
                                        {coverPic ? "Edit / Crop Cover" : "Upload & Crop Cover"}
                                    </Button>
                                    {coverPic && (
                                        <button
                                            type="button"
                                            className="edit-cover-remove-btn"
                                            onClick={() => setCoverPic("")}
                                            title="Remove Cover Image"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="avatar-preview-section">
                            <div className="avatar-preview-relative">
                                <img 
                                    src={profilePic.trim() ? profilePic : "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"} 
                                    alt="Avatar Preview" 
                                    className="avatar-preview-frame"
                                    onError={(e) => {
                                        e.target.src = "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y";
                                    }}
                                />
                                <button
                                    type="button"
                                    className="avatar-crop-trigger-btn"
                                    onClick={() => setIsAvatarCropOpen(true)}
                                    title="Crop Profile Picture"
                                >
                                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                                        <circle cx="12" cy="13" r="4" />
                                    </svg>
                                </button>
                            </div>
                            <div className="avatar-preview-info">
                                <strong>Profile Photo</strong>
                                <span>Click the camera icon to upload and crop, or paste a URL below</span>
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
                    </div>

                    <div className="edit-profile-section">
                        <h3 className="edit-section-title">Basic Info</h3>

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

                    <div className="edit-profile-section">
                        <h3 className="edit-section-title">Location</h3>

                        <div className="form-grid form-grid-2" style={{ marginBottom: "1.25rem" }}>
                            <div className="form-group">
                                <label htmlFor="locationCountry">Country/Region</label>
                                <input
                                    id="locationCountry"
                                    type="text"
                                    placeholder="e.g. United States"
                                    value={locationCountry}
                                    onChange={(e) => setLocationCountry(e.target.value)}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="locationCity">City</label>
                                <input
                                    id="locationCity"
                                    type="text"
                                    placeholder="e.g. San Francisco"
                                    value={locationCity}
                                    onChange={(e) => setLocationCity(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="locationPostalCode">Postal/ZIP Code</label>
                            <input
                                id="locationPostalCode"
                                type="text"
                                placeholder="e.g. 94105"
                                value={locationPostalCode}
                                onChange={(e) => setLocationPostalCode(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="edit-actions">
                        <Link to="/profile" className="btn btn-secondary">
                            Cancel
                        </Link>
                        <Button type="submit" variant="primary" isLoading={isSaving}>
                            {isSaving ? "Saving changes..." : "Save profile"}
                        </Button>
                    </div>
                </form>
            </div>

            <ImageCropModal
                isOpen={isCoverCropOpen}
                onClose={() => setIsCoverCropOpen(false)}
                onSave={async (croppedUrl) => {
                    setCoverPic(croppedUrl);
                }}
                currentImage={coverPic}
                title="Edit Cover Banner"
                aspectRatio={3.6}
                outputWidth={1200}
                outputHeight={350}
                allowRemove={true}
            />

            <ImageCropModal
                isOpen={isAvatarCropOpen}
                onClose={() => setIsAvatarCropOpen(false)}
                onSave={async (croppedUrl) => {
                    setProfilePic(croppedUrl);
                }}
                currentImage={profilePic}
                title="Edit Profile Photo"
                aspectRatio={1}
                outputWidth={400}
                outputHeight={400}
                allowRemove={false}
            />
        </div>
    );
};

export default Edit_Profile_Page;