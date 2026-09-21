const express = require('express')
const authControllers = require('../controllers/auth.controllers')
const authMiddleware = require('../middlewares/auth.middlewares')
const router = express.Router()

// Expose registration, login, session check, and logout endpoints.
router.post('/register', authControllers.registerUser)  
router.post('/login', authControllers.loginuser)
router.get('/me', authMiddleware.userauth, authControllers.getMe)
router.post('/logout', authControllers.logoutUser)

module.exports = router