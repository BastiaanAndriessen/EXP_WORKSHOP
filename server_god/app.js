var currentServerPort = 1337;
var opponentServerPort = 1336;

var ip = "172.30.33.186";

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var webSocket = require('ws');
var ws = new webSocket('ws://127.0.0.1:6437');

//leap connection
var Leap = require('leapjs');
var controller = new Leap.Controller({enableGestures: true});

            var isHorizontalSwipe = false;
            var isVerticalSwipe = false;

app.use(express.static(__dirname + '/public'));
app.get('localhost:'+currentServerPort, function(req, res){
    ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
    console.log('[app.js] server god. requested root');
    res.sendfile(__dirname + '/public/index.html');
});

var score1 = 0;
var score2 = 0;

//client connection
var clientio = require('socket.io-client');
console.log('[app.js] server god: satan server http://'+ip+':'+opponentServerPort);
var client = clientio.connect('http://'+ip+':'+opponentServerPort);

client.on('connect', function(){
    console.log('[app.js] server god connected to opponent server');

    ws.on('message', function(data, flags){
        //send data to other server
        console.log('[app.js] data');
        client.emit('LEAP_DATA', data);
    });

    /*setInterval(function(e){
        client.emit('LEAP_DATA', { my: 'data from interval: '+Math.round(Math.random()*100)/100 });
    }, 3000);*/

    Leap.loop({enableGestures: true},
        function(godFrame)
        {

            var gestures = godFrame.gestures,
                circle,
                pointable,
                direction,
                normal;

            console.log(gestures);
            if(gestures.length > 0) {
                for (var i = 0; i < godFrame.gestures.length; i++) {
                    var gesture = godFrame.gestures[i];

                    console.log('>>>>>>>> gesture length > 0 '+gesture.type);

                    if (gesture.type == "swipe") {
                        var isHorizontal = Math.abs(gesture.direction[0]) > Math.abs(gesture.direction[1]);

                        if(isHorizontal){
                            if(gesture.direction[0] > 0){
                                swipeDirection = "right";
                                var gestureInterval = setInterval(function(){
                                    clearInterval(gestureInterval);
                                }, 2000);
                                isHorizontalSwipe = true;
                            } else {
                                isHorizontalSwipe = true;
                            }
                        }else{
                            if(gesture.direction[1] > 0){
                                isVerticalSwipe = true;
                            }else{
                                isVerticalSwipe = true;
                            }
                        }
                    }
                }
            }

            console.log('isHorizontalSwipe '+isHorizontalSwipe);
            if(isHorizontalSwipe || isVerticalSwipe)
            {
                console.log('>>>>>>>> true');
                client.emit('LEAP_SWIPE_DIRECTIONS', 'true');
                isHorizontalSwipe = false;
                isVerticalSwipe = false;
            }
        });

    //receive data from opponent server
    client.on('GOD_DATA', function(data){
        console.log('[app.js] server god. received score data '+data);
        console.log('[app.js] server god. received score data '+data[0]);
        console.log('[app.js] server god. received score data '+data[1]);
        score1 = data[0];
        score2 = data[1];
    });
});

server.listen(currentServerPort);
