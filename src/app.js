const express = require('express');
const cookieParser = require('cookie-parser');
const authroutes = require('./routes/auth.routes')
const chatroutes = require('./routes/chat.routes')
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authroutes)
app.use('/api/chat', chatroutes)

module.exports = app;