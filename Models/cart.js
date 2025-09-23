import mongoose from "mongoose";

const cartschema=new mongoose.Schema({
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
        },
    items:[{
        product:{type:mongoose.Schema.Types.ObjectId,ref:"Product",required:true},
        quantity:{type:Number,required:true,min:1,default:1}
    }],
    totalPrice:{type:Number,default:0},
    
},{timestamps:true})
const Cart= mongoose.model("cart",cartschema)
export default Cart