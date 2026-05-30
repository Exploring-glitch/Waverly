import User from "../models/User.js";
import Post from "../models/Post.js";

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const USER_FIELDS = "name username profilePic bio collegeName university company additionalName";
const AUTHOR_FIELDS = "name username profilePic";

const aggregateDistinct = (field, regex, limit) =>
    User.aggregate([
        {
            $match: {
                $and: [{ [field]: { $regex: regex } }, { [field]: { $ne: "" } }],
            },
        },
        { $group: { _id: `$${field}`, count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
        { $limit: limit },
        { $project: { name: "$_id", count: 1, _id: 0 } },
    ]);

const searchUsers = (regex, limit) =>
    User.find({
        $or: [
            { name: regex },
            { username: regex },
            { additionalName: regex },
            { bio: regex },
            { collegeName: regex },
            { university: regex },
            { company: regex },
        ],
    })
        .select(USER_FIELDS)
        .limit(limit);

const searchPosts = (regex, limit) =>
    Post.find({ content: regex })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("author", AUTHOR_FIELDS);

export const search = async (req, res) => {
    try {
        const q = req.query.q?.trim();
        const type = req.query.type || "all";
        const limit = Math.min(20, Math.max(1, Number(req.query.limit) || 10));

        if (!q || q.length < 2) {
            return res.status(400).json({ message: "Search query must be at least 2 characters" });
        }

        const validTypes = ["all", "users", "colleges", "companies", "universities", "posts"];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ message: "Invalid search type" });
        }

        const regex = new RegExp(escapeRegex(q), "i");
        const results = {};

        if (type === "all" || type === "users") {
            results.users = await searchUsers(regex, limit);
        }
        if (type === "all" || type === "colleges") {
            results.colleges = await aggregateDistinct("collegeName", regex, limit);
        }
        if (type === "all" || type === "companies") {
            results.companies = await aggregateDistinct("company", regex, limit);
        }
        if (type === "all" || type === "universities") {
            results.universities = await aggregateDistinct("university", regex, limit);
        }
        if (type === "all" || type === "posts") {
            results.posts = await searchPosts(regex, limit);
        }

        res.status(200).json({ query: q, type, results });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};
