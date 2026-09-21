const mongoose = require("mongoose");
const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.models");
const chatModel = require("../models/chat.models");
const {generateResponse, generateVector} = require('../services/ai.service')
const messageModel = require('../models/message.model')
const {createMemory, queryMemory} = require('../services/vector.service')

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

        // Handle incoming AI messages following the optimized 10-step flow.
        socket.on('ai-message', async (messagePayload, acknowledgement) => {
            console.log('[DEBUG] ai-message event received');
            console.log('[DEBUG] Raw payload:', JSON.stringify(messagePayload));

            try {
                // Handle case where payload arrives as a JSON string
                if (typeof messagePayload === 'string') {
                    try {
                        messagePayload = JSON.parse(messagePayload);
                    } catch (e) {
                        console.log('[DEBUG] Payload is a plain string, not JSON');
                    }
                }

                const content = messagePayload?.content ?? messagePayload?.message;
                if (typeof content !== 'string' || !content.trim()) {
                    console.log('[DEBUG] Content validation failed');
                    return socket.emit('ai-error', {
                        message: 'Message content is required. Send content or message.'
                    });
                }

                if (!messagePayload.chat) {
                    console.log('[DEBUG] Chat ID missing');
                    return socket.emit('ai-error', {
                        message: 'Chat ID is required'
                    });
                }

                if (!mongoose.Types.ObjectId.isValid(messagePayload.chat)) {
                    console.log('[DEBUG] Invalid Chat ID format:', messagePayload.chat);
                    return socket.emit('ai-error', {
                        message: 'Invalid Chat ID format. Must be a 24-character hex string.'
                    });
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
                    });
                }
                console.log('[DEBUG] Chat found:', chat._id);

                // =========================================================================
                // 1. User message save in DB  &  2. Generate vector for user message
                // Executed together concurrently via Promise.all for optimization
                // =========================================================================
                console.log('[FLOW] Executing Steps 1 & 2 concurrently (save user message & generate vector)');
                const [userMessage, userVector] = await Promise.all([
                    messageModel.create({
                        chat: chat._id,
                        user: socket.user._id,
                        content,
                        role: "user"
                    }),
                    generateVector(content)
                ]);
                console.log('[FLOW] Step 1 complete: User message saved in DB (ID:', userMessage._id, ')');
                console.log('[FLOW] Step 2 complete: Vector generated for user message');

                // =========================================================================
                // 3. Save user message in Pinecone
                // =========================================================================
                console.log('[FLOW] Executing Step 3: Save user message in Pinecone');
                await createMemory({
                    vectors: userVector,
                    messageId: userMessage._id.toString(),
                    metadata: {
                        chat: chat._id.toString(),
                        user: socket.user._id.toString(),
                        role: "user",
                        text: content
                    }
                });
                console.log('[FLOW] Step 3 complete: User message saved in Pinecone');

                // =========================================================================
                // 4. Query Pinecone for related memories
                // =========================================================================
                console.log('[FLOW] Executing Step 4: Query Pinecone for related memories');
                let relatedMemories = [];
                try {
                    const memoryData = await queryMemory({
                        queryVector: userVector,
                        limit: 5,
                        metadata: {
                            user: socket.user._id.toString()
                        }
                    });

                    if (memoryData?.matches && memoryData.matches.length > 0) {
                        relatedMemories = memoryData.matches
                            .filter(match => match.id !== userMessage._id.toString() && match.metadata?.text)
                            .map(match => match.metadata.text);
                    }
                    console.log(`[FLOW] Step 4 complete: Found ${relatedMemories.length} related memories`);
                } catch (memError) {
                    console.warn('[FLOW] Step 4 warning: Failed to query Pinecone memories (continuing without memories):', memError.message);
                }

                // =========================================================================
                // 5. Get chat history from DB
                // =========================================================================
                console.log('[FLOW] Executing Step 5: Get chat history from DB');
                const chatHistory = await messageModel.find({
                    chat: chat._id
                }).sort({ createdAt: -1 }).limit(10).lean();

                chatHistory.reverse();

                const contents = chatHistory.map(item => ({
                    role: item.role,
                    parts: [{ text: item.content }]
                }));
                console.log(`[FLOW] Step 5 complete: Retrieved ${contents.length} recent messages for context`);

                // =========================================================================
                // 6. Generate response from AI
                // =========================================================================
                console.log('[FLOW] Executing Step 6: Generate response from AI');
                let systemInstruction = undefined;
                if (relatedMemories.length > 0) {
                    systemInstruction = `You are a helpful AI assistant. Here are relevant memories from past conversations with this user that may provide helpful context:\n${relatedMemories.map((mem, idx) => `[Memory ${idx + 1}]: ${mem}`).join('\n')}\nUse these memories when relevant.`;
                }

                const response = await generateResponse(contents, systemInstruction);
                console.log('[FLOW] Step 6 complete: AI response generated successfully');

                // =========================================================================
                // 7. Send AI response to user
                // =========================================================================
                console.log('[FLOW] Executing Step 7: Send AI response to user');
                const responsePayload = {
                    content: response,
                    message: response,
                    chat: chat._id
                };

                socket.emit('ai-response', responsePayload);

                if (typeof acknowledgement === 'function') {
                    acknowledgement(responsePayload);
                }
                console.log('[FLOW] Step 7 complete: Response emitted to client');

                // =========================================================================
                // 8. Save AI response in DB  &  9. Generate vector for AI response
                // Merged together concurrently via Promise.all for optimization
                // =========================================================================
                console.log('[FLOW] Executing Steps 8 & 9 merged together (save AI response in DB & generate vector)');
                const [aiMessage, aiVector] = await Promise.all([
                    messageModel.create({
                        chat: chat._id,
                        user: socket.user._id,
                        content: response,
                        role: "model"
                    }),
                    generateVector(response)
                ]);
                console.log('[FLOW] Step 8 complete: AI response saved in DB (ID:', aiMessage._id, ')');
                console.log('[FLOW] Step 9 complete: Vector generated for AI response');

                await chatModel.updateOne(
                    { _id: chat._id },
                    { $set: { lastActivity: new Date() } }
                );

                // =========================================================================
                // 10. Save AI message in Pinecone
                // =========================================================================
                console.log('[FLOW] Executing Step 10: Save AI message in Pinecone');
                await createMemory({
                    vectors: aiVector,
                    messageId: aiMessage._id.toString(),
                    metadata: {
                        chat: chat._id.toString(),
                        user: socket.user._id.toString(),
                        role: "model",
                        text: response
                    }
                });
                console.log('[FLOW] Step 10 complete: AI message saved in Pinecone');

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

module.exports = initSocketServer