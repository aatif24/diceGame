const express = require("express");
const router = express.Router();
const { getAllGames, createNewGame } = require("../model/game");

const { newGame } = require("../io/game");

router.get("/", async (req, res) => {
    let con = req.app.get("con");
    try {
        games = await getAllGames(con);
    } catch (error) {
        res.status(500).json({ status: 0, msg: "error while fetching data", data: {}, err: error });
        return;
    }
    res.status(200).json({ status: 1, msg: "List", data: games });
    return;
});

router.post("/createGame", async (req, res) => {
    let con = req.app.get("con");
    let io = req.app.get("io");
    let { clientId } = req.body;
    try {
        await createNewGame(con, clientId);
        let allGames = await getAllGames(con);
        newGame(io, allGames);
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 0, msg: "error while creating game", data: {}, err: error });
        return;
    }

    res.json({ status: 1, msg: "Create", data: {} }).status(200);
    return;
});

router.get("/joinGame", (req, res) => {
    res.json({ status: 1, msg: "Join", data: {} }).status(200);
});

module.exports = router;
