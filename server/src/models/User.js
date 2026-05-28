import mongoose from "mongoose"
import bcrypt from "bcrypt"


const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
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
            default: "",
        },
    },
    {
        timestamps: true
    }
)



//we are defining a method named comparePassword that compares pass with the og pass stored in user schema.
//We are attaching this method in the user doc (in mongoose) itself.
userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}


//this removes the password from json so that its not visible to anyone
userSchema.set('toJSON', {
    transform: function (doc, ret) {
        delete ret.password;
        delete ret.__v;
        return ret;
    }
});


//hasing password
userSchema.pre("save", async function () { //this function always runs before saving the original schema 
    if (!this.isModified("password")) return;
    this.password = await bcrypt.hash(this.password, 10); //hashing the raw password //runs only if the pass is modified
});


const userModel = mongoose.model("User", userSchema);
export default userModel;