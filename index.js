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

var numUsers = 0;

io.listen(server);

io.on('connection', (socket) => {
    socket.emit("id", socket.id);

    socket.on("create_room", () => {
        if (Object.keys(socket.rooms).length > 2) {
            socket.emit("create_room", "room limit esceded");
            return
        }

        roomName = uid();
        socket.join(roomName);
        socket.emit("create_room", roomName);
    });

    socket.on("create_mobile", () => {
        if (Object.keys(socket.rooms).length > 2) {
            socket.emit("create_room", "room limit esceded");
            return
        }

        roomName = uid() + "_mobile";

        socket.join(roomName);
        socket.emit("create_room", roomName);
    });

    socket.on("join_room", (roomName) => {
        if (Object.keys(socket.rooms).length > 2) {
            socket.emit("join_room", "room limit esceded");
            return
        }

        socket.join(roomName);
        socket.emit("join_room", "ok");
    });

    socket.on("join_mobile", (roomName) => {
        if (Object.keys(socket.rooms).length > 2) {
            socket.emit("join_room", "room limit esceded");
            return
        }

        if (!roomName.endsWith("_mobile")) {
            socket.emit("join_mobile", "wrong key");
            return
        }

        socket.join(roomName);
        socket.emit("join_mobile", "ok");
    });

    socket.on("up", () => {
        const id = getGameRoomId(socket);
        if (!id) {
            socket.emit("up", "no connected desktop found");
        }

        socket.to(id).emit("up", socket.id);
    });

    socket.on("down", () => {
        const id = getGameRoomId(socket);
        if (!id) {
            socket.emit("down", "no connected desktop found");
        }

        socket.to(id).emit("down", socket.id);
    });

    socket.on("right", () => {
        const id = getGameRoomId(socket);
        if (!id) {
            socket.emit("right", "no connected desktop found");
        }

        socket.to(id).emit("right", socket.id);
    });

    socket.on("left", () => {
        const id = getGameRoomId(socket);
        if (!id) {
            socket.emit("left", "no connected desktop found");
        }

        socket.to(id).emit("left", socket.id);
    });

    socket.on("start_game", () => {
        const id = getGameRoomId(socket);
        if (!id) {
            socket.emit("start_over", "no connected game found");
        }

        socket.to(id).emit("start_game");
    });

    socket.on("game_over", (winner) => {
        const id = getGameRoomId(socket);
        if (!id) {
            socket.emit("game_over", "no connected game found");
        }

        socket.to(id).emit("game_over", winner);
    });
});

const getMobileRoomId = (socket) => {
    for (const room of socket) {
        if (room.endsWith("_mobile"))
            return room;
    }

    return "";
}

const getGameRoomId = (socket) => {
    for (const room of socket) {
        if (!room.endsWith("_mobile"))
            return room;
    }

    return "";
}