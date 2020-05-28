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
                        g.created_by
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
};
