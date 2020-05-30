import React, { useEffect, useState } from "react";
import { NavLink, Redirect } from "react-router-dom";
import socketIOClient from "socket.io-client";
import { API_ENDPOINT, API_ENDPOINT_CLIENT, API_ENDPOINT_GAME } from "../config/constant";
import RegisterClient from "../component/RegisterClient";

const socket = socketIOClient(API_ENDPOINT);
const App = () => {
    const [games, setGames] = useState([]);
    const [redirect, setRedirect] = useState("");
    const [msg, setMsg] = useState("");
    const [client, setClient] = useState(false);
    const [showRegistration, setShowRegistration] = useState(false);

    let getGameList = async () => {
        fetch(API_ENDPOINT_GAME, {
            method: "GET",
        })
            .then((response) => response.json())
            .then((data) => {
                if (data && data.status) {
                    setGames(data.data);
                }
            })
            .catch((err) => {
                console.log("something is wrong", err);
            });
    };

    let getClientData = async (id) => {
        fetch(API_ENDPOINT_CLIENT + "/getClientById?clientId=" + id, {
            method: "GET",
        })
            .then((response) => response.json())
            .then((data) => {
                if (data && data.status) {
                    setClient(data.data);
                } else {
                    localStorage.clear();
                }
            })
            .catch((err) => {
                localStorage.clear();
                console.log("something is wrong", err);
            });
    };

    useEffect(() => {
        socket.on("newGame", (data) => {
            setGames(data);
        });
        getGameList();
        if (localStorage.getItem("clientId")) {
            getClientData(localStorage.getItem("clientId"));
        } else {
            setShowRegistration(true);
        }
    }, []);

    let registered = (id) => {
        if (id) {
            getClientData(id);
            setShowRegistration(false);
        }
    };

    let createNewGame = () => {
        let { id } = client;

        fetch(API_ENDPOINT_GAME + "/createGame", {
            method: "POST",
            body: JSON.stringify({ clientId: id }),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.status && data["data"] && data["data"]["gameId"]) {
                    setRedirect("/" + data["data"]["gameId"]);
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
            {redirect ? <Redirect to={redirect} /> : null}
            {!showRegistration ? (
                <>
                    <div className=" d-flex border-bottom py-5 justify-content-between align-items-center">
                        <div className="">
                            <p className="h4">
                                Welcome <span className="h3 text-muted">{client.name}</span>
                            </p>
                        </div>
                        <div className="">
                            <button className="btn btn-warning" onClick={createNewGame}>
                                Create New
                            </button>
                        </div>
                    </div>
                    <h3 className="mt-3">Games Listing</h3>
                    <h3 className="my-1">{msg}</h3>
                    {games && games.length
                        ? games.map((v, i) => {
                              return (
                                  <div key={i}>
                                      <p>
                                          {`Game ${v.id} is `}
                                          <span className="h4">{v.status}</span>
                                          {v.status == "open" ? (
                                              showRegistration ? (
                                                  "Register to join this game"
                                              ) : (
                                                  <>
                                                      <NavLink
                                                          disabled
                                                          className="  text-info"
                                                          to={`/${v.id}`}
                                                      >
                                                          {" "}
                                                          Click{" "}
                                                      </NavLink>{" "}
                                                      {"here to join"}
                                                  </>
                                              )
                                          ) : (
                                              ""
                                          )}
                                      </p>
                                  </div>
                              );
                          })
                        : null}
                </>
            ) : (
                <RegisterClient registered={registered} />
            )}
        </div>
    );
};

export default App;
