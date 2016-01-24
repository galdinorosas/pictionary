var pictionary = function() {
    var canvas, context;
    var socket = io();
    
    var guessBox;
    var userType;
    
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
    
    var randomWord = WORDS[Math.floor(Math.random() * WORDS.length)];
    

    
    socket.on('userTypeCheck',function(type){
        
        userType = type;
        if(userType===true){
            $('#top-message .drawerTag').css('display','inline-block');
            $('.drawerTag span').text(randomWord);
            $('#top-message #guess').css('display','none');
        }
        else if(userType===false){
            $('#top-message #guess').css('display','inline-block');
            $('#top-message .drawerTag').css('display','none');
        }
        
    });
    
    


    var onKeyDown = function(event) {
        if (event.keyCode != 13) { // Enter
            return;
        }
        
        if(userType===false){
    
        console.log(guessBox.val());
        
        socket.emit('guessToServer', {guess:guessBox.val(),random:randomWord});

        
        guessBox.val('');
        }

    };
    
    socket.on('guessToClient', function(information){
        
        var guessArea = $('.userGuesses');
        guessArea.text(information.guess);
    });
    

    guessBox = $('input');
    guessBox.on('keydown', onKeyDown);

    
    

    var draw = function(position) {
        context.beginPath();
        context.arc(position.x, position.y,
                         6, 0, 2 * Math.PI);
        context.fill();
    };
    var drawing = false;
    canvas = $('canvas');
    context = canvas[0].getContext('2d');
    canvas[0].width = canvas[0].offsetWidth;
    canvas[0].height = canvas[0].offsetHeight;
    canvas.on('mousedown', function(){
        drawing = true;
    });
    canvas.on('mouseup', function(){
        drawing = false;
    });
    canvas.on('mousemove', function(event) {
        if(userType===true){
            if(drawing){
                var offset = canvas.offset();
                var position = {x: event.pageX - offset.left,
                                y: event.pageY - offset.top};
                draw(position);
                socket.emit('clientToServer',position);
            }
        }
        
    });
    
    
    
    socket.on('serverToClient', draw);
    socket.emit('drawerWordCheck',{type:userType,word:randomWord});

};

$(document).ready(function() {
    pictionary();
    
});

