const express = require("express");
const router = express.Router();

const { getClientById, registerClient } = require("../model/client");

router.get("/getClientById", async (req, res) => {
    let con = req.app.get("con");
    let { clientId } = req.query;
    try {
        var client = await getClientById(con, clientId);
        if (!client.length) {
            res.status(500).json({ status: 0, msg: "invalid id", data: {} });
            return;
        }
    } catch (error) {
        res.status(500).json({ status: 0, msg: "error while fetching data", data: {}, err: error });
        return;
    }
    res.status(200).json({ status: 1, msg: "List", data: client[0] });
    return;
});

router.post("/register", async (req, res) => {
    let con = req.app.get("con");

    let { name } = req.body;
    try {
        var { insertId } = await registerClient(con, { name: name });
        if (!insertId) {
            res.status(500).json({ status: 0, msg: "invalid id", data: {} });
        }
    } catch (error) {
        res.status(500).json({ status: 0, msg: "error while fetching data", data: {}, err: error });
        return;
    }
    res.status(200).json({ status: 1, msg: "List", data: insertId });
    return;
});

module.exports = router;
