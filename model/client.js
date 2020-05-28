const { response } = require("express");

module.exports = {
    getAllGames: (con) => {
        return new Promise((resolve, reject) => {
            con.query(`SELECT * FROM game`, (err, data) => (err ? reject(err) : resolve(data)));
        });
    },
    getClientById: (con, id) => {
        return new Promise((resolve, reject) => {
            con.query(`SELECT * FROM client where id = ${id}`, (err, data) =>
                err ? reject(err) : resolve(data)
            );
        });
    },
    registerClient: (con, data) => {
        return new Promise((resolve, reject) => {
            con.query(`INSERT INTO client set ?`, [data], (err, data) =>
                err ? reject(err) : resolve(data)
            );
        });
    },
};
