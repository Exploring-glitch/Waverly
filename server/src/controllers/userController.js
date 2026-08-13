import User from "../models/User.js";

export const updateUserProfile = async (req, res) => {
    try {
        const { 
            name, 
            additionalName, 
            bio, 
            about, 
            skills, 
            collegeName, 
            companyName, 
            startYear, 
            endYear, 
            profilePic,
            locationCountry,
            locationPostalCode,
            locationCity
        } = req.body;

        if (name !== undefined && !name.trim()) {
            return res.status(400).json({ message: "Name cannot be empty" })
        }
        if (startYear !== undefined && startYear !== "" && isNaN(Number(startYear))) {
            return res.status(400).json({ message: "Start year must be a valid number" })
        }
        if (endYear !== undefined && endYear !== "" && isNaN(Number(endYear))) {
            return res.status(400).json({ message: "End year must be a valid number" })
        }


        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        if (name !== undefined) user.name = name;
        if (additionalName !== undefined) user.additionalName = additionalName;
        if (bio !== undefined) user.bio = bio;
        if (about !== undefined) user.about = about;
        if (skills !== undefined) {
            if (Array.isArray(skills)) {
                user.skills = skills.map(s => String(s).trim()).filter(Boolean);
            }
        }
        if (collegeName !== undefined) user.collegeName = collegeName;
        if (companyName !== undefined) user.companyName = companyName;

        if (startYear !== undefined) {
            user.startYear = startYear === "" ? 0 : Number(startYear);
        }
        if (endYear !== undefined) {
            user.endYear = endYear === "" ? 0 : Number(endYear);
        }
        if (profilePic !== undefined) user.profilePic = profilePic;
        
        if (locationCountry !== undefined) user.locationCountry = locationCountry;
        if (locationPostalCode !== undefined) user.locationPostalCode = locationPostalCode;
        if (locationCity !== undefined) user.locationCity = locationCity;

        const updatedUser = await user.save();

        res.status(200).json({
            message: "Profile updated succesfully",
            user: updatedUser
        });

    }
    catch (err) {
        console.error(err)
        res.status(500).json({ message: "Internal server error" })
    }
}

export const getUserByUsername = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username }).select("-password");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isOwnProfile = req.user._id.toString() === user._id.toString();
        const userObj = user.toJSON();

        if (!isOwnProfile) {
            delete userObj.email;
        }

        let connectionCount = 0;
        if (user.collegeName || user.companyName) {
            connectionCount = await User.countDocuments({
                _id: { $ne: user._id },
                $or: [
                    { collegeName: user.collegeName ? user.collegeName : "___none___" },
                    { companyName: user.companyName ? user.companyName : "___none___" }
                ]
            });
        } else {
            connectionCount = await User.countDocuments({ _id: { $ne: user._id } });
        }

        res.status(200).json({ user: userObj, isOwnProfile, connectionCount });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getUsersByCollege = async (req, res) => {
    try {
        const collegeName = decodeURIComponent(req.params.name);
        const members = await User.find({ collegeName }).select("-password -email");

        res.status(200).json({
            name: collegeName,
            memberCount: members.length,
            members,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getUsersByCompany = async (req, res) => {
    try {
        const companyName = decodeURIComponent(req.params.name);
        const members = await User.find({ companyName }).select("-password -email");

        res.status(200).json({
            name: companyName,
            memberCount: members.length,
            members,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getRecommendedUsers = async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.user._id } })
            .select("name username profilePic bio collegeName companyName additionalName")
            .limit(5);
        res.status(200).json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getConnectionStats = async (req, res) => {
    try {
        const currentUser = await User.findById(req.user._id);
        if (!currentUser) {
            return res.status(404).json({ message: "User not found" });
        }
        let connectionCount = 0;
        
        if (currentUser.collegeName || currentUser.companyName) {
            connectionCount = await User.countDocuments({
                _id: { $ne: req.user._id },
                $or: [
                    { collegeName: currentUser.collegeName ? currentUser.collegeName : "___none___" },
                    { companyName: currentUser.companyName ? currentUser.companyName : "___none___" }
                ]
            });
        } else {
            connectionCount = await User.countDocuments({ _id: { $ne: req.user._id } });
        }

        const viewsCount = Math.max(12, (currentUser.name.length * 3) + 7);

        res.status(200).json({
            connectionCount,
            viewsCount
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getUserConnections = async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let connections = [];
        if (user.collegeName || user.companyName) {
            connections = await User.find({
                _id: { $ne: user._id },
                $or: [
                    { collegeName: user.collegeName ? user.collegeName : "___none___" },
                    { companyName: user.companyName ? user.companyName : "___none___" }
                ]
            }).select("-password -email");
        } else {
            connections = await User.find({ _id: { $ne: user._id } }).select("-password -email");
        }

        res.status(200).json(connections);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};