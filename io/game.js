module.exports = {
    newGame: (socket, data) => {
        socket.emit("newGame", data);
    },
    newParticipant: (socket, data) => {
        socket.emit("newParticipant", data);
    },
    startGame: (socket, data) => {
        socket.emit("startGame", data);
    },
    setNextPlayer: (socket, data) => {
        socket.emit("nextPlayer", data);
    },
    refreshScore: (socket, data) => {
        socket.emit("refreshScore", data);
    },
};
