import Order from "../Models/order.js";
import Cart from "../Models/cart.js";
import mongoose, { Aggregate } from "mongoose";
import Category from "../Models/category.js";
import { log } from "console";
import Product from "../Models/product.js";
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
            { $addFields: { totalPriceOrginal: "$totalPrice", payment: "$paymentStatus", Status: "$shippingStatus" } },
            { $unwind: "$items" },
            { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "userDetails" } },
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
                                productimg: "$productDetails.productimg",
                                Category: "$categoryDetails.name",
                                quantity: "$items.quantity",
                                subtotal: { $multiply: ["$items.quantity", "$productDetails.price"] }
                            }

                        }
                    },
                    Amount: { $first: "$totalPriceOrginal" },
                    payment: { $first: "$payment" },
                    status: { $first: "$Status" }
                }
            }
        ])

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
export const showorder = async (req, res) => {
    try {
        const userId = new mongoose.Types.ObjectId(req.session.user.id)
        const order = await Order.aggregate([
            { $match: { user: userId } },
            {
                $addFields: {
                    totalPriceOriginal: "$totalPrice",
                    shippingStatus: "$shippingStatus",
                    paymentStatus: "$paymentStatus",
                    createdAt: "$createdAt"
                },
            },
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
                    shippingStatus: { $first: "$shippingStatus" },
                    paymentStatus: { $first: "$paymentStatus" },
                    totalPrice: { $first: "$totalPriceOriginal" },
                    createdAt: { $first: "$createdAt" }
                }
            }
        ])
        return res.status(200).json(order)
    }
    catch (err) {
        console.log(err);

        return res.status(500).json({ message: "Internal server error" })
    }
}
export const viewOrders_admin = async (req, res) => {
    try {
        const orders = await Order.aggregate([
            { $addFields: { totalPriceOrginal: "$totalPrice", payment: "$paymentStatus", Status: "$shippingStatus" } },
            { $unwind: { path: "$items", preserveNullAndEmptyArrays: true } },
            { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "userDetails" } },
            { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },
            { $lookup: { from: "products", localField: "items.product", foreignField: "_id", as: "productDetails" } },
            { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } },
            { $lookup: { from: "categories", localField: "productDetails.category", foreignField: "_id", as: "categoryDetails" } },
            { $unwind: { path: "$categoryDetails", preserveNullAndEmptyArrays: true } },
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
                            Category: "$categoryDetails.name"
                            ,
                            quantity: "$items.quantity",
                            subtotal: { $multiply: ["$items.quantity", "$productDetails.price"] }
                        }
                    },
                    Amount: { $first: "$totalPriceOrginal" },
                    payment: { $first: "$payment" },
                    status: { $first: "$Status" }
                }
            },
            { $sort: { _id: 1 } }
        ])

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
export const update_status = async (req, res) => {
    try {
        const { id } = req.params
        const { paymentStatus, shippingStatus } = req.body
        const order = await Order.findById(id)
        if (!order) return res.status(404).json({ message: "Order not found" })
        const validPaymentTransitions = {
            pending: ["paid", "failed"],
            paid: [],
            failed: ["pending"],
        };
        if (
            paymentStatus &&
            paymentStatus !== order.paymentStatus &&
            !validPaymentTransitions[order.paymentStatus]?.includes(paymentStatus)
        ) {
            return res
                .status(400)
                .json({
                    message: `Invalid payment status transition from "${order.paymentStatus}" to "${paymentStatus}"`,
                });
        }
        const validShippingTransitions = {
            pending: ["shipped", "cancelled"],
            shipped: ["delivered", "cancelled"],
            delivered: [],
            cancelled: [],
        };
        if (
            shippingStatus &&
            shippingStatus !== order.shippingStatus &&
            !validShippingTransitions[order.shippingStatus]?.includes(shippingStatus)
        ) {
            return res
                .status(400)
                .json({
                    message: `Invalid shipping status transition from "${order.shippingStatus}" to "${shippingStatus}"`,
                });
        }
        
        const Updateorder = await Order.findByIdAndUpdate(id, { paymentStatus, shippingStatus }, { new: true })
        // const orderId = new mongoose.Types.ObjectId(id)
        if (!Updateorder) {
            return res.status(404).json({ message: "order not found" })
        }

        return res.status(200).json({ message: "status changed",updatedOrder: Updateorder})
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'server error' })

    }
}

export const cancel_order = async (req, res) => {
    try {
        const { id } = req.params
        const order = await Order.findById(id)
        const { shippingStatus } = req.body
        console.log(req.body)
        if (!order) {
            return res.status(404).json({ message: "order not found" })
        }
        if (order.shippingStatus === 'delivered' || order.shippingStatus === 'cancelled') {
            return res.status(400).json({ message: "You can't cancell this order please check the order status" })
        }
        const orderUpdate = await Order.findByIdAndUpdate(id, { shippingStatus }, { new: true })
        return res.status(200).json({ message: "order cancelled" ,updatedOrder: orderUpdate })
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'server error' })

    }
}
export const CancelOrder = async (req, res) => {
    try {
        const { id } = req.params
        const order = await Order.findById(id)
        const { shippingStatus } = req.body
        if (order.shippingStatus === 'delivered' || order.shippingStatus === 'cancelled') {
            return res.status(400).json({ message: "You can't cancel this order please check your order status" })
        }
        const orderUpdate = await Order.findByIdAndUpdate(id, { shippingStatus }, { new: true })
        await orderUpdate.save()
        return res.status(200).json({ message: "order cancelled" })

    } catch (err) {
                console.log(err);

        return res.status(500).json({ message: 'server error' })

    }
}