new Vue({
    el: '#app',
    data: {
        socket: null,
        socketId: "",
        groupId: "",
        notConnected: true,
    },
    created() {
        this.socket = io.connect({
            transports: ["websocket"],
        });

        this.socket.on("connect", () => {
            console.log("connected to ws 1")

            this.socket.emit("create_room")
            this.socket.emit("create_mobile")
        })

        this.socket.on("id", (id) => {
            this.socketId = id;
        })

        this.socket.on("up", (id) => {
            console.log("up", id, this.socketId)
        })

        this.socket.on("down", (id) => {
            console.log("down", id, this.socketId)
        })

        this.socket.on("left", (id) => {
            console.log("left", id, this.socketId)
        })

        this.socket.on("right", (id) => {
            console.log("right", id, this.socketId)
        })

        this.socket.on("disconnect", (conn) => {
            console.log("disconnected")
        })

        this.socket.on("create_room", (data) => {
            console.log(data)
        })

        this.socket.on("create_mobile", (data) => {
            console.log(data)
        })
    },
    methods: {
        connect() {
            this.socket.emit("join_mobile", this.groupId)
        },
        changeGroupId() {
            if (this.groupId.length === 7)
                this.connect();
        }
    }
})