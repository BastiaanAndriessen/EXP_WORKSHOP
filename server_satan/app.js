/*var webSocket = require('ws'),
    ws = new webSocket('ws://127.0.0.1:6437'),
    five = require('johnny-five'),
    board = new five.Board(),
    led8, led12, led13, frame, rot = 0, diffRot = 179,
    rightEnabled, leftEnabled;
    var Leap = require('leapjs');
    var controller = new Leap.Controller({enableGestures: true});

    console.log('[app.js] >>> leap '+Leap);
    Leap.loop({enableGestures: true},
        function(frame) 
        {
            var gestures = frame.gestures,
            circle,
            pointable,
            direction,
            normal;

            //niet uit commentaar halen indien niet nodig
            //console.log('[app.js] >>>> gestures');


            if(gestures.length > 0) {

            if(gestures[0].type == 'circle') {
                circle = gestures[0];
                circle.pointable = frame.pointable(circle.pointableIds[0]);
                console.log('[app.js] >>>> type is circle');


                if(circle.state == 'start') {
                    console.log('[app.js] >>>> circle started');

                    clockwise = true;
                } else if (circle.state == 'update') {
                    direction = circle.pointable.direction;
                    console.log('[app.js] >>>> circle updated');


                    if(direction) {
                        normal = circle.normal;
                        clockwise = Leap.vec3.dot(direction, normal) > 0;
                        if(clockwise) {

                        } else {

                        }
                    }
                }
            }
        }
        });

board.on('ready', function() {
    led8 = new five.Led(8);
    led12 = new five.Led(12);
    led13 = new five.Led(13);

    var servo = new five.Servo({
        pin: 10
    });

    ws.on('message', function(data, flags) {
        frame = JSON.parse(data);


        //get left/right hand id
        var rightHandId = 0;
        var leftHandId = 0;
        if(frame.hands.length>0){
            if(frame.hands.length < 2){
                rightHandId = frame.hands[0].id;
                //direction 0 kleiner dan 0 = links, groter da 0 = rechts
                //console.log('[app.js] direction'+frame.hands[0].direction[0]);

                //console.log('right hand');
            }else{
                if(frame.hands[0].palmPosition[0] > frame.hands[1].palmPosition[0]){
                    rightHandId = frame.hands[0].id;
                    leftHandId = frame.hands[1].id;
                    //console.log('left and right hand');
                }else{
                    rightHandId = frame.hands[1].id;
                    leftHandId = frame.hands[0].id;
                    //console.log('left and right hand');

                }
            }
        }

        if(leftHandId!=0 && !leftEnabled){
            led12.on();
            leftEnabled = true;
            servo.to(rot);
            (rot<(360-diffRot))?rot += diffRot:rot=0;
            console.log('[app.js] rot: '+rot);
        }else if(leftHandId == 0){
            led12.off();
            leftEnabled = false;
        }

        if(rightHandId!=0 && !rightEnabled){
            led13.on();
            rightEnabled = true;
            servo.to(rot);
            (rot<(360-diffRot))?rot += diffRot:rot=0;
            console.log('[app.js] rot: '+rot);
        }else if(rightHandId == 0){
            led13.off();
            rightEnabled = false;
        }



    });

    var sensor = new five.Sensor("A0");
    var interval = 0;
    sensor.scale([0, 100]).on("read", function() {
        var self = this;
        if(interval==0){
            interval = setInterval(function(e){
                console.log('[app.js] light sensor value: '+self.value);
            },500);
        }
        if(this.value < 15){
            led8.on();
            var interval2 = setInterval(function(){
                clearInterval(interval2);
                led8.off();
            }, 2000);
        }
    });
});*/

var currentServerPort = 1336;
var opponentServerPort = 1337;
var playerIp = "172.30.33.174";
var opponentIp = "172.30.33.174";

var leapMotionDataReceived = 0;

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = io = require('socket.io').listen(server);

var zmq = require('zmq');
var sock = zmq.socket('pull');

app.use(express.static(__dirname + '/public'));
console.log('[app.js] satan: get path http://'+playerIp+':'+currentServerPort);
app.get('http://'+playerIp+':'+currentServerPort, function(req, res){
    res.sendfile(__dirname + '/public/index.html');
});

//receive data from other server
sock.connect('tcp://'+playerIp+':'+currentServerPort);
console.log('[app.js] god server: worker connected to port:'+currentServerPort);

sock.on('message', function(msg){
    //client connection
    leapMotionDataReceived++;
    console.log('[app.js] satan server: received data: %s', msg.toString());
    io.sockets.emit('message', "leap motion data received: "+leapMotionDataReceived);
});

server.listen(currentServerPort);

