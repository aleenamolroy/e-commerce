import mongoose from "mongoose";
import Category from "./category.js";
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    description: { type: String, required: true },
    brand: { type: String, required: true, trim: true },
    productimg: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "category" }, 
})
const Product = mongoose.model("product", productSchema)
export default Product