const ProfileInfo = ({ user, showEmail = true }) => {
    return (
        <>
            {/* Bio */}
            {user.bio ? (
                <p className="profile-bio">{user.bio}</p>
            ) : (
                <p className="profile-bio" style={{ color: "#71767b", fontStyle: "italic" }}>
                    No bio added yet.
                </p>
            )}

            {/* College details and email */}
            <div className="profile-metadata">
                {user.collegeName && (
                    <div className="metadata-item">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M22 7.24L12 3.3 2 7.24l10 3.93L22 7.24zM2.5 12h1v4h-1v-4zm15.5 0h1v4h-1v-4zM12 18.25L4.5 15.3v-4.06l7.5 2.95 7.5-2.95v4.06l-7.5 2.95z" />
                        </svg>
                        <span>{user.collegeName}</span>
                    </div>
                )}
                {user.companyName && (
                    <div className="metadata-item">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M3 21h18v-2H3v2zM3 8v8h4V8H3zm6 0v8h4V8H9zm6 0v8h4V8h-4zM3 3v4h18V3H3z" />
                        </svg>
                        <span>{user.companyName}</span>
                    </div>
                )}
                {(user.startYear || user.endYear) ? (
                    <div className="metadata-item">
                        <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M19 4h-2V3c0-.55-.45-1-1-1s-1 .45-1 1v1H9V3c0-.55-.45-1-1-1s-1 .45-1 1v1H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V8h14v12z" />
                        </svg>
                        <span>{user.startYear} - {user.endYear}</span>
                    </div>
                ) : null}
                {showEmail && (
                <div className="metadata-item">
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M1.998 5.5c0-1.381 1.11-2.5 2.5-2.5h15c1.38 0 2.5 1.119 2.5 2.5v13c0 1.381-1.12 2.5-2.5 2.5h-15c-1.39 0-2.5-1.119-2.5-2.5v-13zm2.5-.5c-.276 0-.5.224-.5.5v.19l7.585 5.56c.249.18.581.18.83 0l7.585-5.56V5.5c0-.276-.224-.5-.5-.5h-15zm15.5 2.19l-7.234 5.3c-.456.33-1.076.33-1.532 0L3.998 7.19V18c0 .28.224.5.5.5h15c.28 0 .5-.22.5-.5V7.19z" />
                    </svg>
                    <span>{user.email}</span>
                </div>
                )}
            </div>
        </>
    );
};

export default ProfileInfo;
