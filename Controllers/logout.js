export const logout = async (req, res) => {
    
    if (!req.session.user) {
        return res.status(400).json({ message: "No user session found" });
    }
    const type = req.session.user.type
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ message: "Logout failed" });
        }
        res.clearCookie('connect.sid')
        return res.status(200).json({ message: "user successfully logged out" })
    })
}