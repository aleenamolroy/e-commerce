export const isAdmin= async (req,res,next)=>{
    try{
        if(req.session.user && req.session.user.type==='admin'){
            return next()
        }
        else{
            return res.status(403).json({message:'Access Denied - Admin Only'})
        }
    }
    catch(err){
        console.log(err)
        return res.status(500)
    }
}