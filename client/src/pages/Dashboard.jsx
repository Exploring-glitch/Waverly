import { useAuth } from "../context/AuthContext";

/** Example protected page — only reachable when logged in. */
const Dashboard_Page = () => {
    const { user } = useAuth();

    return (
        <div className="page">
            <h1>Dashboard</h1>
            <p>This route is protected. Only authenticated users can see it.</p>
            <pre className="user-json">{JSON.stringify(user, null, 2)}</pre>
        </div>
    );
};

export default Dashboard_Page;
