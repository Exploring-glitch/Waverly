import User from "../models/User.js";
import Connection from "../models/Connection.js";

const addConnectionStatuses = async (users, currentUserId) => {
    const userObjects = [];
    for (const u of users) {
        const uJson = u.toJSON ? u.toJSON() : u;
        const conn = await Connection.findOne({
            $or: [
                { sender: currentUserId, recipient: uJson._id },
                { sender: uJson._id, recipient: currentUserId }
            ]
        });
        let connectionStatus = "none";
        if (conn) {
            if (conn.status === "accepted") {
                connectionStatus = "accepted";
            } else if (conn.sender.toString() === currentUserId.toString()) {
                connectionStatus = "pending_sent";
            } else {
                connectionStatus = "pending_received";
            }
        }
        userObjects.push({
            ...uJson,
            connectionStatus
        });
    }
    return userObjects;
};

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
            coverPic,
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
        if (coverPic !== undefined) user.coverPic = coverPic;

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

        const connectionCount = await Connection.countDocuments({
            status: "accepted",
            $or: [
                { sender: user._id },
                { recipient: user._id }
            ]
        });

        let connectionStatus = "none";
        if (!isOwnProfile) {
            const conn = await Connection.findOne({
                $or: [
                    { sender: req.user._id, recipient: user._id },
                    { sender: user._id, recipient: req.user._id }
                ]
            });
            if (conn) {
                if (conn.status === "accepted") {
                    connectionStatus = "accepted";
                } else if (conn.sender.toString() === req.user._id.toString()) {
                    connectionStatus = "pending_sent";
                } else {
                    connectionStatus = "pending_received";
                }
            }
        }

        res.status(200).json({ user: userObj, isOwnProfile, connectionCount, connectionStatus });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getUsersByCollege = async (req, res) => {
    try {
        const collegeName = decodeURIComponent(req.params.name);
        const members = await User.find({ collegeName }).select("-password -email");
        const membersWithStatus = await addConnectionStatuses(members, req.user._id);

        res.status(200).json({
            name: collegeName,
            memberCount: membersWithStatus.length,
            members: membersWithStatus,
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
        const membersWithStatus = await addConnectionStatuses(members, req.user._id);

        res.status(200).json({
            name: companyName,
            memberCount: membersWithStatus.length,
            members: membersWithStatus,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getUsersByCity = async (req, res) => {
    try {
        const cityName = decodeURIComponent(req.params.name);
        const members = await User.find({ locationCity: { $regex: new RegExp(`^${cityName}$`, "i") } }).select("-password -email");
        const membersWithStatus = await addConnectionStatuses(members, req.user._id);

        res.status(200).json({
            name: cityName,
            memberCount: membersWithStatus.length,
            members: membersWithStatus,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getRecommendedUsers = async (req, res) => {
    try {
        const users = await User.find({ _id: { $ne: req.user._id } })
            .select("name username profilePic bio collegeName companyName additionalName");
        const usersWithStatus = await addConnectionStatuses(users, req.user._id);
        res.status(200).json(usersWithStatus);
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

        const connectionCount = await Connection.countDocuments({
            status: "accepted",
            $or: [
                { sender: req.user._id },
                { recipient: req.user._id }
            ]
        });

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

        const connections = await Connection.find({
            status: "accepted",
            $or: [
                { sender: user._id },
                { recipient: user._id }
            ]
        }).populate("sender recipient", "name username profilePic bio collegeName companyName additionalName");

        const list = connections.map(conn => {
            if (conn.sender._id.toString() === user._id.toString()) {
                return conn.recipient;
            } else {
                return conn.sender;
            }
        });

        res.status(200).json(list);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const sendConnectionRequest = async (req, res) => {
    try {
        const targetUserId = req.params.userId;
        if (targetUserId.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: "You cannot connect with yourself" });
        }

        const existing = await Connection.findOne({
            $or: [
                { sender: req.user._id, recipient: targetUserId },
                { sender: targetUserId, recipient: req.user._id }
            ]
        });

        if (existing) {
            return res.status(400).json({ message: "Connection request already exists or you are already connected" });
        }

        const newConn = await Connection.create({
            sender: req.user._id,
            recipient: targetUserId,
            status: "pending"
        });

        res.status(201).json({ message: "Connection request sent successfully", connection: newConn });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const acceptConnectionRequest = async (req, res) => {
    try {
        const senderId = req.params.senderId;

        const connection = await Connection.findOne({
            sender: senderId,
            recipient: req.user._id,
            status: "pending"
        });

        if (!connection) {
            return res.status(404).json({ message: "Connection request not found" });
        }

        connection.status = "accepted";
        await connection.save();

        res.status(200).json({ message: "Connection request accepted", connection });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const rejectConnectionRequest = async (req, res) => {
    try {
        const targetUserId = req.params.targetUserId;

        const connection = await Connection.findOneAndDelete({
            $or: [
                { sender: req.user._id, recipient: targetUserId },
                { sender: targetUserId, recipient: req.user._id }
            ]
        });

        if (!connection) {
            return res.status(404).json({ message: "Connection not found" });
        }

        res.status(200).json({ message: "Connection/request deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getReceivedConnections = async (req, res) => {
    try {
        const requests = await Connection.find({
            recipient: req.user._id,
            status: "pending"
        }).populate("sender", "name username profilePic bio collegeName companyName additionalName");

        res.status(200).json(requests);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getSentConnections = async (req, res) => {
    try {
        const requests = await Connection.find({
            sender: req.user._id,
            status: "pending"
        }).populate("recipient", "name username profilePic bio collegeName companyName additionalName");

        res.status(200).json(requests);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};