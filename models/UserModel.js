import mongoose from 'mongoose';
import bcrypt from 'bcrypt'
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstName: {
        type: String,
        required: [true, "First name is required"],
    },
    lastName: {
        type: String,
        required: [true, "Last name is required"],
    },
    contact: {
        type: String,
        required: [true, "Contact is required"],
    },
    email: {
        type: String,
        required: [true, "Email is required"],
        unique: true
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },
    roles: {
        type: [String],
        default: ["customer"],
    },
    verifyToken: {
        type: String,
        default: "",
    },
    verifyTokenExpire: {
        type: Date,
    },
}, { timestamps: true });

UserSchema.pre("save", async function (next) {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(this.password, salt);
        this.password = hashedPassword;
        next();
    } catch (error) {
        next(error);
    }
});

UserSchema.methods.isValidPassword = async function (password) {
    try {
        return await bcrypt.compare(password, this.password);
    } catch (error) {
        throw error;
    }
};


const User = mongoose.model("user", UserSchema);

export default User;

