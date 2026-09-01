import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Button from "./Button";

const ProfileAbout = ({ user, isOwnProfile }) => {
    const { updateProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editedAbout, setEditedAbout] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    const handleStartEdit = () => {
        setEditedAbout(user.about || "");
        setError("");
        setIsEditing(true);
    };

    const handleSave = async (e) => {
        e?.preventDefault();
        setIsSaving(true);
        setError("");
        try {
            await updateProfile({ about: editedAbout });
            setIsEditing(false);
        } catch (err) {
            setError(err.message || "Failed to save about section");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDiscard = () => {
        setIsEditing(false);
        setError("");
    };

    const hasAbout = Boolean(user.about?.trim());

    return (
        <>
            <div className="profile-section-card">
                <div className="section-card-header">
                    <div className="section-header-title-group">
                        <div className="section-header-icon-badge">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="16" y1="13" x2="8" y2="13" />
                                <line x1="16" y1="17" x2="8" y2="17" />
                                <polyline points="10 9 9 9 8 9" />
                            </svg>
                        </div>
                        <h3 className="section-card-title">About</h3>
                    </div>

                    {isOwnProfile && hasAbout && (
                        <button
                            type="button"
                            onClick={handleStartEdit}
                            className="section-edit-icon-btn"
                            title="Edit about section"
                            aria-label="Edit about section"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                        </button>
                    )}
                </div>

                {hasAbout ? (
                    <div className="about-text-content">
                        <p>{user.about}</p>
                    </div>
                ) : (
                    <div className="section-empty-state">
                        <p className="empty-state-message">
                            {isOwnProfile
                                ? "Write a summary about your academic journey, passions, or career ambitions."
                                : "No summary provided yet."}
                        </p>
                        {isOwnProfile && (
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={handleStartEdit}
                                className="empty-state-cta-btn"
                            >
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="5" x2="12" y2="19" />
                                    <line x1="5" y1="12" x2="19" y2="12" />
                                </svg>
                                <span>Add summary</span>
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {isEditing && (
                <div className="modal-overlay" onClick={handleDiscard} style={{ zIndex: 3200 }}>
                    <div className="modal-box about-edit-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-row">
                            <div className="modal-header-title-group">
                                <div className="modal-icon-badge">
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="modal-title">Edit About</h3>
                                    <p className="modal-subtitle">Share your background, goals, or what drives you</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="crop-modal-close-btn"
                                onClick={handleDiscard}
                            >
                                ✕
                            </button>
                        </div>

                        {error && <div className="crop-error-banner" style={{ marginBottom: "1rem" }}>{error}</div>}

                        <form onSubmit={handleSave} className="about-modal-form">
                            <div className="textarea-wrapper">
                                <textarea
                                    className="modal-textarea-control"
                                    placeholder="Write a summary about your experience, campus projects, career goals, or skills..."
                                    value={editedAbout}
                                    onChange={(e) => setEditedAbout(e.target.value)}
                                    rows={6}
                                    autoFocus
                                    maxLength={2000}
                                />
                                <div className="textarea-footer-info">
                                    <span>{editedAbout.length} / 2000 characters</span>
                                </div>
                            </div>

                            <div className="modal-footer-actions">
                                <Button
                                    variant="secondary"
                                    onClick={handleDiscard}
                                    disabled={isSaving}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    variant="primary"
                                    type="submit"
                                    isLoading={isSaving}
                                >
                                    {isSaving ? "Saving..." : "Save About"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProfileAbout;
