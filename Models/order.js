import mongoose from "mongoose";
const orderSchema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
        },
    items:[{
        product:{type:mongoose.Schema.Types.ObjectId,ref:"Product",required:true},
        quantity:{type:Number,required:true}
    }],
    totalPrice:{type:Number},
    paymentStatus:{type:String,enum:["pending","paid","failed"],default:"pending"},
    shippingStatus:{type:String,enum:["pending","Shipped","delivered","cancelled"],default:"pending"}
},{timestamps:true})
const Order= mongoose.model('order',orderSchema)
export default Order