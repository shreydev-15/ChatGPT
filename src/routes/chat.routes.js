const express = require('express')
const authMiddleware = require('../middlewares/auth.middlewares')
const chatController = require('../controllers/chat.controllers')
const router = express.Router()

router.post('/', authMiddleware.userauth, chatController.createChat)




module.exports = router 