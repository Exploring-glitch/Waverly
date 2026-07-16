import { useState } from "react";
import { useAuth } from "../context/AuthContext";

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
        e.preventDefault();
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

    return (
        <>
            <div 
                className="about-container" 
                style={{ 
                    marginTop: '2rem', 
                    background: '#16181c', 
                    borderRadius: '16px', 
                    padding: '1.5rem', 
                    border: '1px solid #2f3336' 
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#e7e9ea', fontWeight: '600' }}>About</h3>
                    {isOwnProfile && (
                        <button 
                            type="button"
                            onClick={handleStartEdit}
                            aria-label="Edit about section" 
                            style={{ 
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#71767b', 
                                display: 'flex', 
                                alignItems: 'center', 
                                padding: '6px',
                                borderRadius: '50%',
                                transition: 'color 0.2s, background-color 0.2s' 
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.color = '#1d9bf0';
                                e.currentTarget.style.backgroundColor = 'rgba(29, 155, 240, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.color = '#71767b';
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 20h9" />
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                            </svg>
                        </button>
                    )}
                </div>
                {user.about?.trim() ? (
                    <p style={{ margin: 0, color: '#e7e9ea', lineHeight: '1.6', whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>
                        {user.about}
                    </p>
                ) : (
                    <p style={{ margin: 0, color: '#71767b', fontStyle: 'italic', fontSize: '0.95rem' }}>
                        {isOwnProfile 
                            ? "Write a summary about your background, experience, or aspirations." 
                            : "No summary provided."}
                    </p>
                )}
            </div>

            {/* Edit Modal */}
            {isEditing && (
                <div className="modal-overlay" onClick={handleDiscard}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Edit About</h2>
                            <p className="modal-subtitle">Write a summary about your background, experience, or aspirations.</p>
                        </div>

                        {error && <div className="form-error" style={{ marginBottom: '0.5rem' }}>{error}</div>}

                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <textarea
                                className="modal-textarea"
                                placeholder="Write your summary here..."
                                value={editedAbout}
                                onChange={(e) => setEditedAbout(e.target.value)}
                                autoFocus
                            />

                            <div className="modal-actions">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={handleDiscard}
                                    disabled={isSaving}
                                    style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}
                                >
                                    Discard
                                </button>
                                <button 
                                    type="submit" 
                                    className="btn btn-primary" 
                                    disabled={isSaving}
                                    style={{ padding: '0.5rem 1.25rem', fontSize: '0.9rem' }}
                                >
                                    {isSaving ? "Saving..." : "Save"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProfileAbout;
