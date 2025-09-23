import { Router } from "express";
import { logout } from "../Controllers/logout.js";

const router= Router()
router.post("/",logout)
export default router