import mongoose from "mongoose"
import Product from "../Models/product.js"
import Category from "../Models/category.js"

//retrive a specific product
export const product_seacrch = async (req, res) => {
    try {
        const { id } = req.params
        const product = await Product.findById(id)
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        return res.status(200).json({ product: product })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: "server error" })
    }
}
export const searchProduct = async (req, res) => {
    try {
        const {name}  = req.query
        console.log(name);
        
        const products = await Product.find({ name: { $regex: name, $options: "i" } }).populate("category", "name")
        if (products.length === 0) {
            return res.status(404).json({ message: "Product not found" })
        }
        console.log(products)
        return res.status(200).json({ products })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ message: "server error" })
    }
}
export const list = async (req, res) => {
    try {
        const products = await Product.find().populate("category", "name");
        console.log(products)
        return res.status(200).json({ products })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ message: "server error" })
    }
}
export const productadd = async (req, res) => {
    try {
        let photo = ""
        if (req.file) {
            photo = req.file.filename
        }
        const categoryobj = await Category.findOne({ name: req.body.category })
        const { name, price, stock, description, brand, category } = req.body
        if (!categoryobj) { return res.status(404).json({ message: "Category not found" }) }
        const newProduct = await new Product({
            name: name,
            price: price,
            stock: stock,
            description: description,
            brand: brand,
            productimg: photo,
            category: categoryobj._id
        })
        console.log(newProduct)
        const saveproduct = await newProduct.save()
        return res.status(200).json({ message: "product successfully added.", product: saveproduct })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ message: "server error" })
    }
}

export const productEdit = async (req, res) => {
    try {
        console.log(req.body.category)
        let photo = ""
        if (req.file) {
            photo = req.file.filename
        }
        const categoryobj = await Category.findOne({ name: req.body.category })

        console.log(categoryobj)
        const { id } = req.params
        const productId = new mongoose.Types.ObjectId(id)
        const { name, price, stock, description, brand, productimg, category } = req.body
        const updateproducts = await Product.findByIdAndUpdate(productId, { name, price, stock, description, brand, productimg: photo, category: categoryobj._id })
        if (!updateproducts) {
            return res.status(404).json({ message: "product not found" })
        }
        return res.status(200).json({ message: "Product successfully updated!", product: updateproducts })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: "server error" })

    }
}

export const productDelete = async (req, res) => {
    try {
        const { id } = req.params
        const DeleteProduct = await Product.findByIdAndDelete(id)
        if (!DeleteProduct) {
            return res.status(404).json({ message: "Product not found" })
        }
        console.log(req.session.user)

        return res.status(200).json({ message: "Product Successfully deleted", DeleteProduct })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: "server error" })

    }

}