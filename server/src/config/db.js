import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("MongoDB connection successful")
    }
    catch (err) {
        console.log("Error connecting to MongoDB. Error: ", err.message)
        process.exit(1)
    }
}