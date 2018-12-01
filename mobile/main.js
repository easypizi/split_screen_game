new Vue({
    el: '#app',
    data: {
        socket: null,
        socketId: "",
        groupId: "",
        notConnected: true,
        gameOver: false,
    },
    created() {
        this.socket = io.connect({
            transports: ["websocket"],
        });

        this.socket.on("connect", () => {
            console.log("connected to ws")
        })

        this.socket.on("id", (id) => {
            this.socketId = id;
        })

        this.socket.on("disconnect", (conn) => {
            console.log("disconnected")
        })

        this.socket.on("join_mobile", (data) => {
            if (data === "ok") {
                this.notConnected = false;
                return
            }

            console.log(data)
        });

        this.socket.on("start_game", (data) => {
            this.gameOver = false;
        })

        this.socket.on("game_over", (data) => {
            this.gameOver = true;
        })
    },
    methods: {
        connect() {
            this.socket.emit("join_mobile", this.groupId)
        },
        changeGroupId() {
            if (this.groupId.length === 7)
                this.connect();
        },
        up() {
            navigator.vibrate(50)
            this.socket.emit("up")
        },
        right() {
            navigator.vibrate(50)
            this.socket.emit("right")
        },
        left() {
            navigator.vibrate(50)
            this.socket.emit("left")
        },
        down() {
            navigator.vibrate(50)
            this.socket.emit("down")
        },
        pause() {
            navigator.vibrate(500)
            this.socket.emit("pause")
        },
        start() {
            navigator.vibrate(100)
            this.socket.emit("start_game")
        }
    }
})

const tmp = (socket) => {
    socket.emit()
}