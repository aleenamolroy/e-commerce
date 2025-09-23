export const isUser = async (req, res, next) => {
    try {
        if (req.session.user && req.session.user.type === 'user') {
            return next()
        }
        else {
            return res.status(500).json({ message: 'not a valid user' })
        }
    }
    catch(err){
        console.log(err)
        return res.status(500)
    }
    
}