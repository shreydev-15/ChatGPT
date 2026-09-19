const mongoose = require('mongoose')

// Define chat ownership, title, and activity metadata.
const chatSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    title:{
        type: String,
        required: true
    },
    lastActivity:{
        type: Date,
        default: Date.now
    }
}, {timestamps: true})

// Create the MongoDB model used for chat records.
const chatModel = mongoose.model("chat", chatSchema)
module.exports = chatModel