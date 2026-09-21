const userModel = require('../models/user.models')
const jwt = require('jsonwebtoken')

// Verify the request JWT and attach the matching user to the request.
async function userauth(req,res,next){
    const authorization = req.headers?.authorization;
    const bearerToken = authorization?.startsWith("Bearer ")
        ? authorization.slice(7)
        : authorization;
    const token = req.cookies?.token || bearerToken;

    if(!token){
        return res.status(401).json({message: "Unauthorized access"})
    }

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await userModel.findById(decoded.id)

        if(!user){
            return res.status(401).json({message: "Unauthorized access"})
        }

        req.user = user
        next()

    }
    catch(err){
        return res.status(401).json({message: "Unauthorized access"})

    }


}

module.exports = {
    userauth
}