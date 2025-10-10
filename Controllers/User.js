import User from "../Models/user.js";
import bcrypt from "bcrypt"

export async function register(req, res) {
    try {
        let photo = ""
        if (req.file) {
            photo = req.file.filename
        }
        const { name, email, password } = req.body
        const hashedpassword = await bcrypt.hash(password, 10)
        console.log(photo);

        const newUser = new User({ name, email, profile_image: photo, password: hashedpassword })
        await newUser.save()
        return res.status(200).json({ message: "User Registration successful", name: name, email: email })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Failed to register!" })
    }
}
export async function login(req, res) {
    try {
        const { email, password } = req.body
        // console.log(email, password);

        const userFound = await User.findOne({ email })
        if (!userFound) {
            return res.status(401).json({ message: "Email not found" })
        }
        if (email === userFound.email && userFound.status==='active') {
            const ismatch = await bcrypt.compare(password, userFound.password)
            if (!ismatch) {
                return res.status(401).json({ message: "Incorrect password" })
            }

            req.session.user = {
                id: userFound._id,
                type: "user"
            }

            // console.log(req.session.userId)
        } else {
            return res.status(403).json({ message: "Email not match or your not a active user" })
        }
        req.session.save(err=>{
            if(err) return res.status(500).json({message:"session not saved"});
            return res.status(200).json({message:"Successfuly Logged in ",_id: userFound._id,
                type: "user",email:email,name:userFound.name,profile_image:userFound.profile_image,date: new Date().toString()})

        })

    }
    catch (err) {
        console.log(err);

    }
}
export const view=async (req,res)=>{
    try{
        if(!req.session.user){
            return res.status(401).json({message:"not logged in"})
        }
        const userview=await User.findById(req.session.user.id).select("-password")
        if (!userview) {
            return res.status(404).json({ message: "not a valid user" });
        }
        console.log(req.session.user)
        return res.status(200).json({user:userview})
    }
    catch(err){
        console.log(err)
        return res.status(500)
    }
}
export const update=async (req,res)=>{
    try{
        if(!req.session.user){
            return res.status(401).json({message:"not logged in"})
        }
        let photo=""
        if(req.file){
            photo=req.file.filename
        }
        const {name,email,profile_image}=req.body
        const updateUser= await User.findByIdAndUpdate(req.session.user.id,{name,email,profile_image:photo})
        return res.status(200).json({message:"successfully updated",data:updateUser})
    }
    catch(err){

    }
}
