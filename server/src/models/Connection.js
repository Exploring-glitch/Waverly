import mongoose from "mongoose";

const connectionSchema = new mongoose.Schema(
    {
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        status: {
            type: String,
            enum: ["pending", "accepted"],
            default: "pending"
        }
    },
    { timestamps: true }
);

// Prevent duplicate connections or requests between the same pair
connectionSchema.index({ sender: 1, recipient: 1 }, { unique: true });

const Connection = mongoose.model("Connection", connectionSchema);
export default Connection;
