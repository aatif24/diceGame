const { response } = require("express");

module.exports = {
    getAllGames: (con) => {
        return new Promise((resolve, reject) => {
            con.query(`SELECT * FROM game`, (err, data) => (err ? reject(err) : resolve(data)));
        });
    },
    createNewGame: (con, clientId) => {
        return new Promise((resolve, reject) => {
            let data = {
                status: "open",
                created_by: clientId,
            };
            con.query(`INSERT INTO  game set ?`, [data], (err, data) =>
                err ? reject(err) : resolve(data)
            );
        });
    },
};
