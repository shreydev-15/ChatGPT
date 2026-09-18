const userModel = require('../models/user.models')
const jwt = require('jsonwebtoken')

async function userauth(req,res,next){
    const {token} = req.cookies;

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