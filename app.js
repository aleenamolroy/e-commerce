import express from "express"
import dotenv from "dotenv"
import mongoose, { connect } from "mongoose"
import session from "express-session"
import admin from "./Routers/Admin.js"
import user from "./Routers/User.js"
import category from "./Routers/category.js"
import product from "./Routers/product.js"
import cart from "./Routers/cart.js"
import order from "./Routers/order.js"
import MongoStore from "connect-mongo"
dotenv.config()
const app= express()
app.use(express.json())
app.use(express.urlencoded({extended:true}))
async function connectDB() {
    try{
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Database connected successfully")
    }
    catch(err){
        console.log(err)
        console.log("Connection failed")
    }
}
connectDB()
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave:false,
    saveUninitialized:false,
    store:MongoStore.create({
        // client:mongoose.connection.getClient(),
        mongoUrl:process.env.MONGO_URI,
        ttl:14*24*60*60,
        autoRemove:'native'
    }),
    cookie:{
            maxAge:1000*60*60
        },
        rolling: true
}))

app.use('/admin',admin)
app.use('/user',user)
app.use('/category',category)
app.use('/product',product)
app.use('/cart',cart)
app.use('/order',order)
app.listen(process.env.PORT,()=>{console.log(`http://localhost:${process.env.PORT}`);
})