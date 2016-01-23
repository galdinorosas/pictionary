var http = require('http');
var express = require('express');
var socket_io = require('socket.io');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

var totalUsers = 0;

    io.on('connection', function(socket){
        
        totalUsers++;
        console.log(totalUsers);
        
        socket.on('clientToServer', function(clientObject){
            socket.broadcast.emit('serverToClient', clientObject);
            
        });
        
        
        
        
    });

server.listen(8080);