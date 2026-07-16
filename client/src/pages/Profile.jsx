import { useAuth } from "../context/AuthContext";
import ProfileHeader from "../components/ProfileHeader";
import ProfileAbout from "../components/ProfileAbout";
import ProfileActivity from "../components/ProfileActivity";

const Profile_Page = () => {
    const { user } = useAuth();

    if (!user) {
        return <div className="page-center"><div className="spinner" /></div>;
    }

    return (
        <div className="page">
            <ProfileHeader user={user} />
            <ProfileAbout user={user} isOwnProfile={true} />
            <ProfileActivity />
        </div>
    );
};

export default Profile_Page;
