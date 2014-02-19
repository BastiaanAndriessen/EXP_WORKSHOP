var currentServerPort = 1337;
var opponentServerPort = 1336;
var ip = "172.30.27.176";

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

var webSocket = require('ws');
var ws = new webSocket('ws://127.0.0.1:6437');

app.use(express.static(__dirname + '/public'));
app.get('localhost:'+currentServerPort, function(req, res){
    ip = req.header('x-forwarded-for') || req.connection.remoteAddress;
    console.log('[app.js] server god. requested root');
    res.sendfile(__dirname + '/public/index.html');
});

//client connection
var clientio = require('socket.io-client');
console.log('[app.js] server god: satan server http://'+ip+':'+opponentServerPort);
var client = clientio.connect('http://'+ip+':'+opponentServerPort);

client.on('connect', function(){
    console.log('[app.js] server god connected to opponent server');

    ws.on('message', function(data, flags){
        console.log('[app.js] server god. received leap data. Sending data to other server: '+Math.round(Math.random()*100)/100);
        //send data to other server
        client.emit('LEAP_DATA', data);
    });

    /*setInterval(function(e){
        client.emit('LEAP_DATA', { my: 'data from interval: '+Math.round(Math.random()*100)/100 });
    }, 3000);*/

    client.on('GOD_DATA', function(data){
        console.log('[app.js] server god. received score data: '+data);
    });
});

server.listen(currentServerPort);