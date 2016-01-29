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
var usersArray =[];
var connectedUsersArray;
var drawerHere = false;
var drawerCheckCount = 0;
    io.on('connection', function(socket){
        
        socket.emit('setID', socket.id);
        
        previousTotalUsers = totalUsers;
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
        

        
        socket.on('disconnect', function(type){
            // console.log(type);
            totalUsers--;
            usersArray = [io.sockets.clients()];
            connectedUsersArray = Object.getOwnPropertyNames(usersArray[0].server.nsps['/'].sockets);
            //When a user disconnects I will be emitting the serverToClientDrawerCheck listener.
            socket.broadcast.emit('serverToClientDrawerCheck');

        });
        //The client emmited a testTwo listner with the userType data. All the clients still connected after the disconnection
        //will go run the testTwo listener. The variable drawerHere is a global variable that is originally false.
        //As all the remaining clients run the testTwo listener, if any of the clients are the drawer then the global variable
        //drawerHere will be set to true.
        
        //Another set of if statments wait till the  drawerCheckCount matches the totalUsers and to compare drawerHere boolean value.
        //At the end of all the remaining clients emmitting the testTwo listener, if there original drawer is still playing
        //then the game will go on. If the drawer is the client that left, then drawerHere will be false and a new drawer will be added.
        socket.on('testTwo', function(clientToServerDrawerCheck){
            drawerCheckCount++;
            // console.log(clientToServerDrawerCheck);
            if(clientToServerDrawerCheck===true){
                drawerHere = true;

            }
            
            if(drawerHere===true && drawerCheckCount === totalUsers){
                drawerCheckCount = 0;
                drawerHere = false;
                console.log('working fine');

            }
            else if (drawerHere===false && drawerCheckCount ===totalUsers){
                drawerHere = false;
                drawerCheckCount = 0;
                for(var i = 0; i < connectedUsersArray.length;i++){
                    if(i === connectedUsersArray.length-1){
                        io.sockets.connected[connectedUsersArray[i]].emit('addNewDrawer', true);
                    }
                    else{
                        io.sockets.connected[connectedUsersArray[i]].emit('resetGuessers');

                        
                    }
                }
            }
            

        });
        


        
    });

server.listen(8080);