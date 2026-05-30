import User from "../models/User.js";
import Post from "../models/Post.js";

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const search = async (req, res) => {
    try {
        const { q, type = "all", limit = 10 } = req.query;

        if (!q || !q.trim()) {
            return res.status(400).json({ message: "Search query is required" });
        }

        const query = q.trim();
        const regex = new RegExp(escapeRegex(query), "i");
        const parsedLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 20);

        const results = {
            query,
            users: [],
            colleges: [],
            companies: [],
            posts: [],
        };

        const searchUsers = type === "all" || type === "users";
        const searchColleges = type === "all" || type === "colleges";
        const searchCompanies = type === "all" || type === "companies";
        const searchPosts = type === "all" || type === "posts";

        const queries = [];

        if (searchUsers) {
            queries.push(
                User.find({
                    $or: [
                        { name: regex },
                        { username: regex },
                        { additionalName: regex },
                        { bio: regex },
                        { collegeName: regex },
                        { companyName: regex },
                    ],
                })
                    .select("-password")
                    .limit(parsedLimit)
                    .then((users) => {
                        results.users = users;
                    })
            );
        }

        if (searchColleges) {
            queries.push(
                User.aggregate([
                    { $match: { collegeName: { $ne: "", $regex: regex } } },
                    { $group: { _id: "$collegeName", memberCount: { $sum: 1 } } },
                    { $sort: { memberCount: -1, _id: 1 } },
                    { $limit: parsedLimit },
                    { $project: { name: "$_id", memberCount: 1, _id: 0 } },
                ]).then((colleges) => {
                    results.colleges = colleges;
                })
            );
        }

        if (searchCompanies) {
            queries.push(
                User.aggregate([
                    { $match: { companyName: { $ne: "", $regex: regex } } },
                    { $group: { _id: "$companyName", memberCount: { $sum: 1 } } },
                    { $sort: { memberCount: -1, _id: 1 } },
                    { $limit: parsedLimit },
                    { $project: { name: "$_id", memberCount: 1, _id: 0 } },
                ]).then((companies) => {
                    results.companies = companies;
                })
            );
        }

        if (searchPosts) {
            queries.push(
                Post.find({ content: regex })
                    .sort({ createdAt: -1 })
                    .limit(parsedLimit)
                    .populate("author", "name username profilePic additionalName")
                    .then((posts) => {
                        results.posts = posts;
                    })
            );
        }

        await Promise.all(queries);

        res.status(200).json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
};
