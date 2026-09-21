const express = require('express');
const cookieParser = require('cookie-parser');
const authroutes = require('./routes/auth.routes')
const chatroutes = require('./routes/chat.routes')
const app = express();

// Enable CORS with credentials for local frontend development and production
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (origin) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.sendStatus(204);
    }
    next();
});

// Parse JSON request bodies and browser cookies.
app.use(express.json());
app.use(cookieParser());

// Register authentication and chat API routes.
app.use('/api/auth', authroutes)
app.use('/api/chat', chatroutes)

module.exports = app;