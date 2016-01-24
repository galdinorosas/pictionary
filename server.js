var http = require('http');
var express = require('express');
var socket_io = require('socket.io');

var app = express();
app.use(express.static('public'));

var server = http.Server(app);
var io = socket_io(server);

var totalUsers = 0;
var serverUserType = true;
var drawerWord;
    io.on('connection', function(socket){

        
        totalUsers++;
        if(totalUsers===1){
            serverUserType = true;
        }
        else if(totalUsers === 2){
            serverUserType = false;
        }
        
        socket.emit('userTypeCheck', serverUserType);


        socket.on('drawerWordCheck', function(wordCheckObject){
            if(wordCheckObject.type===true){
                drawerWord=wordCheckObject.word;
                return drawerWord;
            }
            
        });
        

        
        


        console.log(totalUsers);
        


        
        socket.on('clientToServer', function(clientObject){
            socket.broadcast.emit('serverToClient', clientObject);
            
        });
        
        socket.on('guessToServer', function(message){
            
            console.log(message);
            if(message.guess.toLowerCase()===drawerWord){
                var serverToClientObject = {guess:message.guess,drawerWord:drawerWord};
                console.log(serverToClientObject);
                socket.emit('guessToClient', serverToClientObject);
                socket.broadcast.emit('guessToClient', serverToClientObject);
            };
            socket.broadcast.emit('guessToClient', message);

        });
        

        
        console.log(drawerWord);
        
        socket.on('disconnect', function(){
            totalUsers--;
            console.log(totalUsers);
        });
        
        
        
    });

server.listen(8080);