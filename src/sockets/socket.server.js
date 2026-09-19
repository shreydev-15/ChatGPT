const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.models");
const chatModel = require("../models/chat.models");
const generateResponse = require('../services/ai.service')
const messageModel = require('../models/message.model')

function initSocketServer(httpServer) {
    const io = new Server(httpServer, {});

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

    io.on("connection", (socket) => {
        console.log("Socket connected:", socket.id);

        socket.on('ai-message', async (messagePayload, acknowledgement) => {
            try {
                const content = messagePayload?.content ?? messagePayload?.message;

                if (typeof content !== 'string' || !content.trim()) {
                    return socket.emit('ai-error', {
                        message: 'Message content is required. Send content or message.'
                    })
                }

                if (!messagePayload.chat) {
                    return socket.emit('ai-error', {
                        message: 'Chat ID is required'
                    })
                }

                const chat = await chatModel.findOne({
                    _id: messagePayload.chat,
                    user: socket.user._id
                });

                if (!chat) {
                    return socket.emit('ai-error', {
                        message: 'Chat not found'
                    })
                }

                await messageModel.create({
                    chat: chat._id,
                    user: socket.user._id,
                    content,
                    role: "user"
                })

                const chatHistory = await messageModel.find({
                    chat: chat._id
                }).sort({ createdAt: -1 }).limit(10).lean();

                chatHistory.reverse();

                const contents = chatHistory.map(item => ({
                    role: item.role,
                    parts: [{ text: item.content }]
                }));

                const response = await generateResponse(contents)

                await messageModel.create({
                    chat: chat._id,
                    user: socket.user._id,
                    content: response,
                    role: "model"
                })

                await chatModel.updateOne(
                    { _id: chat._id },
                    { $set: { lastActivity: new Date() } }
                );

                const responsePayload = {
                    content: response,
                    message: response,
                    chat: chat._id
                };

                console.log('Sending AI response:', response.length, 'characters');
                socket.emit('ai-response', responsePayload);

                if (typeof acknowledgement === 'function') {
                    acknowledgement(responsePayload);
                }
            } catch (error) {
                console.error('AI response error:', error)
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