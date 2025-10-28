import { Router } from "express";
import multer from "multer";
import { list, product_seacrch, productadd, productDelete, productEdit, searchProduct } from "../Controllers/product.js";
import { isAdmin } from "../Middleware/adminauth.js";
const router = Router()
const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,"api/uploads")
    },
    filename:(req,file,cb)=>{
        cb(null,Date.now()+'_'+file.originalname)
    }
})
router.get('/list',list)
router.get('/productsearch/:id',product_seacrch)
router.get('/searchProduct',searchProduct)
router.use(isAdmin)
const upload=multer({storage:storage})
router.post('/productadd',upload.single('productimg'),productadd)
router.put('/productUpdate/:id',upload.single('productimg'),productEdit)
router.delete('/productDelete/:id',productDelete)
export default router