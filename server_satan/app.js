var currentServerPort = 1336;
var opponentServerPort = 1337;
var ip = "172.30.33.186";

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var webSocket = require('ws'),
ws = new webSocket('ws://127.0.0.1:6437');
var Speaker = require('speaker'),
five = require('johnny-five'),
board = new five.Board(),
led6, led7, led8, led12, led13, frame, rot = 0, diffRot = 179,
rightEnabled, leftEnabled, godLeftEnabled, godRightEnabled;

var Leap = require('leapjs');
var controller = new Leap.Controller({enableGestures: true});

var godFrame;


var earthquakeActivated = false, countTouched = 0, points = 0;
var tiltActivated = false, tiltCountTouched = 0, playerTwoPoints = 0;

var Player = require('player');

var leapMotionDataReceived = 0;




app.use(express.static(__dirname + '/public'));
console.log('[app.js] satan: get path http://'+ip+':'+currentServerPort);
app.get('http://'+ip+':'+currentServerPort, function(req, res){
    res.sendfile(__dirname + '/public/index.html');
});



//code arduino en leap
console.log('[app.js] >>> leap '+Leap);

board.on('ready', function() {
    //led7 = new five.Led(7);
            led6 = new five.Led(6);
        led7 = new five.Led(7);


    //server
    io.sockets.on('connection', function (socket) {
        console.log('[app.js] satan server. connection established.');

        socket.on('LEAP_DATA', function (data) {
            //io.sockets.emit('leap', "leap motion data received: "+leapMotionDataReceived);
            //leapMotionDataReceived++;

            //console.log('[app.js] server_satan, data leap is '+data);
            //console.log('[app.js] server_satan, data leap hands is '+data.hands);

            godFrame = JSON.parse(data);
            var godRightHandId = 0;
            var godLeftHandId = 0;

            //console.log('[app.js] json.parse data is godFrame: '+godFrame.hands.length);

            if(godFrame.hands.length>0){
                if(godFrame.hands.length < 2){
                    godRightHandId = godFrame.hands[0].id;
                    //direction 0 kleiner dan 0 = links, groter da 0 = rechts
                    //console.log('[app.js] direction'+frame.hands[0].direction[0]);

                }else{
                    if(godFrame.hands[0].palmPosition[0] > godFrame.hands[1].palmPosition[0]){
                        godRightHandId = godFrame.hands[0].id;
                        godLeftHandId = godFrame.hands[1].id;
                    }else{
                        godRightHandId = godFrame.hands[1].id;
                        godLeftHandId = godFrame.hands[0].id;
                    }
                }
            }

            if(godLeftHandId!=0 && !godLeftEnabled){
                led6.on();
                godLeftEnabled = true;
                var player = new Player('pinball3.mp3');

                player.play(function(err, player){
                    console.log('[app.js] play pinball3')
                });
                player.play();
            }else if(godLeftHandId == 0){
                led6.off();
                godLeftEnabled = false;
            }

            if(godRightHandId!=0 && !godRightEnabled){
                led7.on();
                godRightEnabled = true;
                console.log('[app.js] rot: '+rot);
                var player = new Player('pinball3.mp3');

                player.play(function(err, player){
                    //console.log('[app.js] play pinball3')
                });
                player.play();
            }else if(godRightHandId == 0){
                led7.off();
                godRightEnabled = false;
            }
        });

        socket.on('LEAP_SWIPE_DIRECTIONS', function(data){
            console.log('[app.js] satan server. received swipe directions: '+data);
            if(data == 'true')
            {
                console.log('[app.js] satan server. >>>>> TRUE');
                if(tiltActivated)
                {
                    var player = new Player('pinball2.mp3');

                                player.play(function(err, player){
                                    //console.log('[app.js] play pinball2')
                                });
                                player.play();
                                led8.on();
                                var gestureInterval = setInterval(function(){
                                    clearInterval(gestureInterval);
                                    led8.off();
                                }, 2000);

                    tiltActivated = false;
                    tiltCountTouched = 0;
                }
            }
            /*console.log('[app.js] satan server. received swipe directions: '+data.swipeDirection[0]);
            console.log('[app.js] satan server. received swipe directions: '+data.swipeDirection[1]);
            if(tiltActivated)
            {
                if(data.swipeDirection[0]==1 || data.swipeDirection[1]==1)
                {
                    tiltActivated = false;
                    tiltCountTouched = 0;
                }
            }*/
        });

        setInterval(function(e){
            //console.log('satan server. send score data to opponent server');
            socket.emit('GOD_DATA', {score1:points ,score2: playerTwoPoints, tilt: tiltActivated, earthquake:earthquakeActivated});
        }, 3000);
    });

    led8 = new five.Led(8);
    led12 = new five.Led(12);
    led13 = new five.Led(13);

    var servo = new five.Servo({
        pin: 10
    });

    ws.on('message', function(data, flags) {
        frame = JSON.parse(data);

        var rightHandId = 0;
        var leftHandId = 0;
        if(frame.hands.length>0){
            if(frame.hands.length < 2){
                rightHandId = frame.hands[0].id;
                //direction 0 kleiner dan 0 = links, groter da 0 = rechts
                //console.log('[app.js] direction'+frame.hands[0].direction[0]);

            }else{
                if(frame.hands[0].palmPosition[0] > frame.hands[1].palmPosition[0]){
                    rightHandId = frame.hands[0].id;
                    leftHandId = frame.hands[1].id;
                }else{
                    rightHandId = frame.hands[1].id;
                    leftHandId = frame.hands[0].id;
                }
            }
        }

        if(leftHandId!=0 && !leftEnabled){
            led12.on();
            leftEnabled = true;
            var player = new Player('pinball3.mp3');

            player.play(function(err, player){
                //console.log('[app.js] play pinball3')
            });
            player.play();
        }else if(leftHandId == 0){
            led12.off();
            leftEnabled = false;
        }

        if(rightHandId!=0 && !rightEnabled){
            led13.on();
            rightEnabled = true;
            //console.log('[app.js] rot: '+rot);
            var player = new Player('pinball3.mp3');

            player.play(function(err, player){
                //console.log('[app.js] play pinball3')
            });
            player.play();
        }else if(rightHandId == 0){
            led13.off();
            rightEnabled = false;
        }
    });


  
    var sensor = new five.Sensor("A0");
    var interval = 0;
    var oldValue = 100;
    sensor.scale([0, 100]).on("read", function() {
        var self = this;
        if(interval==0){
            interval = setInterval(function(e){
                //console.log('[app.js] light sensor value: '+self.value);
            },500);
        }
        if(this.value < 30){
            led8.on();
            //console.log('[app.js] this.value is '+this.value);
            if(oldValue>30)
            {
                var player = new Player('pinball1.mp3');
                player.play(function(err, player){
                    //console.log('[app.js] play pinball1')
                });
                player.play();
                points += 50;
                console.log('[app.js] points are '+points);
                oldValue = this.value;
            }
            var interval2 = setInterval(function(){

                clearInterval(interval2);
                led8.off();
            }, 2000);
        }
        if(this.value>=30)
        {
            oldValue = this.value;
        }
    });

    var sensorPush = new five.Sensor("A1");
    var intervalPush = 0;
    var oldValuePush = 100;
    sensorPush.scale([0, 100]).on("read", function() {
        console.log('[app.js] SensorPush value is '+this.value);
        if(intervalPush==0){
            intervalPush = setInterval(function(e){
                //console.log('[app.js] light sensor value: '+self.value);
            },500);
        }
        if(this.value < 85){
            led8.on();
            //console.log('[app.js] this.value is '+this.value+' and oldvalue is '+oldValuePush);
            if(oldValuePush>85)
            {
                var player = new Player('pinball1.mp3');
                player.play(function(err, player){
                   // console.log('[app.js] play pinball1')
                });
                player.play();
                points += 50;
                console.log('[app.js] points are '+points);
                oldValuePush = this.value;

                if(rot>360)
                {
                    rot=0;
                }
                servo.to(rot);
                rot+=20;
            }
            var intervalPush2 = setInterval(function(){

                clearInterval(intervalPush2);
                led8.off();
            }, 2000);
        }
        if(this.value>=85)
        {
            oldValuePush = this.value;
        }
    });

    

    var contServo = new five.Servo(9);
    rot = 0;
    var contServoInterval = setInterval(function(){
        if(rot>360)
        {
            rot=0;
        }
        contServo.to(rot);
        rot+=359;
    }, 800);

    var contFan = new five.Servo(11);
    var contRot = 0;
    var contFanInterval = setInterval(function(){
        if(contRot>360)
        {
            contRot=0;
        }
        contFan.to(contRot);
        contRot+=359;
    }, 100);


    var pin = new five.Pin(4);
    pin.read(function(value) {
        //console.log("[app.js] value button is "+value);
        if(value == 1)
        {
            var player = new Player('pinball1.mp3');
            player.play(function(err, player){
                //console.log('[app.js] play pinball1')
            });
            player.play();
            points += 100;
            if(countTouched>2)
            {
                countTouched+=0;
                earthquakeActivated = true;


            }
            else
            {
                countTouched += 1;
            }



            console.log("[app.js] countTouched is "+countTouched);
            console.log("[app.js] your points are "+points);
        }
    });

    //veranderen naar andere pin
    /*var pinTilt = new five.Pin(4);
    pinTilt.read(function(value) {
        console.log("[app.js] value button is "+value);
        if(value == 1)
        {
            var player = new Player('pinball1.mp3');

            player.play(function(err, player){
                console.log('[app.js] play pinball1')
            });
            player.play();
            playerTwoPoints += 100;
            if(countTouched>2)
            {
                tiltCountTouched+=0;
                tiltActivated = true;


            }
            else
            {
                tiltCountTouched += 1;
            }
            console.log("[app.js] countTouched is "+tiltCountTouched);
            console.log("[app.js] your points are "+playerTwoPoints);
        }
    });*/

    var pinTwo = new five.Pin(2);
    pinTwo.read(function(value) {
        //console.log("[app.js] value button is "+value);
        if(value == 1)
        {
            playerTwoPoints += 100;
            var player = new Player('pinball1.mp3');
            player.play(function(err, player){
                //console.log('[app.js] play pinball1')
            });
            player.play();
            if(tiltCountTouched>2)
            {
                tiltCountTouched+=0;
                tiltActivated = true;
                //console.log('>>>>>>>>>> tiltActivated');

            }
            else
            {
                tiltCountTouched += 1;
            }
            console.log("[app.js] countTouched is "+tiltCountTouched);
            console.log("[app.js] your points are "+playerTwoPoints);
        }
    });

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

            for (var i = 0; i < frame.gestures.length; i++) {
                  var gesture = frame.gestures[i];

                  if (gesture.type == "swipe") {
                      //Classify swipe as either horizontal or vertical
                      var isHorizontal = Math.abs(gesture.direction[0]) > Math.abs(gesture.direction[1]);
                      //Classify as right-left or up-down
                      if(isHorizontal){
                          if(gesture.direction[0] > 0){
                              swipeDirection = "right";
                              if(earthquakeActivated)
                              {
                                var player = new Player('pinball2.mp3');

                                player.play(function(err, player){
                                    //console.log('[app.js] play pinball2')
                                });
                                player.play();
                                led8.on();
                                var gestureInterval = setInterval(function(){
                                    clearInterval(gestureInterval);
                                    led8.off();
                                }, 2000);
                                //console.log('[app.js] horizontal right');
                                earthquakeActivated = false;
                                countTouched = 0;
                              }
                          } else {
                              swipeDirection = "left";
                              if(earthquakeActivated)
                              {
                                var player = new Player('pinball2.mp3');

                                player.play(function(err, player){
                                    //console.log('[app.js] play pinball2')
                                });
                                player.play();
                                led8.on();
                                var gestureInterval = setInterval(function(){
                                    clearInterval(gestureInterval);
                                    led8.off();
                                }, 2000);
                                //console.log('[app.js] horizontal left');
                                earthquakeActivated = false;
                                countTouched = 0;
                              }
                          }
                      } else { //vertical
                          if(gesture.direction[1] > 0){
                              swipeDirection = "up";
                              if(earthquakeActivated)
                              {
                                var player = new Player('pinball2.mp3');

                                player.play(function(err, player){
                                    //console.log('[app.js] play pinball2')
                                });
                                player.play();
                                led8.on();
                                var gestureInterval = setInterval(function(){
                                    clearInterval(gestureInterval);
                                    led8.off();
                                }, 2000);
                                //console.log('[app.js] vertical up');
                                earthquakeActivated = false;
                                countTouched = 0;
                              }
                          } else {
                              swipeDirection = "down";
                              if(earthquakeActivated)
                              {
                                var player = new Player('pinball2.mp3');

                                player.play(function(err, player){
                                    //console.log('[app.js] play pinball2')
                                });
                                player.play();
                                led8.on();
                                var gestureInterval = setInterval(function(){
                                    clearInterval(gestureInterval);
                                    led8.off();
                                }, 2000);
                                //console.log('[app.js] vertical down');
                                earthquakeActivated = false;

                                countTouched = 0;
                              }
                          }
                      }
                   }
                 }
        }
    })
});

