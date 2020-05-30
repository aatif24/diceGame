const express = require("express");
const http = require("http");

const port = process.env.PORT || 4000;

const app = express();
const bodyParser = require("body-parser");
const server = http.createServer(app);

const socketIo = require("socket.io");
const io = socketIo(server);

const con = require("./config/db");
const constants = require("./config/constants");

app.use(bodyParser.json({ type: "*/*" }));

app.set("io", io);
app.set("con", con);
app.set("constants", constants);

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

require("./routes/index")(app);

io.on("connection", (socket) => {
    console.log("New client connected", socket.id);

    socket.on("disconnect", () => {
        console.log("Client disconnected", socket.id);
    });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
