import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
const Home = lazy(() => import("./Home"));
const Game = lazy(() => import("./Game"));

function App() {
    return (
        <div className="App h-100">
            <Router>
                <Suspense fallback={<h1>Loading...</h1>}>
                    <Switch>
                        <Route exact path="/" component={Home} />
                        <Route exact path="/:gameId" component={Game} />
                    </Switch>
                </Suspense>
            </Router>
        </div>
    );
}

export default App;
