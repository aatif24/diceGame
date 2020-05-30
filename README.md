### Simple Dice Game

System requirement

NodeJs ^13.7.0<br/>
npm ^6.13.6

-   P.S : you will need at least two browser windows to play a game
-   Need two terminals to run this project <br/>
    a.   one is where you will be running server <br/>
    b.   second is where you will be running client <br/>
-   Import mysql db file found in root directory with name `/dbStructure.sql`

### run `npm install` into root folder as well as in ./client folder to add all required packages to the project

## Available Scripts

In the project directory, you can run:

### `node app.js` OR `nodemon app.js`

Runs the app in the development mode.<br />
this is server which will be accessed from client side.

in `./client` folder (presumed run npm install OR npm i)

### `yarn start` OR `npm start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn test` OR `npm test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `yarn build` or `npm build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

# Project Workflow

## Server

`app.js` is a main server file in which I have made Socker.io, Mysql Connection and Constants file globally accessible throughout express routes. also, defined a route file where I have defined all routes for incomming requests.

`./routes/index.js` here all routes are defined as per the code module (in this case only two, game and client).

`./modle` in this directory i have kept all the module wise model files where all db transactions are happening.

`./routes/game.js` all game related router functions are declared here.
`./routes/client.js` all client related router functions are declared here.

## Client

This is ReactJs application to serve client a good and simple interface to play a dice game

`./client/index.js` is root file where i have defined from where application will start which is `./client/src/pages/Index.js`

in `./client/src/pages/Index.js` i have defined all the routes and their components.

-   Pages are follows :

1.  Home : where client will register himself and once registered he/she can see list of open game he/she can join or create a new game all together.
2.  Game : where all participants can see who have joined this game.
    a. only host can start the game.
3.  GamePlay : here the actual game is being played.

## Game Play

    a. all players will be playing/ rolling a dice turn by turn
    b. once you play your turn untill all players played their turns your dice is disabled
    c. if you failed to play your turn in given time limit, application will play on your behalf.
    d. once any player reached on a given score limit, this is where game will be stoped and winner will be declared
