var pictionary = function() {
    var canvas, context;
    var socket = io();
    
    var guessBox;
    var userType;
    var initialGuess;
    var randomWord;
    
    var WORDS = [
    "word", "letter", "number", "person", "pen", "class", "people",
    "sound", "water", "side", "place", "man", "men", "woman", "women", "boy",
    "girl", "year", "day", "week", "month", "name", "sentence", "line", "air",
    "land", "home", "hand", "house", "picture", "animal", "mother", "father",
    "brother", "sister", "world", "head", "page", "country", "question",
    "answer", "school", "plant", "food", "sun", "state", "eye", "city", "tree",
    "farm", "story", "sea", "night", "day", "life", "north", "south", "east",
    "west", "child", "children", "example", "paper", "music", "river", "car",
    "foot", "feet", "book", "science", "room", "friend", "idea", "fish",
    "mountain", "horse", "watch", "color", "face", "wood", "list", "bird",
    "body", "dog", "family", "song", "door", "product", "wind", "ship", "area",
    "rock", "order", "fire", "problem", "piece", "top", "bottom", "king",
    "space"
    ];
    
    // var randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    //drawerReset function clears the userGuesses div and displays the drawerTag showing the user it is
    //their turn to draw the displayed word.
    var drawerReset = function(){
        randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
        $('.userGuesses').empty();
        $('#top-message .drawerTag').css('display','inline-block');
        $('.drawerTag span').text(randomWord);
        $('#top-message #guess').css('display','none');
    };
    
    //The guesserReset also resets the userGuesses div and displays the make a guess input. This tells the user
    //it is their turn to make a guess.
    
    var guesserReset = function(){
        $('.userGuesses').empty();
        $('#top-message #guess').css('display','inline-block');
        $('#top-message .drawerTag').css('display','none');
    };

    //The userTypeCheck listener gets the type parameter from the server and declares the clients userType variable.
    //The server takes the first user as a drawer(a drawer's userType = true), and all subsequent connections
    //are guessers (a guessers userType = false).
    socket.on('userTypeCheck',function(type){
        
        userType = type;
        if(userType===true ){
            drawerReset();
        }
        else if(userType===false){
            guesserReset();
        }
        
        //This clientToServerWordCheck listener sends an object to the server containing the userType and randomWord.
        socket.emit('clientToServerWordCheck',{drawer:userType, word:randomWord});

        
    });
    
    

    //function for the enter click. This click is only available to the guesser and not the drawer.
    //The initialGuess variable is assigned to the users guess on every enter click. Then the guessToServer
    //listener emits an object to the server containing the users guess.
    var onKeyDown = function(event) {
        if (event.keyCode != 13) { // Enter
            return;
        }
        
        if(userType===false){
        initialGuess = guessBox.val();
    
        console.log(guessBox.val());
        
        socket.emit('guessToServer', {guess:guessBox.val()});

        
        guessBox.val('');
        }

    };
    
    //This guessToClient listener performs a function with the object created in the guessToServer listener.
    socket.on('guessToClient', function(information){
        
        //If the guesser guesses the word correctly then an object is emitted to ALL clients including the client that emited.
        //But if the guesser does not guess the word correctly then a guessToServer listener is broadcasted.
        //If the guessToServer listener is broadcasted then the following if statement will never be true.
        if(information.guess === initialGuess ){
            userType = true;
            drawerReset();
            context.clearRect(0,0,canvas[0].width,canvas[0].height);
            socket.emit('clientToServerWordCheck',{drawer:userType, word:randomWord});

        //If the guesser guesses the word correctly, then drawer is found by checking for the userType and
        //comparing the drawers span context (which is the randomWord) to the initial saved drawerWord. If the guesser
        //does not guess correctly then the information object will only contain a guess property.
        }
        else if(userType===true && $('span').text() ===information.word){
                userType = false;
                guesserReset();
                context.clearRect(0,0,canvas[0].width,canvas[0].height);

        }
        
        //If the user guesses correctly then an object will return that contains both the guess and word
        //property. Then this function will reset the canvas and guesser input for all other guessers.
        else if(userType===false && information.guess === information.word){
            guesserReset();
            context.clearRect(0,0,canvas[0].width,canvas[0].height);
        }
        //If the guesser does not guess correctly then the userGuesses div will be changed to the wrong guess to all
        //other clients,excluding the client that sent the guess since the emitter will be broadcasted.
        else {
            var guessArea = $('.userGuesses');
            guessArea.text(information.guess);   
        }
    });
    

    guessBox = $('input');
    guessBox.on('keydown', onKeyDown);

    
    
    //function to draw on the canvas/context.
    var draw = function(position) {
        context.beginPath();
        context.arc(position.x, position.y,
                         6, 0, 2 * Math.PI);
        context.fill();
    };
    //drawing boolean is used to determine when to draw if the user clicks down.
    var drawing = false;
    canvas = $('canvas');
    context = canvas[0].getContext('2d');
    
    canvas[0].width = canvas[0].offsetWidth;
    canvas[0].height = canvas[0].offsetHeight;
    //drawing boolean is changed from true to false from the mousedown and mouseup events.
    canvas.on('mousedown', function(){
        drawing = true;
    });
    canvas.on('mouseup', function(){
        drawing = false;
    });
    canvas.on('mousemove', function(event) {
        if(userType){
            if(drawing){
                var offset = canvas.offset();
                var position = {x: event.pageX - offset.left,
                                y: event.pageY - offset.top};
                draw(position);
                socket.emit('clientToServer',position);
            }
        }
        
    });
    
    
    //This serverToClient listener will use the draw function when it is emmited. Which
    //will be in the server due to the mousemove event.
    socket.on('serverToClient', draw);

};

$(document).ready(function() {
    pictionary();
    
});

