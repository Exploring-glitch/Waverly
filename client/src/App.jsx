import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home_Page from "./pages/Home.jsx";
import Login_Page from "./pages/Login.jsx";
import Register_Page from "./pages/Register.jsx";
import Dashboard_Page from "./pages/Dashboard.jsx";
import Profile_Page from "./pages/Profile.jsx";

const App = () => {
    return (
        <AuthProvider>
            <Navbar />
            <Routes>
                <Route path="/" element={<Home_Page />} />
                <Route path="/login" element={<Login_Page />} />
                <Route path="/register" element={<Register_Page />} />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard_Page />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <Profile_Page />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </AuthProvider>
    );
};

export default App;