/* ---> kopieren naar godserver  <--- */
if(godFrame)
{
    Leap.loop({enableGestures: true},
        function(godFrame)
        {
            var gestures = frame.godFrame,
            circle,
            pointable,
            direction,
            normal;

            //niet uit commentaar halen indien niet nodig
            //console.log('[app.js] >>>> gestures');


            if(gestures.length > 0) {

            for (var i = 0; i < godFrame.gestures.length; i++) {
                  var gesture = godFrame.gestures[i];


                 if (gesture.type == "swipe") {
                      //Classify swipe as either horizontal or vertical
                        //console.log('tiltActivated >>>>>> swipe');
                      var isHorizontal = Math.abs(gesture.direction[0]) > Math.abs(gesture.direction[1]);
                      //Classify as right-left or up-down

                      if(isHorizontal){
                          if(gesture.direction[0] > 0){
                              swipeDirection = "right";
                              if(tiltActivated)
                              {
                                var player = new Player('pinball2.mp3');

                                player.play(function(err, player){
                                   // console.log('[app.js] play pinball2')
                                });
                                player.play();
                                led8.on();
                                var gestureInterval = setInterval(function(){
                                    clearInterval(gestureInterval);
                                    led8.off();
                                }, 2000);
                                //console.log('[app.js] horizontal right');
                                tiltActivated = false;
                                tiltCountTouched = 0;
                              }
                          } else {
                              swipeDirection = "left";
                              if(tiltActivated)
                              {
                                var player = new Player('pinball2.mp3');

                                player.play(function(err, player){
                                    //console.log('[app.js] play pinball2')
                                });
                                player.play();
                                led8.on();
                                var gestureInterval = setInterval(function(){
                                    clearInterval(gestureInterval);
                                    led8.off();
                                }, 2000);
                                //console.log('[app.js] horizontal left');
                                tiltActivated = false;
                                tiltCountTouched = 0;
                              }
                          } 
                      }
                      else{
                         if(gesture.direction[1] > 0){
                         var player = new Player('pinball2.mp3');

                        player.play(function(err, player){
                            //console.log('[app.js] play pinball2')
                        });
                        player.play();
                        led8.on();
                        var gestureInterval = setInterval(function(){
                            clearInterval(gestureInterval);
                            led8.off();
                        }, 2000);
                        //console.log('[app.js] horizontal right');
                        tiltActivated = false;
                        tiltCountTouched = 0;
                    }
                      }
                  }
              }
          }
      });


}


//receive data from other server
/*sock.connect('tcp://'+playerIp+':'+currentServerPort);
console.log('[app.js] satan server: worker connected to port:'+currentServerPort);

sock.on('message', function(msg){
    //client connection
    leapMotionDataReceived++;
    //console.log('[app.js] satan server: received data: %s', msg.toString()+' '+leapMotionDataReceived);
    io.sockets.emit('message', "leap motion data received: "+leapMotionDataReceived);
});*/


//connect to opponent server
/*client.on('connect', function(){
    console.log('[app.js] server satan connected to opponent server');

    //connect to client
    io.sockets.on('connection', function (socket) {
        //catch client events
        socket.on('client', function(data) {
            console.log('clientserver data', data);
            //send data to opponent server
            client.emit('server custom event', { my: 'data' });
        });
    });
});*/


server.listen(currentServerPort);

