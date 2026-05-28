import User from "../models/User.js";



export const registerUser = async (req, res) => {
    try {
        const { name, username, email, password, profilePic } = req.body;

        //check if user already exists 
        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(409).json({ message: "User already exists" });
        }

        //create new user
        const newUser = new User({
            name: name,
            username: username,
            email: email,
            password: password,
            profilePic: profilePic,
        })
        await newUser.save()

        res.status(200).json({ "message": "Registration successful", "user": newUser })
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }
}