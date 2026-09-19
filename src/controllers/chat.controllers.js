const chatModel = require('../models/chat.models')

// Create a new chat owned by the authenticated user.
async function createChat(req,res){
    const {title} = req.body
    const user = req.user

    const chat = await chatModel.create({
        user: user._id,
        title
    })

    res.status(201).json({
        message: "Chat created Successfully",
        chat: {
            _id: chat._id,
            title: chat.title,
            lastActivity: chat.lastActivity,
            user: chat.user
        }
    })

}

// Get all chats for the authenticated user.
async function getChats(req, res) {
    const user = req.user;
    const chats = await chatModel.find({ user: user._id }).sort({ lastActivity: -1 });
    res.status(200).json({
        chats
    });
}

module.exports = {
    createChat,
    getChats
}