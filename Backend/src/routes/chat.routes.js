const express = require('express')
const authMiddleware = require('../middlewares/auth.middlewares')
const chatController = require('../controllers/chat.controllers')
const router = express.Router()

// Chat endpoints
router.post('/', authMiddleware.userauth, chatController.createChat)
router.get('/', authMiddleware.userauth, chatController.getChats)
router.get('/:chatId/messages', authMiddleware.userauth, chatController.getMessages)
router.delete('/:chatId', authMiddleware.userauth, chatController.deleteChat)

module.exports = router   