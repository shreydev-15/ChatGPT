const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.models");
const chatModel = require("../models/chat.models");
const generateResponse = require('../services/ai.service')
const messageModel = require('../models/message.model')

// Create the Socket.IO server and configure socket authentication and events.
function initSocketServer(httpServer) {
    const io = new Server(httpServer, {});

    // Authenticate each socket using a cookie, auth token, or Bearer token.
    io.use(async (socket, next) => {
        try {
            const cookies = cookie.parseCookie(
                socket.handshake.headers?.cookie || ""
            );
            const authorization = socket.handshake.headers?.authorization;
            const bearerToken = authorization?.startsWith("Bearer ")
                ? authorization.slice(7)
                : null;
            const token = cookies.token || socket.handshake.auth?.token || bearerToken;

            if (!token) {
                return next(
                    new Error("Authentication error: No token provided")
                );
            }

            let decoded;
            try {
                decoded = jwt.verify(token, process.env.JWT_SECRET);
            } catch (err) {
                return next(new Error(`Authentication error: ${err.message}`));
            }

            const user = await userModel.findById(decoded.id);

            if (!user) {
                return next(
                    new Error("Authentication error: User not found")
                );
            }

            socket.user = user;

            next();
        } catch (err) {
            console.error("Socket authentication error:", err);
            next(new Error("Authentication error: User lookup failed"));
        }
    });

    // Handle authenticated clients and their AI conversation messages.
    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id);

        // Save the user message, send recent history to Gemini, and emit the reply.
        socket.on('ai-message', async (messagePayload, acknowledgement) => {
            console.log('[DEBUG] ai-message event received');
            console.log('[DEBUG] Raw payload:', JSON.stringify(messagePayload));
            console.log('[DEBUG] Payload type:', typeof messagePayload);

            try {
                // Handle case where Postman sends payload as a JSON string
                if (typeof messagePayload === 'string') {
                    try {
                        messagePayload = JSON.parse(messagePayload);
                        console.log('[DEBUG] Parsed string payload into object');
                    } catch (e) {
                        console.log('[DEBUG] Payload is a plain string, not JSON');
                    }
                }

                const content = messagePayload?.content ?? messagePayload?.message;
                console.log('[DEBUG] Extracted content:', content);

                if (typeof content !== 'string' || !content.trim()) {
                    console.log('[DEBUG] Content validation failed');
                    return socket.emit('ai-error', {
                        message: 'Message content is required. Send content or message.'
                    })
                }

                if (!messagePayload.chat) {
                    console.log('[DEBUG] Chat ID missing');
                    return socket.emit('ai-error', {
                        message: 'Chat ID is required'
                    })
                }

                const mongoose = require('mongoose');
                if (!mongoose.Types.ObjectId.isValid(messagePayload.chat)) {
                    console.log('[DEBUG] Invalid Chat ID format:', messagePayload.chat);
                    return socket.emit('ai-error', {
                        message: 'Invalid Chat ID format. Must be a 24-character hex string.'
                    })
                }

                console.log('[DEBUG] Looking up chat:', messagePayload.chat, 'for user:', socket.user._id);
                const chat = await chatModel.findOne({
                    _id: messagePayload.chat,
                    user: socket.user._id
                });

                if (!chat) {
                    console.log('[DEBUG] Chat not found in DB');
                    return socket.emit('ai-error', {
                        message: 'Chat not found'
                    })
                }
                console.log('[DEBUG] Chat found:', chat._id);

                await messageModel.create({
                    chat: chat._id,
                    user: socket.user._id,
                    content,
                    role: "user"
                })
                console.log('[DEBUG] User message saved to DB');

                const chatHistory = await messageModel.find({
                    chat: chat._id
                }).sort({ createdAt: -1 }).limit(10).lean();

                chatHistory.reverse();

                const contents = chatHistory.map(item => ({
                    role: item.role,
                    parts: [{ text: item.content }]
                }));
                console.log('[DEBUG] Sending', contents.length, 'messages to Gemini');

                const response = await generateResponse(contents)
                console.log('[DEBUG] Gemini responded:', response.substring(0, 100), '...');

                await messageModel.create({
                    chat: chat._id,
                    user: socket.user._id,
                    content: response,
                    role: "model"
                })
                console.log('[DEBUG] AI message saved to DB');

                await chatModel.updateOne(
                    { _id: chat._id },
                    { $set: { lastActivity: new Date() } }
                );

                const responsePayload = {
                    content: response,
                    message: response,
                    chat: chat._id
                };

                console.log('[DEBUG] Emitting ai-response:', response.length, 'characters');
                socket.emit('ai-response', responsePayload);

                if (typeof acknowledgement === 'function') {
                    acknowledgement(responsePayload);
                }
            } catch (error) {
                console.error('[DEBUG] ERROR in ai-message handler:', error.message);
                console.error('[DEBUG] Full error:', error);
                const errorPayload = {
                    message: error.message || 'Unable to generate an AI response'
                };
                socket.emit('ai-error', errorPayload);

                if (typeof acknowledgement === 'function') {
                    acknowledgement({ error: errorPayload.message });
                }
            }
        })
        
    });
}

module.exports = initSocketServer;