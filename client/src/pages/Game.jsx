import React, { useEffect, useState } from "react";

import socketIOClient from "socket.io-client";
import { API_ENDPOINT, API_ENDPOINT_CLIENT, API_ENDPOINT_GAME } from "../config/constant";

import { useParams, Redirect } from "react-router-dom";
const socket = socketIOClient(API_ENDPOINT);
const App = () => {
    const [participants, setParticipants] = useState([]);
    const [clientId, setClientId] = useState(localStorage.getItem("clientId"));
    const [client, setClient] = useState(false);
    const [roomOwner, setRoomOwner] = useState(false);
    const [msg, setMsg] = useState("");
    const [redirect, setRedirect] = useState("");

    let { gameId } = useParams();

    let getGameParticipants = async () => {
        fetch(API_ENDPOINT_GAME + "/joinGame", {
            method: "POST",
            body: JSON.stringify({
                clientId: clientId,
                id: gameId,
            }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data && data.status) {
                    if (data && data.data.length && data["data"][0]["status"] == "running") {
                        setRedirect("/game/play/" + gameId);
                    } else {
                        setParticipants(data.data);
                        if (data && data.data.length && data["data"][0]["created_by"] == clientId) {
                            setRoomOwner(clientId);
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

    useEffect(() => {
        getClientData();
        getGameParticipants();
        socket.on("newParticipant", (data) => {
            if (data && data.participants && data.id && data.id == gameId) {
                setParticipants(data.participants);
            }
        });
        socket.on("startGame", (data) => {
            if (data == gameId) {
                setRedirect("/game/play/" + gameId);
            }
        });
    }, []);

    let startGame = () => {
        fetch(API_ENDPOINT_GAME + "/startGame", {
            method: "POST",
            body: JSON.stringify({ clientId: clientId, id: gameId }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data && data.status) {
                    setRedirect("/game/play/" + gameId);
                } else {
                    setMsg(data.msg);
                }
            })
            .catch((err) => {
                console.log("something is wrong", err);
            });
    };

    return (
        <div className="container p-5">
            {redirect && redirect !== "" ? <Redirect to={redirect} /> : null}
            <div className=" d-flex border-bottom py-5 justify-content-between align-items-center">
                <div className="">
                    <p className="h4">
                        Welcome <span className="h3 text-muted">{client.name}</span>
                    </p>
                </div>
                <div className="">
                    {roomOwner ? (
                        <button className="btn btn-warning" onClick={startGame}>
                            Start Game
                        </button>
                    ) : null}
                </div>
            </div>
            <div className="mt-3 d-flex flex-column justify-content-between">
                <h1>{msg}</h1>
                {participants && participants.length
                    ? participants.map((v, i) => {
                          return (
                              <p className="" key={i}>
                                  {v.client_id == clientId ? (
                                      <>
                                          <span className="text-muted h5 ">You</span> have joined
                                          this game
                                      </>
                                  ) : (
                                      <>
                                          <span className="text-muted h5">{v.name}</span> joined
                                      </>
                                  )}
                              </p>
                          );
                      })
                    : null}
            </div>
        </div>
    );
};

export default App;
