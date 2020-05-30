const express = require("express");
const router = express.Router();

const {
    getAllGames,
    getGameParticipants,
    createNewGame,
    joinParticipant,
    checkParticipant,
    updateGameStatus,
    getScoreByClient,
    getGameById,
    updateClientScore,
    getNextPlayer,
    getClientByTurn,
} = require("../model/game");

const { newGame, newParticipant, startGame, setNextPlayer, refreshScore } = require("../io/game");

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

        let { insertId } = await createNewGame(con, data);
        if (insertId) {
            let data = {
                client_id: clientId,
                game_id: insertId,
                score: 0,
                order_by: 1,
                turn: 1,
            };
            await joinParticipant(con, data);
        }
        let allGames = await getAllGames(con);
        newGame(io, allGames);
    } catch (error) {
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

    try {
        let checkAlreadyParticipated = await checkParticipant(con, clientId, id);
        if (checkAlreadyParticipated.length) {
            let allParticipants = await getGameParticipants(con, id);
            let participantAction = {
                id: id,
                participants: allParticipants,
            };
            newParticipant(io, participantAction);
            res.json({ status: 1, msg: "already Joined", data: allParticipants }).status(200);
            return;
        }
    } catch (error) {
        res.status(500).json({
            status: 0,
            msg: "error while checking participation",
            data: {},
            err: error,
        });
        return;
    }
    try {
        participants = await getGameParticipants(con, id);
        if (participants.length > PLAYER_LIMIT - 1) {
            res.json({ status: 0, msg: "Room is full", data: participants }).status(200);
            return;
        }
    } catch (error) {
        res.status(500).json({
            status: 0,
            msg: "error while fetching game participants",
            data: {},
            err: error,
        });
        return;
    }

    try {
        let orderId = participants.length
            ? participants[participants.length - 1]["order_by"] + 1
            : 1;
        let data = {
            client_id: clientId,
            game_id: id,
            score: 0,
            order_by: orderId,
            turn: orderId == "1" ? 1 : 0,
        };
        await joinParticipant(con, data);
        let allParticipants = await getGameParticipants(con, id);
        let participantAction = {
            id: id,
            participants: allParticipants,
        };
        newParticipant(io, participantAction);
        res.json({ status: 1, msg: "Joined", data: allParticipants }).status(200);
        return;
    } catch (error) {
        res.status(500).json({
            status: 0,
            msg: "error while fetching joining participants",
            data: {},
            err: error,
        });
        return;
    }
});
router.get("/participants", async (req, res) => {
    let con = req.app.get("con");

    let io = req.app.get("io");
    let { id } = req.query;

    try {
        let allParticipants = await getGameParticipants(con, id);
        let participantAction = {
            id: id,
            participants: allParticipants,
        };
        newParticipant(io, participantAction);
        res.json({ status: 1, msg: "already Joined", data: allParticipants }).status(200);
        return;
    } catch (error) {
        res.status(500).json({
            status: 0,
            msg: "error while checking participation",
            data: {},
            err: error,
        });
        return;
    }
});

router.post("/startGame", async (req, res) => {
    let con = req.app.get("con");
    let io = req.app.get("io");
    let { clientId, id } = req.body;
    try {
        let data = {
            status: "running",
            updated_on: new Date(),
        };

        let { affectedRows } = await updateGameStatus(con, data, id);

        if (affectedRows) {
            startGame(io, id);
            res.json({ status: 1, msg: "started", data: {} }).status(200);
        } else {
            res.json({ status: 0, msg: "invalid data", data: {} }).status(200);
        }
        return;
    } catch (error) {
        console.log(error);
        res.status(500).json({ status: 0, msg: "error while staring game", data: {}, err: error });
        return;
    }
});

router.get("/rollADice", async (req, res) => {
    let io = req.app.get("io");
    let con = req.app.get("con");
    let { clientId, id } = req.query;
    let { response, status } = await rollADice(con, clientId, id, io);
    res.json(response).status(status);
});

