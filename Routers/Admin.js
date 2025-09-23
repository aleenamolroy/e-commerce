import { Adminlogin, changeStatus, users } from "../Controllers/Admin.js";
import { Router } from "express";
import { isAdmin } from "../Middleware/adminauth.js";
const route= Router()
route.post('/AdminLogin',Adminlogin)
route.use(isAdmin)
route.get('/userlist',users)
route.put('/changestatus/:id',changeStatus)
export default route