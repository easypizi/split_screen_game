new Vue({
    el: '#app',
    data: {
        groupId: "",
        notConnected: false,
    },
    methods: {
        connect() {
            console.log("connect");
            this.notConnected = false;
        },
        changeGroupId() {
            if (this.groupId.length === 7)
                this.connect()
        }
    }
})