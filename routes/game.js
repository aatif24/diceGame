const express = require("express");
const router = express.Router();
const {
    getAllGames,
    getGameParticipants,
    createNewGame,
    joinParticipant,
    checkParticipant,
} = require("../model/game");

const { newGame, newParticipant } = require("../io/game");

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
        let data = {
            status: "open",
            created_by: clientId,
        };

        await createNewGame(con, data);
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

router.post("/joinGame", async (req, res) => {
    let con = req.app.get("con");
    let { PLAYER_LIMIT } = req.app.get("constants");

    let io = req.app.get("io");
    let { clientId, id } = req.body;
    //check if room is full
    let participants;
    console.log(PLAYER_LIMIT);
    try {
        participants = await getGameParticipants(con, id);
        if (participants.length > PLAYER_LIMIT - 1) {
            res.json({ status: 0, msg: "Room is full", data: participants }).status(200);
            return;
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 0,
            msg: "error while fetching game participants",
            data: {},
            err: error,
        });
        return;
    }
    try {
        let checkAlreadyParticipated = await checkParticipant(con, clientId, id);
        if (checkAlreadyParticipated.length) {
            let allParticipants = await getGameParticipants(con, id);
            newParticipant(io, allParticipants);
            res.json({ status: 1, msg: "already Joined", data: allParticipants }).status(200);
            return;
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 0,
            msg: "error while checking participation",
            data: {},
            err: error,
        });
        return;
    }

    try {
        let orderId = participants.length ? participants[participants.length - 1]["order_id"] : 1;
        let data = {
            client_id: clientId,
            game_id: id,
            score: 0,
            order_id: orderId,
        };
        await joinParticipant(con, data);
        let allParticipants = await getGameParticipants(con, id);
        newParticipant(io, allParticipants);
        res.json({ status: 1, msg: "Joined", data: allParticipants }).status(200);
        return;
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: 0,
            msg: "error while fetching joining participants",
            data: {},
            err: error,
        });
        return;
    }
});

module.exports = router;
