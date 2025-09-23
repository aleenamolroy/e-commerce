import { Router } from "express";
import { AddCart, deletecart, showcart, updatecart } from "../Controllers/cart.js";
import { isUser } from "../Middleware/userauth.js";

const router=Router()
router.use(isUser)
router.post('/Addcart/:id',AddCart)
router.put('/updatecart/:id',updatecart)
router.delete('/cartdelete/:id',deletecart)
router.get('/showcart',showcart)
export default router