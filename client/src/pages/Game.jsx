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
                    setParticipants(data.data);
                    console.log(data["data"][0]["client_id"]);
                    if (data && data.data.length && data["data"][0]["created_by"] == clientId) {
                        setRoomOwner(clientId);
                    }
                }
            })
            .catch((err) => {
                console.log("something is wrong", err);
            });
    };
    let getClientData = async (id) => {
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
        socket.on("newParticipant", (data) => {
            setParticipants(data);
        });
        getClientData();
        getGameParticipants();
    }, []);

    let startGame = () => {};

    return (
        <div className="container p-5">
            <div className=" d-flex border-bottom py-5 justify-content-between align-items-center">
                <div className="">
                    <p className="h4">
                        Welcome <span className="h3 text-muted">{client.name}</span>
                    </p>
                </div>
                <div className="">
                    {roomOwner ? <button className="btn btn-warning">Start Game</button> : null}
                </div>
            </div>
            <div className="mt-3 d-flex flex-row justify-content-between">
                <div>
                    {participants && participants.length
                        ? participants.map((v, i) => {
                              return (
                                  <p className="" key={i}>
                                      {v.client_id == clientId ? (
                                          <>
                                              <span className="text-muted h5 ">You</span> have
                                              joined this game
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
        </div>
    );
};

export default App;
