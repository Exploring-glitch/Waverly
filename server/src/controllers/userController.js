import User from "../models/User.js";

export const updateUserProfile = async (req, res) => {
    try {
        const { name, additionalName, bio, collegeName, companyName, startYear, endYear, profilePic } = req.body;

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
        if (collegeName !== undefined) user.collegeName = collegeName;
        if (companyName !== undefined) user.companyName = companyName;

        if (startYear !== undefined) {
            user.startYear = startYear === "" ? 0 : Number(startYear);
        }
        if (endYear !== undefined) {
            user.endYear = endYear === "" ? 0 : Number(endYear);
        }
        if (profilePic !== undefined) user.profilePic = profilePic;

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

        res.status(200).json({ user: userObj, isOwnProfile });
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