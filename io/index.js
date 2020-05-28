module.exports = {
    getTime: (socket) => {
        socket.emit("time", new Date().toTimeString());
    },
    createGame: (socket) => {
        socket.emit("newGame", Math.random());
    },
};