let rollADice = async (con, clientId, id, io) => {
    let nextPlayerId;

    let randomNum = Math.floor(Math.random() * 6) + 1;
    let participantsCount = 1;
    if (id == 0 || clientId == 0) {
        return {
            response: {
                status: 0,
                msg: "Invalid data",
                data: {},
            },
            status: 200,
        };
    }
    //get game status
    con.beginTransaction();
    try {
        let gameDetail = await getGameById(con, id);
        if (!gameDetail.length) {
            return {
                response: {
                    status: 0,
                    msg: "Invalid data",
                    data: {},
                },
                status: 200,
            };
        }
        participantsCount = gameDetail[0]["participantCount"];
        if (gameDetail.length && gameDetail[0]["status"] != "running") {
            return {
                response: {
                    status: 0,
                    msg: "either game isn't started or its already finished",
                    data: {},
                },
                status: 200,
            };
        }
    } catch (error) {
        console.log(error);
        return {
            response: {
                status: 0,
                msg: "error while fetching score",
                data: {},
                err: error,
            },
            status: 500,
        };
    }
    let score;
    try {
        score = await getScoreByClient(con, clientId, id);
        if (!score.length) {
            return {
                response: {
                    status: 0,
                    msg: "something is wrong",
                    data: {},
                },
                status: 500,
            };
        }
    } catch (error) {
        return {
            response: {
                status: 0,
                msg: "error while fetching score",
                data: {},
                err: error,
            },
            status: 500,
        };
    }

    // if the score is >=61  update game and declare winner

    let latestScore = score[0]["score"] + randomNum;

    //update score and return number and total score
    try {
        let { affectedRows } = await updateClientScore(con, clientId, id, randomNum);

        if (!affectedRows) {
            return {
                response: {
                    status: 0,
                    msg: "invalid data to be updated",
                    data: {},
                },
                status: 200,
            };
        }
    } catch (error) {
        con.rollback();

        return {
            response: {
                status: 0,
                msg: "error while rolling a dice",
                data: {},
                err: error,
            },
            status: 500,
        };
    }

    if (latestScore >= 61) {
        // update game as closed and declare a winner
        let data = {
            status: "closed",
            winner: clientId,
            updated_on: new Date(),
        };
        try {
            await updateGameStatus(con, data, clientId, id);
            con.commit();

            refreshScore(io, id);
            return {
                response: {
                    status: 1,
                    msg: "You win this game",
                    data: {
                        score: latestScore,
                        diceNumber: randomNum,
                    },
                },
                status: 200,
            };
        } catch (error) {
            con.rollback();
            return {
                response: {
                    status: 0,
                    msg: "error while declaring winner",
                    data: {},
                    err: error,
                },
                status: 500,
            };
        }
    } else {
        con.commit();
        //get next player
        try {
            let nextPlayer = await getNextPlayer(con, id, score[0]["order_by"], participantsCount);
            if (!nextPlayer.length) {
                con.rollback();
                return {
                    response: {
                        status: 0,
                        msg: "something went wrong while fetching next player",
                        data: {},
                    },
                    status: 200,
                };
            }
            let nxData = {
                gameId: id,
                clientId: nextPlayer[0]["client_id"],
            };
            nextPlayerId = nextPlayer[0]["client_id"];
            setNextPlayer(io, nxData);
            refreshScore(io, id);
        } catch (error) {
            console.log(error);
            con.rollback();

            return {
                response: {
                    status: 0,
                    msg: "error while fetching next player",
                    data: {},
                    err: error,
                },
                status: 500,
            };
        }
        return {
            response: {
                status: 1,
                msg: "your score is",
                data: {
                    score: latestScore,
                    diceNumber: randomNum,
                    nextPlayerId: nextPlayerId,
                },
            },
            status: 200,
        };
    }
};

module.exports = router;
