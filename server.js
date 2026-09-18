require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/db/db');
const initsocketserver = require('./src/sockets/socket.server')
const httpserver  = require('http').createServer(app)


connectDB();
initsocketserver(httpserver)

httpserver.listen(3100, ()=>{
    console.log('Server is running on port 3100');
})