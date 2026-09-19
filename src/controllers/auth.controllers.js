const userModel = require("../models/user.models.js")
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

async function registerUser(req,res){
    const { fullname: {firstname, lastname}, email, password} = req.body

    const isUserAlreadyExists = await userModel.findOne({email})

    if(isUserAlreadyExists){
        return res.status(400).json({
            message: "User Already Exists"
        })
    }

    const hashpass = await bcrypt.hash(password, 10)
    const user = await userModel.create({
        fullname:{
            firstname, lastname

        },
        email,
        password: hashpass

    })
    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET)
    res.cookie("token", token)
    res.status(201).json({
        message: "User registered Succussfully",
        token,
        user: {
            email: user.email,
            fullname : user.fullname,
            _id: user._id
        }
    })
}

async function loginuser(req,res) {
    const {email, password} = req.body;
    const user = await userModel.findOne({email})

    if(!user){
        return res.status(400).json({
            message: "User not logged in with these credentials"
        })
    }

    const isPasswordValid = await bcrypt.compare(password, user.password) ;
     if(!isPasswordValid){
        return res.status(400).json({
            message: "User not logged in with these credentials"
        })
    }

    const token = jwt.sign({id: user._id}, process.env.JWT_SECRET)
    res.cookie("token", token)
    
        res.status(201).json({
        message: "User looged in Succussfully",
        token,
        user: {
            email: user.email,
            fullname : user.fullname,
            _id: user._id
        }
    })

    
        

} 

module.exports = {
    registerUser,
    loginuser
}