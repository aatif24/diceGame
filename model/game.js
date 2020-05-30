const { response } = require("express");

module.exports = {
    getAllGames: (con) => {
        return new Promise((resolve, reject) => {
            con.query(`SELECT * FROM game`, (err, data) => (err ? reject(err) : resolve(data)));
        });
    },
    getGameParticipants: (con, id) => {
        return new Promise((resolve, reject) => {
            con.query(
                `   SELECT 
                        gp.*,
                        c.id as clientId,
                        c.name,
                        g.created_by,
                        g.status
                    FROM 
                        gameParticipants gp 
                    JOIN 
                        client c ON c.id = gp.client_id 
                    JOIN 
                        game g ON g.id = gp.game_id 
                    WHERE 
                        game_id = ${id}`,
                (err, data) => (err ? reject(err) : resolve(data))
            );
        });
    },
    createNewGame: (con, data) => {
        return new Promise((resolve, reject) => {
            con.query(`INSERT INTO  game set ?`, [data], (err, data) =>
                err ? reject(err) : resolve(data)
            );
        });
    },
    checkParticipant: (con, clientId, gameId) => {
        return new Promise((resolve, reject) => {
            con.query(
                `SELECT 
                    id 
                FROM  
                    gameParticipants 
                WHERE 
                    client_id =${clientId} AND 
                    game_id =${gameId}`,

                (err, data) => (err ? reject(err) : resolve(data))
            );
        });
    },
    joinParticipant: (con, data) => {
        return new Promise((resolve, reject) => {
            con.query(`INSERT INTO  gameParticipants set ?`, [data], (err, data) =>
                err ? reject(err) : resolve(data)
            );
        });
    },
    updateGameStatus: (con, data, id) => {
        return new Promise((resolve, reject) => {
            con.query(
                `UPDATE
                    game 
                SET ?
                WHERE 
                    id = ${id}`,
                [data],
                (err, data) => (err ? reject(err) : resolve(data))
            );
        });
    },
    getScoreByClient: (con, clientId, id) => {
        return new Promise((resolve, reject) => {
            con.query(
                `SELECT 
                    * 
                FROM 
                    gameParticipants gp 
                JOIN 
                    game g ON g.id = gp.game_id 
                WHERE 
                    gp.client_id = ${clientId} AND game_id = ${id} `,
                (err, data) => (err ? reject(err) : resolve(data))
            );
        });
    },
    getGameById: (con, id) => {
        return new Promise((resolve, reject) => {
            con.query(
                `SELECT 
                    g.* ,
                    count(gp.id) as participantCount
                FROM 
                    game g
                JOIN 
                    gameParticipants gp 
                    ON gp.game_id = g.id
                WHERE
                    g.id = ${id} 
                GROUP BY g.id`,
                (err, data) => (err ? reject(err) : resolve(data))
            );
        });
    },
    updateClientScore: (con, clientId, id, randomNum) => {
        return new Promise((resolve, reject) => {
            con.query(
                `UPDATE
                    gameParticipants gp
                SET
                    score = score + ${randomNum},
                    updated_on = NOW(),
                    turn = 0
                WHERE
                    game_id = ${id} AND client_id = ${clientId} AND turn = 1`,
                (err, data) => (err ? reject(err) : resolve(data))
            );
        });
    },
    getClientByTurn: (con, id) => {
        return new Promise((resolve, reject) => {
            con.query(
                `SELECT 
                    client_id
                FROM
                    gameParticipants 
                WHERE
                    game_id = ${id} AND turn = 1`,
                (err, data) => (err ? reject(err) : resolve(data))
            );
        });
    },
    getNextPlayer: (con, id, order, count) => {
        return new Promise((resolve, reject) => {
            nextOrder = order == count ? 1 : order + 1;
            con.query(
                `SELECT 
                    game_id,client_id
                FROM
                    gameParticipants gp
                WHERE 
                    game_id = ${id} AND order_by = ${nextOrder}`,
                (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        //update next player turn
                        if (data.length) {
                            con.query(
                                `UPDATE
                                    gameParticipants
                                SET
                                    turn = 1
                                WHERE
                                    game_id = ${id} AND
                                    client_id = ${data[0]["client_id"]}
                                `,
                                (err, status) => {
                                    err ? reject(err) : resolve(data);
                                }
                            );
                        } else {
                            reject(new Error("could not find next client"));
                        }
                    }
                }
            );
        });
    },
};
