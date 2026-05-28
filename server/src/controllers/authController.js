import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

export const registerUser = async (req, res) => {
    try {
        const { name, username, email, password, profilePic } = req.body;

        if (!name || !username || !email || !password) {
            return res.status(400).json({ message: "Please fill all required fields" });
        }

        const userExist = await User.findOne({
            $or: [{ email }, { username }],
        });

        if (userExist) {
            if (userExist.email === email) {
                return res.status(409).json({ message: "Email is already registered" });
            }
            if (userExist.username === username) {
                return res.status(409).json({ message: "Username is already taken" });
            }
        }

        const newUser = await User.create({
            name,
            username,
            email,
            password,
            profilePic: profilePic || undefined,
        });

        res.status(201).json({
            message: "Registration successful",
            user: newUser,
            token: generateToken(newUser._id),
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // select: false on password — must explicitly include it for login
        const user = await User.findOne({ email }).select("+password");

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        res.status(200).json({
            message: "Login successful",
            user,
            token: generateToken(user._id),
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

/** Protected route — returns the logged-in user (no password in JSON). */
export const getMe = async (req, res) => {
    res.status(200).json({ user: req.user });
};
