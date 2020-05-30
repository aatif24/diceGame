import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import socketIOClient from "socket.io-client";
import { API_ENDPOINT, API_ENDPOINT_CLIENT, API_ENDPOINT_GAME, TIMEOUT } from "../config/constant";
const socket = socketIOClient(API_ENDPOINT);
var timer;
const App = () => {
    const [participants, setParticipants] = useState([]);
    const [clientId, setClientId] = useState(localStorage.getItem("clientId"));
    const [client, setClient] = useState(false);
    const [turn, setTurn] = useState("disabled");
    const [msg, setMsg] = useState("");

    const [score, setScore] = useState(0);

    let { gameId } = useParams();

    let getClientData = async () => {
        fetch(API_ENDPOINT_CLIENT + "/getClientById?clientId=" + clientId, {
            method: "GET",
        })
            .then((response) => response.json())
            .then((data) => {
                if (data && data.status) {
                    setClient(data.data);
                }
            })
            .catch((err) => {
                console.log("something is wrong", err);
            });
    };

    let getGameParticipants = async () => {
        fetch(API_ENDPOINT_GAME + `/participants?id=${gameId}`, {
            method: "GET",
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                if (data && data.status) {
                    if (data && data.data.length) {
                        setParticipants(data.data);
                        for (let i = 0; i < data.data.length; i++) {
                            let c = data.data[i];
                            if (c.client_id == clientId) {
                                setScore(c.score);
                            }
                            if (c.score >= 61 && c.client_id != clientId) {
                                setMsg(c.name + " won the game");
                                setTurn("disabled");
                            } else if (c.score >= 61 && c.client_id == clientId) {
                                setMsg("You won the game");
                            } else if (c.score < 61 && c.client_id == clientId) {
                                if (c.client_id == clientId && c.turn == "1") {
                                    setTurn("");
                                }
                                // break;
                            }
                        }
                    }
                } else {
                    setMsg(data.msg);
                }
            })
            .catch((err) => {
                console.log("something is wrong", err);
            });
    };

    let rollADice = () => {
        clearTimeout(timer);

        fetch(API_ENDPOINT_GAME + `/rollADice?clientId=${clientId}&id=${gameId}`, {
            method: "GET",
        })
            .then((response) => response.json())
            .then((data) => {
                if (data && data.status) {
                    setScore(data.data.score);
                    setTurn("disabled");
                    if (data.data.score >= 61) {
                        setMsg("You won this Game");
                    } else {
                        setMsg("");
                    }
                } else {
                    setMsg(data.msg);
                    setTimeout(() => {
                        setMsg("");
                    }, 2000);
                }
            })
            .catch((err) => {
                console.log("something is wrong", err);
            });
    };

    useEffect(() => {
        getClientData();
        getGameParticipants();
        socket.on("nextPlayer", (data) => {
            if (data.gameId == gameId && data.clientId == clientId) {
                setTurn("");
            }
        });
        socket.on("refreshScore", (data) => {
            if (data == gameId) {
                getGameParticipants();
            }
        });
    }, []);

    useEffect(() => {
        if (turn == "") {
            timer = setTimeout(() => {
                rollADice();
            }, TIMEOUT);
        }
    }, [turn]);

    return (
        <div className="container p-5">
            <div className=" d-flex border-bottom py-5 justify-content-between align-items-center">
                <div className="">
                    <p className="h4">
                        Welcome <span className="h3 text-muted">{client.name}</span>
                    </p>
                </div>
                <div className="">Your Score is {score}</div>
                <div className="">
                    <button
                        disabled={turn}
                        className="btn btn-warning"
                        onClick={(e) => {
                            setTurn("disabled");
                            rollADice();
                        }}
                    >
                        Roll A Dice
                    </button>
                </div>
            </div>
            <div className="mt-3 d-flex flex-column ">
                <h1>{msg}</h1>
                {participants && participants.length
                    ? participants.map((v, i) => {
                          return (
                              <p className="" key={i}>
                                  {v.client_id != clientId ? (
                                      <>
                                          <span className="text-muted h5">{v.name}</span> :{" "}
                                          <span className="h4">{v.score}</span>
                                          <span className="h4 spinner mx-4">
                                              {v.turn ? (
                                                  <i className="fa fa-spinner fa-pulse"></i>
                                              ) : null}
                                          </span>
                                      </>
                                  ) : null}
                              </p>
                          );
                      })
                    : null}
            </div>
        </div>
    );
};

export default App;
