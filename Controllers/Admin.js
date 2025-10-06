import Admin from "../Models/admin.js"
import bcrypt from "bcrypt"
import User from "../Models/user.js"
export async function Adminlogin(req, res) {
    const { email, password } = req.body
    try {
        const adminfound = await Admin.findOne({ email })
        if (!adminfound) {
            return res.status(401).json({ message: "Unauthorised Login" })
        }
        if (email === adminfound.email) {
            const ismatch = await bcrypt.compare(password, adminfound.password)
            if (!ismatch) {
                return res.status(401).json({ message: "Password incorrect" })
            }
            req.session.user = {
                id: adminfound._id,
                type: "admin"
            }
            console.log(req.session.user);

            //     if(ismatch){
            //         req.session.userId=admin._id
            //     }
            //     console.log(req.session.userId)
        } else {
            return res.status(401).json({ message: "Email not match" })
        }
        req.session.save(err => {
            if (err) return res.status(500).json({ message: "session not saved" });
            return res.status(200).json({
                _id: adminfound._id,
                type: "admin",
                message: "Successfully Logged as admin"
            });

        })
    }
    catch (err) {
        console.log("Error:" + err)
        res.sendStatus(500)
    }
}
//user list
export const users = async (req, res) => {
    try {
        const users = await User.find().select("-password")
        if (!users) {
            return res.status(404).json({ message: "user not found" })
        }
        return res.status(200).json({ data: users })
    }
    catch (err) {
        res.status(500).json({ data: err })
    }
}
//user change status

export const changeStatus = async (req, res) => {
    try {
        const { id } = req.params
        const { status } = req.body
        const changeStatus = await User.findByIdAndUpdate(id, { status })
        if (!changeStatus) {
            return res.status(404).json({ message: "user is not exist" })
        }
        return res.status(200).json({ message: `status successfully changed to ${status}` })
    }
    catch (err) {
        return res.status(500).json({ message: err })
    }
}