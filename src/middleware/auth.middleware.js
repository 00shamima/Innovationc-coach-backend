const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        console.log("Checking Token:", token); 

        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'innovation_coach_secret');
        console.log("Decoded User:", decoded); 
        
        req.user = decoded;
        next();
    } catch (err) {
        console.error("JWT Auth Error:", err.message);
        return res.status(401).json({ message: "Invalid token" });
    }
};