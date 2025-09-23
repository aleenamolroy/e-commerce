import mongoose from "mongoose";

const adminSchema=new mongoose.Schema({},{strict:false})
const Admin= mongoose.model('Admin',adminSchema,"admin")
export default Admin;