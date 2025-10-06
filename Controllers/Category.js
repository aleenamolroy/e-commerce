import Category from "../Models/category.js";
export const categorylist= async (req,res)=>{
    try{
        const categories= await Category.find()
        if(!categories){
            return res.status(404).json({message:"categories not found"})
        }
        return res.status(200).json({categories})
    }
    catch(err){
        console.log(err);
        return res.status(500).json({message:'server error'})
    }
}

export const categoryAdd= async (req,res)=>{
         
    try{
        const {name,description}=req.body;        
        const newcategory= new Category({name:name,description:description})
        await newcategory.save()
        return res.status(200).json({message:"category successfully added", name:name})
    }
    catch(err){
        console.log(err);
        res.status(500)
        
    }
}
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    return res.status(200).json({ category });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};
export const categoryEdit= async (req,res)=>{
    try{
        const {id}= req.params;
        const {name, description} =req.body
        
        // console.log(req.body);
        const datatosend = {
            name,
            description
        }
        
        const updateCategory= await Category.findByIdAndUpdate(id,datatosend,{new:true})
        if(!updateCategory) return res.status(404).json({message:"category not found"})
        return res.status(200).json({message:'Category updated successfully',name:name})
    }
    catch(err){
        console.log(err)
        return res.status(500).json({message:'servr error'})
    }
}
export const categoryDelete= async (req,res)=>{
    const {id}=req.params
    try{
        const deletecategory=await Category.findByIdAndDelete(id)
        if(!deletecategory) return res.status(404).json({message:'category not found'})
        return res.status(200).json({message:'category deleted successfully.',deletecategory})
    }
    catch(err){
        console.log(err)
        res.status(500).json({message:'server error'})
    }
}