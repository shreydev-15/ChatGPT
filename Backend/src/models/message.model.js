const mongoose = require('mongoose')

// Define messages that belong to users and chats.
const messageSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",

    },
    chat:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "chat",
        required: true
    },
    content:{
        type: String,
        required: true
    },
    role:{
        type: String,
        enum: ["user", "model", "system"],
        default: "user"
    }
}, {timestamps: true})

// Create the MongoDB model used to store conversation history.
const messageModel  = mongoose.model("message", messageSchema)

module.exports = messageModel