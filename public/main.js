var pictionary = function() {
    var canvas, context;
    var socket = io();
    
    var guessBox;

    var onKeyDown = function(event) {
        if (event.keyCode != 13) { // Enter
            return;
        }
    
        console.log(guessBox.value());
        guessBox.val('');
    };
    

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
        if(drawing){
        var offset = canvas.offset();
        var position = {x: event.pageX - offset.left,
                        y: event.pageY - offset.top};
        draw(position);
        socket.emit('clientToServer',position);
        }
        
    });
    
    
    
    socket.on('serverToClient', draw);
};

$(document).ready(function() {
    pictionary();
    
});

