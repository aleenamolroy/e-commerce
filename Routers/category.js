import { categoryAdd, categoryDelete, categoryEdit, categorylist } from "../Controllers/Category.js";
import { Router } from "express";
import { isAdmin } from "../Middleware/adminauth.js";
const router = Router()
router.get('/list',categorylist)
router.use(isAdmin)
router.post('/categoryAdd',categoryAdd)
router.put('/categoryedit/:id',categoryEdit)
router.delete('/categoryDelete/:id',categoryDelete)
export default router