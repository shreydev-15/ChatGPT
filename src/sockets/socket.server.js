const { Server } = require("socket.io");
const { Socket } = require("socket.io-client");

function initsocketserver(httpserver) {
    const io = new Server(httpserver, {})

    io.on("connection", (Socket)=>{
        console.log("New socket Connection", Socket.id)
    })

}

module.exports = initsocketserver