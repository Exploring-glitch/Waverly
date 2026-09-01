import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Button from "./Button";

const POPULAR_SKILL_SUGGESTIONS = [
    "JavaScript", "TypeScript", "React", "Node.js", "Python",
    "Tailwind CSS", "Next.js", "Express", "MongoDB", "SQL",
    "Machine Learning", "Data Science", "UI/UX Design", "Docker",
    "Git", "AWS", "Figma", "Algorithms", "System Design"
];

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

    const handleAddSkill = (skillToAdd) => {
        const text = (skillToAdd || newSkillInput).trim();
        if (!text) return;

        // Prevent duplicate tags (case-insensitive)
        if (editedSkills.some(s => s.toLowerCase() === text.toLowerCase())) {
            setError(`"${text}" is already in your skills list.`);
            return;
        }

        setEditedSkills([...editedSkills, text]);
        if (!skillToAdd) {
            setNewSkillInput("");
        }
        setError("");
    };

    const handleRemoveSkill = (skillToRemove) => {
        setEditedSkills(editedSkills.filter(s => s !== skillToRemove));
    };

    const handleSave = async (e) => {
        e?.preventDefault();
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
            <div className="profile-section-card">
                <div className="section-card-header">
                    <div className="section-header-title-group">
                        <div className="section-header-icon-badge">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                            </svg>
                        </div>
                        <h3 className="section-card-title">Skills & Expertise</h3>
                        {hasSkills && (
                            <span className="section-count-pill">{user.skills.length}</span>
                        )}
                    </div>

                    {isOwnProfile && hasSkills && (
                        <button
                            type="button"
                            onClick={handleStartEdit}
                            className="section-edit-icon-btn"
                            title="Edit skills"
                            aria-label="Edit skills"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                        </button>
                    )}
                </div>

                {hasSkills ? (
                    <div className="skills-tags-wrap">
                        {user.skills.map((skill, index) => (
                            <span key={index} className="skill-pill-modern hover-lift">
                                <span className="skill-pill-dot" />
                                <span className="skill-pill-label">{skill}</span>
                            </span>
                        ))}
                    </div>
                ) : (
                    <div className="section-empty-state">
                        <p className="empty-state-message">
                            {isOwnProfile
                                ? "Highlight your technical strengths and tools to stand out to peers and project collaborators."
                                : "No skills listed yet."}
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
                                <span>Add skills</span>
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {isEditing && (
                <div className="modal-overlay" onClick={handleDiscard} style={{ zIndex: 3200 }}>
                    <div className="modal-box skills-edit-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header-row">
                            <div className="modal-header-title-group">
                                <div className="modal-icon-badge">
                                    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="modal-title">Edit Skills</h3>
                                    <p className="modal-subtitle">Showcase your programming languages, tools, and frameworks</p>
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

                        <form onSubmit={handleSave} className="skills-modal-form">
                            {/* Input to add new skills */}
                            <div className="skills-input-row">
                                <input
                                    type="text"
                                    placeholder="Type a skill and press Enter (e.g. React, Python)..."
                                    value={newSkillInput}
                                    onChange={(e) => setNewSkillInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            handleAddSkill();
                                        }
                                    }}
                                    className="skills-input-field"
                                    autoFocus
                                    maxLength={40}
                                />
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => handleAddSkill()}
                                >
                                    Add
                                </Button>
                            </div>

                            {/* Suggestions */}
                            <div className="skills-suggestions-section">
                                <span className="skills-section-label">Suggested skills:</span>
                                <div className="skills-suggestions-chips">
                                    {POPULAR_SKILL_SUGGESTIONS.filter(
                                        s => !editedSkills.some(es => es.toLowerCase() === s.toLowerCase())
                                    ).slice(0, 10).map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            type="button"
                                            className="skill-suggestion-chip"
                                            onClick={() => handleAddSkill(suggestion)}
                                        >
                                            + {suggestion}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Current Skills list/chips */}
                            <div className="skills-selected-section">
                                <div className="skills-section-header">
                                    <span className="skills-section-label">Your skills ({editedSkills.length})</span>
                                    {editedSkills.length > 0 && (
                                        <button
                                            type="button"
                                            className="skills-clear-all-btn"
                                            onClick={() => setEditedSkills([])}
                                        >
                                            Clear all
                                        </button>
                                    )}
                                </div>

                                {editedSkills.length > 0 ? (
                                    <div className="skills-editable-chips-wrap">
                                        {editedSkills.map((skill, index) => (
                                            <span key={index} className="skill-editable-chip">
                                                <span>{skill}</span>
                                                <button
                                                    type="button"
                                                    className="skill-chip-remove-btn"
                                                    onClick={() => handleRemoveSkill(skill)}
                                                    title={`Remove ${skill}`}
                                                >
                                                    ✕
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="skills-empty-notice">No skills added yet. Add a skill from above.</p>
                                )}
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
                                    {isSaving ? "Saving..." : "Save Skills"}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProfileSkills;
