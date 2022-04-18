const MAX_USERS_ROOM =  5;
const MAX_PLAYERS = 2;
let restartCount = 0;

//Initialize the express 'app' object
let express = require('express');
const { del } = require('express/lib/application');
let app = express();
app.use('/', express.static('public'));

//Initialize the actual HTTP server
let http = require('http');
let server = http.createServer(app);
let {instrument}  = require("@socket.io/admin-ui");

//Initialize socket.io
let io = require('socket.io');
io = new io.Server(server, {
    cors: {
        origin: ["https://admin.socket.io"],
        credentials: true
      }
});

instrument(io, {
    auth: false
});

// let rooms = {}; // key value pair - 'roomname' : number of people in room
// let users = {}; // key value pair - 'username' : userid
let gameRooms = {};
let players = {};

app.use('/', express.static('public'));

io.sockets.on('connect', (socket) => {
    console.log("we have a new client: ", socket.id);

    //on disconnection
    socket.on('disconnect', () => {
        console.log('connection ended, ', socket.id);
        gameRooms[socket.gameRoomName]--;
        delete players[socket.playerName];
        socket.to(socket.gameRoomName).emit('playerLeft');
        // console.log(users);
        console.log(players);
        // console.log(rooms);
        console.log(gameRooms);
    })

    //get user data
    socket.on('playerData', (data) => {
        //save user name in an array
        socket.playerName = data.name;
        players[socket.playerName] = socket.id;

        // console.log(users);
        console.log(players);

        // MODIFIED POST CLASS - limiting number of people in room
        if(gameRooms[data.room]) { //is the room already there?
            if(gameRooms[data.room] < MAX_PLAYERS) {
                //let the socket join room of choice
                socket.gameRoomName = data.room; // we will add this data to the socket only after we can verify that there is space
                socket.join(socket.gameRoomName);
                gameRooms[socket.gameRoomName]++;
                io.in(socket.gameRoomName).emit('clientCountGame', gameRooms[socket.gameRoomName]);
            } else {
                delete players[socket.playerName];
                // console.log(users);
                console.log(players);
                // console.log(rooms);
                console.log(gameRooms);
                io.to(socket.id).emit('maxPlayersReached');
            }
        } else {
            socket.gameRoomName = data.room;
            socket.join(socket.gameRoomName);  
            // rooms[socket.roomName] = io.sockets.adapter.rooms.get(socket.roomName).size;
            gameRooms[socket.gameRoomName] = 1;
            io.in(socket.gameRoomName).emit('clientCountGame', gameRooms[socket.gameRoomName]);
        }

        socket.to(socket.gameRoomName).emit("playerTwoName", data.name);

        // console.log(rooms);
        // console.log(io.sockets.adapter.rooms.get(socket.roomName).size);
        console.log(gameRooms);
        // console.log(io.sockets.adapter.rooms.get(socket.gameRoomName).size);
        
    })

    socket.on('returnData', (data) => {
        io.in(socket.gameRoomName).emit('clientCountGame', gameRooms[socket.gameRoomName]);
        // console.log(users);
        console.log(players);
        // console.log(rooms);
        console.log(gameRooms);
    })

    socket.on('restartClicked', () => {      
        socket.to(socket.gameRoomName).emit('restartServerData');
    })

    socket.on('restartedGame', () => {
        restartCount = 0;
    })

    socket.on('playerOnePosition', (data) => {
        // console.log(data);
        socket.to(socket.gameRoomName).emit('playerTwoServer', data);
    })

    socket.on('enemyPosition', (data) => {
        // console.log(data);
        socket.to(socket.gameRoomName).emit('enemyTwoServer', data);
    })

    socket.on('featherPosition', (data) => {
        // console.log(data);
        socket.to(socket.gameRoomName).emit('featherServer', data);
    })

})

server.listen(9000, () => {
  console.log("server is up and running")
})