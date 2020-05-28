module.exports = {
    newGame: (socket, data) => {
        socket.emit("newGame", data);
    },
    newParticipant: (socket, data) => {
        socket.emit("newParticipant", data);
    },
};
