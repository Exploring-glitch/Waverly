import { useAuth } from "../context/AuthContext";
import ProfileHeader from "../components/ProfileHeader";
import ProfileActivity from "../components/ProfileActivity";

const Profile_Page = () => {
    const { user } = useAuth();

    if (!user) {
        return <div className="page-center">Loading profile...</div>;
    }

    return (
        <div className="page">
            <ProfileHeader user={user} />
            <ProfileActivity />
        </div>
    );
};

export default Profile_Page;
