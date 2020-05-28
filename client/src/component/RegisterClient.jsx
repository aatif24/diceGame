import React, { useState } from "react";
import { API_ENDPOINT_CLIENT } from "../config/constant";

const App = ({ registered }) => {
    const [name, setName] = useState("");
    let register = () => {
        let data = {
            name: name,
        };

        fetch(API_ENDPOINT_CLIENT + "/register", {
            method: "POST",
            // headers: { "Content-Type": "application/x-www-form-urlencoded" },
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        })
            .then((response) => response.json())
            .then((data) => {
                if (data.status) {
                    localStorage.setItem("clientId", data.data);
                    registered(data.data);
                } else {
                    registered(false);
                }
            });
    };
    return (
        <div className="">
            <div className="form-group col-4">
                <label className="control-label">Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                    }}
                    className="form-control"
                    name="name"
                />
            </div>
            <div className="form-group col-4 text-right">
                <button className="btn btn-warning" onClick={register}>
                    Save
                </button>
            </div>
        </div>
    );
};

export default App;
