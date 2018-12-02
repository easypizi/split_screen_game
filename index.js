// Setup basic express server
const express = require('express');
const app = express();
const path = require('path');
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const port = process.env.PORT || 3000;
const mobileDetect = require("mobile-detect");

const uid = require("uid");

app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
    var md = new mobileDetect(req.headers['user-agent']);

    if (md.mobile() !== null) {
        res.sendFile(path.join(__dirname, 'mobile') + "/index.html")
        return
    }

    res.sendFile(path.join(__dirname, 'desktop') + "/index.html")
})

server.listen(port, () => {
    console.log('Server listening at port %d', port);
});

io.set('transports', ['websocket']);

const rooms = {};

io.on('connection', (socket) => {
    console.log("connected", socket.id)
    socket.emit("id", socket.id);

    socket.on("create_room", () => {
        gameName = uid();

        socket.join(gameName);
        rooms[gameName] = [];

        socket.emit("create_room", gameName);
    });

    socket.on("join_mobile", (roomName) => {
        if (!rooms[roomName]) {
            socket.emit("join_mobile", "no room with that key");
            return
        }

        if (rooms[roomName].length >= 2) {
            socket.emit("join_mobile", "room full");
            return
        }

        rooms[roomName].push = socket.id;

        socket.join(roomName);

        socket.to(roomName).emit("join_mobile", socket.id);
        socket.emit("join_mobile", "ok");
    });

    socket.on("up", (roomName) => {
        socket.to(roomName).emit("up", socket.id);
    });

    socket.on("down", (roomName) => {
        socket.to(roomName).emit("down", socket.id);
    });

    socket.on("right", (roomName) => {
        socket.to(roomName).emit("right", socket.id);
    });

    socket.on("left", (roomName) => {
        socket.to(roomName).emit("left", socket.id);
    });

    socket.on("pause", (roomName) => {
        socket.to(roomName).emit("pause", socket.id);
    });

    socket.on("start_game", (roomName) => {
        socket.to(roomName).emit("start_game", socket.id);
        socket.emit("start_game", socket.id);
    });

    socket.on("game_over", (data) => {
        socket.to(data.room).emit("game_over", data);
    });

    socket.on("disconnected", () => {
        console.log("disconnected")
    })
});