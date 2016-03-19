//SETUP SERVER------------------------------------------------------------------------------------------------------------------
var express = require('express');
var path = require('path');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var session = require("express-session")({
  secret: "hope and joy",
  resave: true,
  saveUninitialized: true
});
var sharedsession = require("express-socket.io-session");

// attach session
app.use(session); 

//share session with io sockets
io.use(sharedsession(session, {
    autoSave:true
})); 

app.use(express.static("build"));

app.get('/', function(req,res) {
	if(process.env.NODE_ENV!="DEVELOPMENT"){
		res.sendFile(__dirname + '/index.html');
		
	} else{
		res.sendFile(__dirname + '/index-dev.html');
	}
});

server.listen(process.env.PORT || 3000, function(){
  console.log('listening on *:3000');
});

//game-specific libraries------------------------------------------------------------------------------------------------------------------
var gameLogic = require("./game_modules/gameLogic.js");
var gameStates = require("./game_modules/gameStates.js");


//SOCKET EVENTS------------------------------------------------------------------------------------------------------------------

io.on('connection', function (socket) {
  //if we don't have previous cookie data...
  if (!socket.handshake.session.userdata && gameLogic.gameState === gameStates.gatherPlayers){
    //tell the game we have a new player and if Player 1,2, etc.
    socket.emit("new player", {playerIndex: Object.keys(gameLogic.players).length+1});
  }else if (socket.handshake.session.userdata){
    console.log("SESSION RESTORED ", socket.handshake.session.userdata.name)
    //overwrite the socket data for that player, using cookie data
    var name = socket.handshake.session.userdata.name;
    gameLogic.resetSocket(name,socket.id);
    //send the user their previous name
    socket.emit("update userName", {userName: name})
  }else{
    console.log("NEW PLAYER OUTSIDE OF APPROPRIATE WINDOW", socket.handshake.session.userdata)
  }


  socket.emit("pass initial state", {neck: gameLogic.neck, 
    players: gameLogic.players, activePlayer: gameLogic.activePlayer, 
    gameState: gameLogic.gameState})

  socket.on('create player', function(data){   
  	var validName = gameLogic.addPlayer(data.name, data.socketID);
    if (!validName){
      socket.emit("name taken", {playerIndex: Object.keys(gameLogic.players).length+1});
    } else{

      socket.handshake.session.userdata = data;
      socket.emit("update userName", {userName: data.name})
      io.sockets.emit("update players", {players: gameLogic.players, activePlayer: gameLogic.activePlayer})
      io.sockets.emit("update neck", {neck: gameLogic.neck})
    }
  });

//buttons in action area----------------------------------------------------------------------
  socket.on('Start Game', function(){
      gameLogic.startGame();
      io.sockets.emit('game started', {players: gameLogic.players, activePlayer: gameLogic.activePlayer, 
        neck:gameLogic.neck, gameState: gameLogic.gameState})
  });

  socket.on('End Turn', function(){
    gameLogic.nextTurn()
    io.sockets.emit('next turn',{activePlayer: gameLogic.activePlayer})
  });

	socket.on("Move Forward", function(data){
    gameLogic.movePlayer(data.userName, 1);
    io.sockets.emit('update players',{players: gameLogic.players, activePlayer: gameLogic.activePlayer})
    io.sockets.emit('update neck',{neck: gameLogic.neck})
  });

  socket.on("Move Backward", function(data){
    gameLogic.movePlayer(data.userName, -1);
    io.sockets.emit('update players',{players: gameLogic.players, activePlayer: gameLogic.activePlayer})
    io.sockets.emit('update neck',{neck: gameLogic.neck})
  });



});
