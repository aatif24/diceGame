module.exports = {
    newGame: (socket, data) => {
        socket.emit("newGame", data);
    },
    joinedGame: (socket, data) => {
        socket.emit("joinedGame", data);
    },
};
