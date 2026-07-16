import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const ProfileSkills = ({ user, isOwnProfile }) => {
    const { updateProfile } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [editedSkills, setEditedSkills] = useState([]);
    const [newSkillInput, setNewSkillInput] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState("");

    const handleStartEdit = () => {
        setEditedSkills(user.skills || []);
        setNewSkillInput("");
        setError("");
        setIsEditing(true);
    };

    const handleAddSkill = (e) => {
        if (e) e.preventDefault();
        const trimmed = newSkillInput.trim();
        if (!trimmed) return;
        
        // Prevent duplicate tags
        if (editedSkills.some(skill => skill.toLowerCase() === trimmed.toLowerCase())) {
            setError("Skill already exists");
            return;
        }

        setEditedSkills([...editedSkills, trimmed]);
        setNewSkillInput("");
        setError("");
    };

    const handleRemoveSkill = (skillToRemove) => {
        setEditedSkills(editedSkills.filter(s => s !== skillToRemove));
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        setError("");
        try {
            await updateProfile({ skills: editedSkills });
            setIsEditing(false);
        } catch (err) {
            setError(err.message || "Failed to save skills");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDiscard = () => {
        setIsEditing(false);
        setError("");
    };

    const hasSkills = user.skills && user.skills.length > 0;

    return (
        <>
            <div 
                className="skills-container" 
                style={{ 
                    marginTop: '2rem', 
                    background: '#16181c', 
                    borderRadius: '16px', 
                    padding: '1.5rem', 
                    border: '1px solid #2f3336' 
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#e7e9ea', fontWeight: '600' }}>Skills</h3>
                    {isOwnProfile && (
                        <button 
                            type="button"
                            onClick={handleStartEdit}
                            aria-label="Edit skills section" 
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
                
                {hasSkills ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                        {user.skills.map((skill, index) => (
                            <span 
                                key={index} 
                                className="skill-badge"
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                ) : (
                    <p style={{ margin: 0, color: '#71767b', fontStyle: 'italic', fontSize: '0.95rem' }}>
                        {isOwnProfile 
                            ? "Highlight your skills to stand out to peers and potential recruiters." 
                            : "No skills listed."}
                    </p>
                )}
            </div>

            {/* Edit Modal */}
            {isEditing && (
                <div className="modal-overlay" onClick={handleDiscard}>
                    <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Edit Skills</h2>
                            <p className="modal-subtitle">Showcase your professional strengths and areas of expertise.</p>
                        </div>

                        {error && <div className="form-error" style={{ marginBottom: '0.5rem' }}>{error}</div>}

                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {/* Input to add new skills */}
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <input
                                    type="text"
                                    placeholder="Add a skill (e.g. React, Node.js, Python)"
                                    value={newSkillInput}
                                    onChange={(e) => setNewSkillInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddSkill();
                                        }
                                    }}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem 1rem',
                                        border: '1px solid #2f3336',
                                        borderRadius: '8px',
                                        background: '#0f1419',
                                        color: '#e7e9ea',
                                        fontSize: '1rem',
                                    }}
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={handleAddSkill}
                                    className="btn btn-secondary"
                                    style={{ padding: '0.75rem 1.25rem', borderRadius: '8px', fontSize: '0.95rem' }}
                                >
                                    Add
                                </button>
                            </div>

                            {/* Current Skills list/chips within modal */}
                            <div>
                                <label style={{ fontSize: '0.875rem', color: '#71767b', display: 'block', marginBottom: '0.75rem' }}>
                                    Your skills ({editedSkills.length})
                                </label>
                                {editedSkills.length > 0 ? (
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto', padding: '4px' }}>
                                        {editedSkills.map((skill, index) => (
                                            <span 
                                                key={index}
                                                style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '0.35rem',
                                                    padding: '0.4rem 0.8rem',
                                                    background: '#2f3336',
                                                    border: '1px solid #536471',
                                                    color: '#e7e9ea',
                                                    borderRadius: '9999px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '500',
                                                }}
                                            >
                                                {skill}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveSkill(skill)}
                                                    aria-label={`Remove ${skill}`}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: '#71767b',
                                                        cursor: 'pointer',
                                                        padding: 0,
                                                        display: 'inline-flex',
                                                        alignItems: 'center',
                                                        fontSize: '1rem',
                                                        fontWeight: 'bold',
                                                        lineHeight: 1
                                                    }}
                                                    onMouseEnter={(e) => e.currentTarget.style.color = '#f4212e'}
                                                    onMouseLeave={(e) => e.currentTarget.style.color = '#71767b'}
                                                >
                                                    &times;
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p style={{ margin: 0, color: '#71767b', fontStyle: 'italic', fontSize: '0.9rem' }}>
                                        No skills added yet. Add skills using the input above.
                                    </p>
                                )}
                            </div>

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

export default ProfileSkills;
