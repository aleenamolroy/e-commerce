import Order from "../Models/order.js";
import Cart from "../Models/cart.js";
import mongoose, { Aggregate } from "mongoose";
import Category from "../Models/category.js";
export const createOrder = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.session.user.id)
        const cart = await Cart.findOne({ user: userId })
        console.log(cart, userId)
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ message: "Cart is empty" })
        }
        const orderItems = cart.items.map(item => ({
            product: item.product,
            quantity: item.quantity
        }))
        const totalPrice = cart.totalPrice
        const neworder = new Order({
            user: userId,
            items: orderItems,
            totalPrice: totalPrice
        })
        await neworder.save()
        await Cart.findOneAndDelete({ user: userId })
        return res.status(200).json({ message: "Order created successful" })
    }
    catch (err) {
        console.log(err);

        return res.status(500).json({ message: "Server error" })
    }
}

export const viewOrder = async (req, res) => {
    try {
        const { id } = req.params
        const userId = new mongoose.Types.ObjectId(req.session.user.id)
        // if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(req.session.user.id)) {
        //     return res.status(400).json({ message: 'Invalid order or user ID' });
        // }
        const orderId = new mongoose.Types.ObjectId(id)
        console.log("orderId:", orderId);
        console.log("userId:", userId);

        const order = await Order.aggregate([
            { $match: { user: userId, _id: orderId } },
            { $addFields: { totalPriceOrginal: "$totalPrice", payment:"$paymentStatus", Status:"$shippingStatus"} },
            { $unwind: "$items" },
            { $lookup: { from: "products", localField: "items.product", foreignField: "_id", as: "productDetails" } },
            { $unwind: "$productDetails" },
            { $lookup: { from: "categories", localField: "productDetails.category", foreignField: "_id", as: "categoryDetails" } },
            { $unwind: "$categoryDetails" },
            {
                $group: {
                    _id: "$_id",
                    user: { $first: "$user" },
                    items: {
                        $push: {
                            product: {
                                name: "$productDetails.name",
                                price: "$productDetails.price",
                                productimg: "$productDetails.productimg"
                            },
                            Category: {
                                name: "$categoryDetails.name"
                            },
                            quantity: "$items.quantity",
                            subtotal: { $multiply: ["$items.quantity", "$productDetails.price"] }
                        }
                    },
                    Amount: { $first: "$totalPriceOrginal" },
                    payment:{$first:"$payment"},
                    status:{$first:"$Status"}
                }
            }
        ])
        console.log(order);

        if (!order || order.length === 0) {
            return res.status(400).json({ message: 'order not found' })
        }
        return res.status(200).json({ order })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'server error' })

    }
}

export const viewOrders_admin = async (req, res) => {
    try {
        const orders = await Order.aggregate([
            { $addFields: { totalPriceOrginal: "$totalPrice", payment:"$paymentStatus", Status:"$shippingStatus"} },
            { $unwind: "$items" },
            {$lookup:{from: "users", localField: "user", foreignField: "_id", as: "userDetails" }},
             { $unwind: "$userDetails" },
            { $lookup: { from: "products", localField: "items.product", foreignField: "_id", as: "productDetails" } },
            { $unwind: "$productDetails" },
            { $lookup: { from: "categories", localField: "productDetails.category", foreignField: "_id", as: "categoryDetails" } },
            { $unwind: "$categoryDetails" },
            {
                $group: {
                    _id: "$_id",
                    user: { $first: "$userDetails.name" },
                    items: {
                        $push: {
                            product: {
                                name: "$productDetails.name",
                                price: "$productDetails.price",
                                productimg: "$productDetails.productimg"
                            },
                            Category: {
                                name: "$categoryDetails.name"
                            },
                            quantity: "$items.quantity",
                            subtotal: { $multiply: ["$items.quantity", "$productDetails.price"] }
                        }
                    },
                    Amount: { $first: "$totalPriceOrginal" },
                    payment:{$first:"$payment"},
                    status:{$first:"$Status"}
                }
            },
            {$sort:{_id:1}}
        ])
        console.log(orders);
        
        if (!orders || orders.length === 0) {
            return res.status(400).json({ message: 'order not found' })
        }
        return res.status(200).json({ orders })
    }
     catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'server error' })

    }
    
}
export const update_status=async (req,res)=>{
    const {id}=req.params
    const {paymentStatus,shippingStatus}=req.body
    const Updateorder=await Order.findByIdAndUpdate(id,{paymentStatus,shippingStatus},{new:true})
    const orderId= new mongoose.Types.ObjectId(id)
    if(!Updateorder){
        return res.status(400).json({message:"order not found"})
    }
    const order=await Order.aggregate([
            {$match:{_id:orderId}},
            { $addFields: { totalPriceOrginal: "$totalPrice", payment:"$paymentStatus", Status:"$shippingStatus"} },
            { $unwind: "$items" },
            {$lookup:{from: "users", localField: "user", foreignField: "_id", as: "userDetails" }},
             { $unwind: "$userDetails" },
            { $lookup: { from: "products", localField: "items.product", foreignField: "_id", as: "productDetails" } },
            { $unwind: "$productDetails" },
            { $lookup: { from: "categories", localField: "productDetails.category", foreignField: "_id", as: "categoryDetails" } },
            { $unwind: "$categoryDetails" },
            {
                $group: {
                    _id: "$_id",
                    user: { $first: "$userDetails.name" },
                    items: {
                        $push: {
                            product: {
                                name: "$productDetails.name",
                                price: "$productDetails.price",
                                productimg: "$productDetails.productimg"
                            },
                            Category: {
                                name: "$categoryDetails.name"
                            },
                            quantity: "$items.quantity",
                            subtotal: { $multiply: ["$items.quantity", "$productDetails.price"] }
                        }
                    },
                    Amount: { $first: "$totalPriceOrginal" },
                    payment:{$first:"$payment"},
                    status:{$first:"$Status"}
                }
            }])
    return res.status(200).json({message:"status changed",Data:order})
}