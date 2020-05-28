module.exports = (app) => {
    app.use("/game", require("./game"));
    app.use("/client", require("./client"));
};
