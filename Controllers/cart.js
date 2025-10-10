import Cart from "../Models/cart.js";
import Product from "../Models/product.js";
import mongoose from "mongoose";
export const showcart = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.session.user.id)
        const cart = await Cart.aggregate([
            { $match: { user: userId } },
            { $addFields: { totalPriceOriginal: "$totalPrice" } },
            { $unwind: "$items" },
            {
                $lookup: {
                    from: "products",
                    localField: "items.product",
                    foreignField: "_id",
                    as: "productDetails"
                }
            },
            { $unwind: "$productDetails" },
            {
                $lookup: {
                    from: "categories",
                    localField: "productDetails.category",
                    foreignField: "_id",
                    as: "categoryDetails"
                }
            },
            { $unwind: "$categoryDetails" },
            {
                $group: {
                    _id: "$_id",
                    user: { $first: "$user" },
                    items: {
                        $push: {
                            product: {
                                id: "$productDetails._id",
                                name: "$productDetails.name",
                                price: "$productDetails.price",
                                productimg: "$productDetails.productimg"
                            },
                            category: {
                                name: "$categoryDetails.name"
                            },
                            quantity: "$items.quantity",
                            subtotal: { $multiply: ["$items.quantity", "$productDetails.price"] }
                        }
                    },
                    totalPrice: { $first: "$totalPriceOriginal" }
                }
            }
        ])
        console.log(cart)
        return res.status(200).json(cart)
    }
    catch (err) {
        console.log(err);

        return res.status(500).json({ message: "Internal server error" })
    }
}
export const AddCart = async (req, res) => {
    try {
        const userId = req.session.user.id
        const productId = req.params.id
        const { quantity } = req.body
        if (!productId) {
            return res.status(400).json({ message: "productId is not found " })
        }
        if (quantity < 1) {
            return res.status(400).json({ message: " quantity must be at least 1" })

        }
        const product = await Product.findById(productId)
        if (!product) {
            return res.status(404).json({ message: "product not found" })
        }
        if (product.stock === 0) {
            return res.status(404).json({ message: "Stock Out" })
        }
        let cart = await Cart.findOne({ user: userId })
        if (!cart) {
            const totalPrice = product.price * quantity
            const newCart = await Cart({
                user: userId,
                items: [{
                    product: productId,
                    quantity: quantity
                }],
                totalPrice: totalPrice
            })
            await newCart.save()
            return res.status(200).json({ message: "cart successfully added", cart: newCart })

        }
        //if cart
        // const itemIndex=  cartExitst.items.findIndex(
        //     (item)=> item.product.toString() === productId
        // )
        // if(itemIndex>-1){
        //     const newquantity= cartExitst.items[itemIndex].quantity+quantity
        //     cartExitst.items[itemIndex].quantity=newquantity
        // }
        // else{
        //     cartExitst.items.push({product:productId,quantity})
        // }
        cart = await Cart.findOneAndUpdate(
            { user: userId, "items.product": productId },
            { $inc: { "items.$.quantity": quantity } },
            { new: true }
        );
        if (!cart) {
            cart = await Cart.findOneAndUpdate(
                { user: userId },
                { $push: { items: { product: productId, quantity } } },
                { new: true }
            );
        }
        let newTotal = 0
        for (const item of cart.items) {
            const p = await Product.findById(item.product)

            console.log(p)
            newTotal += p.price * item.quantity
        }

        cart.totalPrice = newTotal
        product.stock = product.stock - quantity
        await cart.save()
        await product.save()
        return res.status(200).json({ cart, message: "Added to cart" })
    }
    catch (err) {
        console.log(err)
        return res.status(500)
    }
}

export const updatecart = async (req, res) => {
    try {
        const userId = req.session.user.id
        const productId = req.params.id
        const { quantity } = req.body
        console.log(quantity)
        // const product= await Product.findById(productId)
        // const newCart= await Cart.findOne({user:userId})
        // if (!newCart) return res.status(404).json({ message: "Cart not found" });
        // const itemIndex=newCart.items.findIndex(
        //         (item)=>item.product.toString() === productId
        // )
        // newCart.items[itemIndex].quantity=quantity
        const cartdata = await Cart.findOne({ user: userId });
        const productofcart = cartdata.items.find(item => item.product.toString() === productId);
        const oldquantity = productofcart.quantity;
        const diffquantity=oldquantity-quantity
        const updatestock = await Product.findOneAndUpdate({_id:productId})
        updatestock.stock=updatestock.stock+diffquantity
        const cart = await Cart.findOneAndUpdate({ user: userId, "items.product": productId }, { $set: { "items.$.quantity": quantity } }, { new: true })
        if (!cart) return res.status(404).json({ message: "Cart not found" });
        let total = 0
        for (const item of cart.items) {
            const p = await Product.findById(item.product)
            total += p.price * item.quantity
        }
        cart.totalPrice = total
        await cart.save()
        await updatestock.save()
        res.status(200).json({ message: "Cart updated", cart });

    } catch (err) {
        console.log(err)
        return res.status(500)
    }
}
export const deletecart = async (req, res) => {
    try {
        const userId = req.session.user?.id
        const productId = req.params.id
        if (!userId) return res.status(401).json({ message: "Not logged in" });
        if (!productId) return res.status(400).json({ message: "Product ID required" });
        const deletecart = await Cart.findOneAndUpdate({ user: userId, "items.product": productId }, { $pull: { items: { product: productId } } }, { new: true })
        if (!deletecart) {
            return res.status(404).json({ message: "cart not found" })
        }
        console.log(deletecart)
        let total = 0
        for (const item of deletecart.items) {
            const p = await Product.findById(item.product)
            total = p.price * item.quantity
        }
        deletecart.totalPrice = total
        await deletecart.save()
        return res.status(200).json({ message: "successfully deleted item from cart", deletecart })

    }
    catch (err) {
        console.log(err)
        return res.status(500)
    }
}