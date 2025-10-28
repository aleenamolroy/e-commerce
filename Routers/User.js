import multer from "multer";
import { Router } from "express";
import { login, register, update, view } from "../Controllers/User.js";
import { isUser } from "../Middleware/userauth.js";
const router= Router()
const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"uploads")
    },
    filename:(req,file,cb)=>{
        cb(null,Date.now()+'_'+file.originalname)
    }
})
const upload=multer({storage:storage})
router.post('/register',upload.single('profile_image'),register)
router.post('/login',login)
router.use(isUser)
router.get('/viewprofile',view)
router.put('/Update',upload.single('profile_image'),update)
export default router