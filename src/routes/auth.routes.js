const express = require('express')
const authControllers = require('../controllers/auth.controllers')
const router = express.Router()

// Expose registration and login endpoints.
router.post('/register', authControllers.registerUser)  
router.post('/login', authControllers.loginuser)

  
module.exports = router