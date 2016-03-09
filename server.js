var http = require('http');
var express = require('express');
var socket_io = require('socket.io');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

var totalUsers = 0;
var previousTotalUsers;
var serverUserType = true;
var drawerWord;
var usersArray = [];
var connectedUsersArray;
var drawerHere = false;
var drawerCheckCount = 0;

io.on('connection', function(socket) {

    socket.emit('setID', socket.id);

    previousTotalUsers = totalUsers;

    totalUsers++;

    if (totalUsers > 1) {
        serverUserType = false;
    } else {
        serverUserType = true;
    }

    socket.emit('userTypeCheck', serverUserType);

    socket.on('clientToServerWordCheck', function(wordCheckObject) {
        if (wordCheckObject.drawer) {
            drawerWord = wordCheckObject.word;
        }
    });

    console.log(totalUsers);

    socket.on('clientToServer', function(clientObject) {
        socket.broadcast.emit('serverToClient', clientObject);
    });

    socket.on('guessToServer', function(message) {
        if (message.guess.toLowerCase() === drawerWord) {
            var guessToClientObject = { guess: message.guess, word: drawerWord };
            io.sockets.emit('guessToClient', guessToClientObject);
        } else {
            socket.broadcast.emit('guessToClient', message);
        }
    });

    socket.on('disconnect', function() {
        totalUsers--;
        usersArray = [io.sockets.clients()];
        connectedUsersArray = Object.getOwnPropertyNames(usersArray[0].server.nsps['/'].sockets);
        //When a user disconnects I will be emitting the serverToClientDrawerCheck listener.
        socket.broadcast.emit('serverToClientDrawerCheck');

    });

    socket.on('drawerHere', function(clientToServerDrawerCheck) {
        drawerCheckCount++;
        // set drawer exist if any client is a drawer
        if (clientToServerDrawerCheck === true) {
            drawerHere = true;
        }

        // if the last client
        if (drawerCheckCount === totalUsers) {
            // if there is a drawer
            if (drawerHere === true) {
                drawerCheckCount = 0;
            } else {
                drawerCheckCount = 0;
                for (var i = 0; i < connectedUsersArray.length; i++) {
                    if (i === connectedUsersArray.length - 1) {
                        io.sockets.connected[connectedUsersArray[i]].emit('addNewDrawer', true);
                    } else {
                        io.sockets.connected[connectedUsersArray[i]].emit('resetGuessers');
                    }
                }
            }
            
            drawerHere = false;
        }
    });
});

server.listen(8080);