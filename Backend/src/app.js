const express = require('express');
const cookieParser = require('cookie-parser');
const authroutes = require('./routes/auth.routes')
const chatroutes = require('./routes/chat.routes')
const app = express();

// Parse JSON request bodies and browser cookies.
app.use(express.json());
app.use(cookieParser());

// Register authentication and chat API routes.
app.use('/api/auth', authroutes)
app.use('/api/chat', chatroutes)

module.exports = app;