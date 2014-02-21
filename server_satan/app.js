var currentServerPort = 1336;
var ip = "172.30.33.186";

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
var webSocket = require('ws'), ws = new webSocket('ws://127.0.0.1:6437');

//audio control
var Speaker = require('speaker');
var Player = require('player');

//arduino control vars
var five = require('johnny-five'),
    board = new five.Board(),
    led6, led7, led8, led12, led13, frame, rot = 0,
    rightEnabled, leftEnabled, godLeftEnabled, godRightEnabled;
//leap vars
var Leap = require('leapjs');
var controller = new Leap.Controller({enableGestures: true});
var godFrame;

//game related vars
var earthquakeActivated = false, countTouched = 0, points = 0;
var tiltActivated = false, tiltCountTouched = 0, playerTwoPoints = 0;

var abilities1 = 0;
var abilities2 = 0;
var isTiltActive = false;

var isCooldownTilt = false;
var isCooldownEarthquake = false;

var vulcanoActivated;
var waterActivated;

app.use(express.static(__dirname + '/public'));
console.log('[app.js] satan: get path http://'+ip+':'+currentServerPort);
app.get('http://'+ip+':'+currentServerPort, function(req, res){
    res.sendfile(__dirname + '/public/index.html');
});

//code arduino en leap
board.on('ready', function() {


    //server
    io.sockets.on('connection', function (socket){
        updateScores(socket);

        led6 = new five.Led(6);
        led7 = new five.Led(7);
        led8 = new five.Led(8);
        led12 = new five.Led(12);
        led13 = new five.Led(13);

        var servo = new five.Servo({
            pin: 10
        });

        var sensor = new five.Sensor("A0");
        var interval = 0;
        var oldValue = 100;

        var sensorPush = new five.Sensor("A1");
        var intervalPush = 0;
        var oldValuePush = 100;

        var contServo = new five.Servo(9);
        var rot = 0;
        var contServoInterval = setInterval(function(){
            if(rot>360){rot=0;}
            contServo.to(rot);
            rot+=359;
        }, 800);

        var contFan = new five.Servo(11);
        var contRot = 0;
        var contFanInterval = setInterval(function(){
            if(contRot>360){contRot=0;}
            contFan.to(contRot);
            contRot+=359;
        }, 100);

        //input vars
        var pin = new five.Pin(4);
        var pinTwo = new five.Pin(2);

        console.log('[app.js] satan server. connection established.');
        io.sockets.emit('CONNECTED', 'connected');

        socket.on('disconnect', function(){
            console.log(">>>>> disconnect");
            led6.off();
            led6.off();
            led8.off();
            led12.off();
            led13.off();
            contRot = 0;
            rot = 0;
            clearInterval(contFanInterval);
            clearInterval(contServoInterval);
            servo.stop();
            contServo.stop();
            contFan.stop();
            console.log('[app.js] god server disconnected to opponent server');
            io.sockets.emit('DISCONNECT', 'disconnect');

        });

        socket.on('LEAP_DATA', function (data) {
            godFrame = JSON.parse(data);
            var godRightHandId = 0;
            var godLeftHandId = 0;

            if(godFrame.hands.length && godFrame.hands.length>0){
                if(godFrame.hands.length < 2){
                    godRightHandId = godFrame.hands[0].id;
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
            if(data == 'true'){
                console.log('[app.js] satan server. >>>>> TRUE');
                if(tiltActivated){
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
                    updateScores(socket);
                }
            }
        });

        //receive leap motion data
        ws.on('message', function(data, flags) {
            frame = JSON.parse(data);
            if(isTiltActive == false){
                var rightHandId = 0;
                var leftHandId = 0;
                if(frame.hands.length>0){
                    if(frame.hands.length < 2){
                        rightHandId = frame.hands[0].id;
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
                    var player = new Player('pinball3.mp3');

                    player.play(function(err, player){
                        //console.log('[app.js] play pinball3')
                    });
                    player.play();
                }else if(rightHandId == 0){
                    led13.off();
                    rightEnabled = false;
                }
            }

        });

        //lightsensor
        sensor.scale([0, 100]).on("read", function(){
            if(interval==0){
                interval = setInterval(function(e){
                    //console.log('[app.js] light sensor value: '+self.value);
                },500);
            }
            if(this.value < 30){
                led8.on();
                if(oldValue>30){
                    var player = new Player('pinball1.mp3');
                    player.play(function(err, player){
                        //console.log('[app.js] play pinball1')
                    });
                    player.play();
                    if(waterActivated){
                        points += 275;
                    }else{
                        points += 35;
                    }
                    console.log('[app.js] points are '+points);
                    oldValue = this.value;
                    updateScores(socket);
                }
                var interval2 = setInterval(function(){
                    updateScores(socket);
                    clearInterval(interval2);
                    led8.off();
                }, 2000);
            }
            if(this.value>=30){
                oldValue = this.value;
            }
        });

        //druksensor
        sensorPush.scale([0, 100]).on("read", function() {
            //console.log('[app.js] SensorPush value is '+this.value);
            if(intervalPush==0){
                intervalPush = setInterval(function(e){
                    //console.log('[app.js] light sensor value: '+self.value);
                },500);
            }
            if(this.value < 85){
                led8.on();
                //console.log('[app.js] this.value is '+this.value+' and oldvalue is '+oldValuePush);
                if(oldValuePush>85){
                    var player = new Player('pinball1.mp3');
                    player.play(function(err, player){
                        //console.log('[app.js] play pinball1')
                    });
                    player.play();
                    if(vulcanoActivated){
                        playerTwoPoints += 275;
                    }else{
                        playerTwoPoints += 35;
                    }
                    console.log('[app.js] points are '+playerTwoPoints);
                    oldValuePush = this.value;
                    updateScores(socket);
                    if(rot>360){
                        rot=0;
                    }
                    servo.to(rot);
                    rot+=20;
                }
                var intervalPush2 = setInterval(function(){
                    updateScores(socket);
                    clearInterval(intervalPush2);
                    led8.off();
                }, 2000);
            }
            if(this.value>=85){
                oldValuePush = this.value;
            }
        });

        pin.read(function(value){
            if(value == 1){
                var player = new Player('pinball1.mp3');
                player.play(function(err, player){
                    //console.log('[app.js] play pinball1')
                });
                player.play();
                points += 125;
                updateScores(socket);
                if(countTouched<4){
                    abilities1 += 1;
                    countTouched += 1;
                    if(countTouched == 4){earthquakeActivated = true;}
                    if(countTouched == 1){vulcanoActivated = true;}
                    updateScores(socket);
                }else{
                    abilities1 += 0;
                    countTouched += 0;
                }
                console.log("[app.js] satan countTouched: "+countTouched+". satan score:"+points);
            }
        });

        pinTwo.read(function(value) {
            if(value == 1){
                playerTwoPoints += 125;
                updateScores(socket);
                var player = new Player('pinball1.mp3');
                player.play(function(err, player){
                    //console.log('[app.js] play pinball1')
                });
                player.play();
                if(tiltCountTouched < 4){
                    abilities2 += 1;
                    tiltCountTouched += 1;
                    if(tiltCountTouched == 4){tiltActivated = true;}
                    if(tiltCountTouched == 2){waterActivated = true;}
                    updateScores(socket);
                }else{
                    tiltCountTouched += 0;
                    abilities2 += 0;
                }
                console.log("[app.js] god countTouched: "+tiltCountTouched+". god score:"+playerTwoPoints);
            }
        });

        Leap.loop({enableGestures: true},function(frame){
            var gestures = frame.gestures,
            circle,
            pointable,
            direction,
            normal;

            if(isTiltActive == false){
                if(gestures.length > 0){
                    for(var i = 0; i < frame.gestures.length; i++){
                        var gesture = frame.gestures[i];
                        if(gesture.type == "swipe") {
                            //Classify swipe as either horizontal or vertical
                            var isHorizontal = Math.abs(gesture.direction[0]) > Math.abs(gesture.direction[1]);
                            //Classify as right-left or up-down
                            if(isHorizontal){
                                if(gesture.direction[0] > 0){
                                    swipeDirection = "right";
                                    if(earthquakeActivated){
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
                                        earthquakeActivated = false;
                                        countTouched = 0;
                                        updateScores(socket);

                                        isCooldownEarthquake = true;
                                        var cooldownInterval = setInterval(function(){
                                            clearInterval(cooldownInterval);
                                            isCooldownEarthquake = false;
                                            console.log('[app.js] cooldown false'+isCooldownEarthquake);
                                        }, 10000);
                                    }
                                } else {
                                    swipeDirection = "left";
                                    if(earthquakeActivated){
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
                                        earthquakeActivated = false;
                                        countTouched = 0;
                                        updateScores(socket);

                                        isCooldownEarthquake = true;
                                        var cooldownInterval = setInterval(function(){
                                            clearInterval(cooldownInterval);
                                            isCooldownEarthquake = false;
                                            console.log('[app.js] cooldown false'+isCooldownEarthquake);
                                        }, 10000);
                                    }
                                }
                            } else { //vertical
                                if(gesture.direction[1] > 0){
                                    swipeDirection = "up";
                                    if(earthquakeActivated){
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
                                        earthquakeActivated = false;
                                        countTouched = 0;

                                        updateScores(socket);

                                        isCooldownEarthquake = true;
                                        var cooldownInterval = setInterval(function(){
                                            clearInterval(cooldownInterval);
                                            isCooldownEarthquake = false;
                                            console.log('[app.js] cooldown false'+isCooldownEarthquake);
                                        }, 10000);
                                    }
                                } else {
                                    swipeDirection = "down";
                                    if(earthquakeActivated){
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
                                        earthquakeActivated = false;

                                        countTouched = 0;
                                        updateScores(socket);

                                        isCooldownEarthquake = true;
                                        var cooldownInterval = setInterval(function(){
                                            clearInterval(cooldownInterval);
                                            isCooldownEarthquake = false;
                                            console.log('[app.js] cooldown false'+isCooldownEarthquake);
                                        }, 10000);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })
    });

    if(godFrame){
        Leap.loop({enableGestures: true},function(godFrame){
            var gestures = frame.godFrame,
            circle,
            pointable,
            direction,
            normal;

            if(gestures.length > 0){
                for(var i = 0; i < godFrame.gestures.length; i++) {
                    var gesture = godFrame.gestures[i];

                    if(gesture.type == "swipe"){
                        //Classify swipe as either horizontal or vertical
                        var isHorizontal = Math.abs(gesture.direction[0]) > Math.abs(gesture.direction[1]);
                        //Classify as right-left or up-down

                        if(isHorizontal){
                            if(gesture.direction[0] > 0){
                                swipeDirection = "right";
                                if(tiltActivated){
                                    var player = new Player('pinball2.mp3');
                                    player.play(function(err, player){
                                       // console.log('[app.js] play pinball2')
                                    });
                                    player.play();
                                    led8.on();
                                    isTiltActive = true;
                                    var gestureInterval = setInterval(function(){
                                        clearInterval(gestureInterval);
                                        led8.off();
                                        isTiltActive = false;
                                    }, 6000);
                                    tiltActivated = false;
                                    tiltCountTouched = 0;
                                    updateScores(socket);

                                    isCooldownTilt = true;
                                    var cooldownInterval = setInterval(function(){
                                        clearInterval(cooldownInterval);
                                        isCooldownTilt = false;
                                    }, 10000);
                                }
                            }else{
                                swipeDirection = "left";
                                if(tiltActivated){
                                    var player = new Player('pinball2.mp3');
                                    player.play(function(err, player){
                                        //console.log('[app.js] play pinball2')
                                    });
                                    player.play(socket);
                                    led8.on();
                                    var gestureInterval = setInterval(function(){
                                        clearInterval(gestureInterval);
                                        led8.off();
                                    }, 2000);
                                    //console.log('[app.js] horizontal left');
                                    tiltActivated = false;
                                    tiltCountTouched = 0;
                                    updateScores(socket);

                                    isCooldownTilt = true;
                                    var cooldownInterval = setInterval(function(){
                                        clearInterval(cooldownInterval);
                                        isCooldownTilt = false;
                                    }, 10000);
                                }
                            }
                        }else{
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
                                tiltActivated = false;
                                tiltCountTouched = 0;
                                updateScores(socket);

                                isCooldownTilt = true;
                                var cooldownInterval = setInterval(function(){
                                    clearInterval(cooldownInterval);
                                    isCooldownTilt = false;
                                }, 10000);
                            }
                        }
                    }
                }
            }
        });
    }
});


function updateScores(socket)
{
    console.log('satan server. send score data to opponent server: '+points+' // '+playerTwoPoints+' // '+abilities1+' // '+abilities2);
    //socket.emit('GOD_DATA', {"score1":points ,"score2": playerTwoPoints, "score2": playerTwoPoints, "abilities1": abilities1, "abilities2":abilities2});
    io.sockets.emit('GOD_DATA', {"score1":points ,"score2": playerTwoPoints, "score2": playerTwoPoints, "abilities1": abilities1, "abilities2":abilities2});
}


server.listen(currentServerPort);
