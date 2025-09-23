import { Router } from "express";
import { createOrder, update_status, viewOrder, viewOrders_admin } from "../Controllers/order.js";
import { isUser } from "../Middleware/userauth.js";
import { isAdmin } from "../Middleware/adminauth.js";
const router = Router()

router.post('/createOrder',isUser,createOrder)
router.get('/vieworder/:id',isUser,viewOrder)
router.get('/viewOrders',isAdmin,viewOrders_admin)
router.put('/update/:id',isAdmin,update_status)

export default router
