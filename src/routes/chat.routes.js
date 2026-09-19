const express = require('express')
const authMiddleware = require('../middlewares/auth.middlewares')
const chatController = require('../controllers/chat.controllers')
const router = express.Router()

// Create chats only for authenticated users.
router.post('/', authMiddleware.userauth, chatController.createChat)
router.get('/', authMiddleware.userauth, chatController.getChats)

module.exports = router 