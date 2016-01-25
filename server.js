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
        if(totalUsers>1){
            serverUserType = false;
        }
        else{
            serverUserType = true;
        }

        
        socket.emit('userTypeCheck', serverUserType);


        socket.on('clientToServerWordCheck', function(wordCheckObject){
            if(wordCheckObject.drawer){
                drawerWord=wordCheckObject.word;
                console.log(wordCheckObject);
                
            }
            // console.log(wordCheckObject);
            
        });
        

        

        
        


        console.log(totalUsers);
        


        
        socket.on('clientToServer', function(clientObject){
            socket.broadcast.emit('serverToClient', clientObject);

            
        });
        
        socket.on('guessToServer', function(message){
            
            // console.log(message);
            if(message.guess.toLowerCase()===drawerWord){
                var guessToClientObject = {guess:message.guess,word:drawerWord};
                console.log(guessToClientObject);
                // var drawerChange = false;
                // socket.emit('guessToClient', guessToClientObject);
                // socket.broadcast.emit('guessToClient', guessToClientObject);
                io.sockets.emit('guessToClient', guessToClientObject);
            }
            else{

            socket.broadcast.emit('guessToClient', message);
            }
            

        });
        

        
        socket.on('disconnect', function(){
            totalUsers--;
            console.log(totalUsers);
        });
        
        
        
    });

server.listen(8080);