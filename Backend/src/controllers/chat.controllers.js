const chatModel = require('../models/chat.models')
const messageModel = require('../models/message.model')

// Create a new chat owned by the authenticated user.
async function createChat(req,res){
    const {title} = req.body
    const user = req.user

    const chat = await chatModel.create({
        user: user._id,
        title: title || "New Chat"
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

// Get message history for a specific chat.
async function getMessages(req, res) {
    const user = req.user;
    const { chatId } = req.params;

    const chat = await chatModel.findOne({ _id: chatId, user: user._id });
    if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
    }

    const messages = await messageModel.find({ chat: chat._id }).sort({ createdAt: 1 });
    res.status(200).json({
        messages
    });
}

// Delete a conversation and all its messages.
async function deleteChat(req, res) {
    const user = req.user;
    const { chatId } = req.params;

    const chat = await chatModel.findOneAndDelete({ _id: chatId, user: user._id });
    if (!chat) {
        return res.status(404).json({ message: "Chat not found" });
    }

    await messageModel.deleteMany({ chat: chat._id });
    res.status(200).json({
        message: "Chat deleted successfully"
    });
}

module.exports = {
    createChat,
    getChats,
    getMessages,
    deleteChat
}