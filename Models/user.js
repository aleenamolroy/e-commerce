import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    profile_image: { type: String, required: true },
    password: { type: String, require: true },
    status: { type: String, enum: ['active', 'inactive'], default: "active" }
})
const User = mongoose.model('User', userSchema)
export default User
