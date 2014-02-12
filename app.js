var webSocket = require('ws'),
    ws = new webSocket('ws://127.0.0.1:6437'),
    five = require('johnny-five'),
    board = new five.Board(),
    led, frame;

board.on('ready', function() {
    led = new five.Led(13);
    ws.on('message', function(data, flags) {
        frame = JSON.parse(data);
        if (frame.hands && frame.hands.length > 1) {
            led.on();
        }
        else {
            led.off();
        }

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

        //controle
        console.log('[app.js] rightHandId: '+rightHandId+' leftHandId: '+leftHandId);

    });
});

