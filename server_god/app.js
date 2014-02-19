var currentServerPort = 1337;
var opponentServerPort = 1336;
var ip = "172.30.33.178";

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var webSocket = require('ws');
var ws = new webSocket('ws://127.0.0.1:6437');

app.use(express.static(__dirname + '/public'));
app.get(ip+':'+currentServerPort, function(req, res){
    res.sendfile(__dirname + '/public/index.html');
});

//client connection
var clientio = require('socket.io-client');
console.log('[app.js] server god: satan server http://'+ip+':'+opponentServerPort);
var client = clientio.connect('http://'+ip+':'+opponentServerPort);

client.on('connect', function(){
    console.log('[app.js] server god connected to opponent server');

    ws.on('message', function(data, flags) {
        frame = JSON.parse(data);
        //console.log('[app.js] server god. received leap data: '+frame+'. Sending data to other server');
        //send data to other server
        client.emit('LEAP_DATA', frame);
    });

    /*setInterval(function(e){
        client.emit('LEAP_DATA', { my: 'data from interval: '+Math.round(Math.random()*100)/100 });
    }, 3000);*/

    client.on('GOD_DATA', function(data){
<<<<<<< HEAD
        console.log('[app.js] server god. received score data '+data);
=======
        console.log('[app.js] server god. received score data: '+data);
>>>>>>> 1141a74941e7ba0de09c974f30f2e2ad4661340f
    });
});

server.listen(currentServerPort);

