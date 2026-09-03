import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        additionalName: {
            type: String,
            default: "",
        },
        username: {
            type: String,
            unique: true,
            required: true,
        },
        email: {
            type: String,
            unique: true,
            required: true,
        },
        password: {
            type: String,
            required: true,
            select: false,
        },
        profilePic: {
            type: String,
            default: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y",
        },
        coverPic: {
            type: String,
            default: "",
        },
        bio: {
            type: String,
            default: "",
        },
        about: {
            type: String,
            default: "",
        },
        skills: {
            type: [String],
            default: [],
        },
        collegeName: {
            type: String,
            default: "",
        },
        companyName: {
            type: String,
            default: "",
        },
        startYear: {
            type: Number,
            default: 0,
        },
        endYear: {
            type: Number,
            default: 0,
        },
        locationCountry: {
            type: String,
            default: "",
        },
        locationPostalCode: {
            type: String,
            default: "",
        },
        locationCity: {
            type: String,
            default: "",
        },
        isCollegeVerified: {
            type: Boolean,
            default: false,
        },
        profileViewers: [
            {
                viewer: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "User",
                },
                viewedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    {
        timestamps: true,
    }
);

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
};

userSchema.set("toJSON", {
    transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
    },
});

userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10);
});

const userModel = mongoose.model("User", userSchema);
export default userModel;