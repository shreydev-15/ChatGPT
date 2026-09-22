// Load environment variables before starting the application.
require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/db/db');
const initsocketserver = require('./src/sockets/socket.server')
const httpserver  = require('http').createServer(app)


// Connect to MongoDB and initialize the HTTP and Socket.IO servers.
connectDB();
initsocketserver(httpserver)

// Start the server and listen for client requests.
const port = process.env.PORT || 3214;

httpserver.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
})