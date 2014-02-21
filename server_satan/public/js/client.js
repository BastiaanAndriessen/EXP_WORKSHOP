$(document).ready(init);

var socket;
var interval, interval2;
var boardReady = false;
var connectedToServer = false;

var score1 = 0;
var currentScore1 = 0;
var abilities1 = 0;

var score2 = 0;
var currentScore2 = 0;
var abilities2 = 0;

function init()
{
    socket = io.connect(':1336');

    socket.on('BOARD_READY', function(data){
        if(!boardReady){
            boardReady = true;
            $('#board_status').removeClass('red').removeClass('green').addClass('green').text('arduino status: connected');
        }
    });

    socket.on('CONNECTED', function(data){
        if(!connectedToServer){
            connectedToServer = true;
            $('#server_status').removeClass('red').removeClass('green').addClass('green').text('connection status: connected');
        }
    });

    socket.on('DISCONNECT', function(data){
        console.log('[client.js] disconnected to opponent server');
        connectedToServer = false;
        $('#server_status').removeClass('green').removeClass('red').addClass('red').text('connection status: disconnected');
    });

    socket.on('GOD_DATA', function(data){
        if(!connectedToServer){
            connectedToServer = true;
            $('#server_status').removeClass('red').removeClass('green').addClass('green').text('connection status: connected');
        }

        if(score1 < data['score1']){
            score1 = parseFloat(data['score1']);
            setScoreInterval($('#score_satan_num'), currentScore1, score1, interval);
        }

        if(score2 < data['score2']){
            score2 = parseFloat(data['score2']);
            setScoreInterval($('#score_god_num'), currentScore2, score2, interval2);
        }

        abilities1 = data['abilities1'];
        abilities2 = data['abilities2'];
        updateAbilities();
    });
}

function updateAbilities(){
    console.log('[client.js] updateAbilities');

    switch(abilities1){
        case 1:
            $('#score_satan .ability_1').removeClass('default_inactive').addClass('default_active');
            break;
        case 2:
            $('#score_satan .ability_1').removeClass('default_inactive').addClass('default_active');
            $('#score_satan .ability_2').removeClass('default_inactive').addClass('default_active');
            break;
        case 3:
            $('#score_satan .ability_1').removeClass('default_inactive').addClass('default_active');
            $('#score_satan .ability_2').removeClass('default_inactive').addClass('default_active');
            $('#score_satan .ability_3').removeClass('default_inactive').addClass('default_active');
            break;
        case 4:
            $('#score_satan .ability_1').removeClass('default_inactive').addClass('default_active');
            $('#score_satan .ability_2').removeClass('default_inactive').addClass('default_active');
            $('#score_satan .ability_3').removeClass('default_inactive').addClass('default_active');
            $('#score_satan .ability_4').removeClass('gold_inactive').addClass('gold_active');
            break;
    }

    switch(abilities2){
        case 1:
            $('#score_god .ability_1').removeClass('default_inactive').addClass('default_active');
            break;
        case 2:
            $('#score_god .ability_1').removeClass('default_inactive').addClass('default_active');
            $('#score_god .ability_2').removeClass('default_inactive').addClass('default_active');
            break;
        case 3:
            $('#score_god .ability_1').removeClass('default_inactive').addClass('default_active');
            $('#score_god .ability_2').removeClass('default_inactive').addClass('default_active');
            $('#score_god .ability_3').removeClass('default_inactive').addClass('default_active');
            break;
        case 4:
            $('#score_god .ability_1').removeClass('default_inactive').addClass('default_active');
            $('#score_god .ability_2').removeClass('default_inactive').addClass('default_active');
            $('#score_god .ability_3').removeClass('default_inactive').addClass('default_active');
            $('#score_god .ability_4').removeClass('gold_inactive').addClass('gold_active');
            break;
    }
}

function setScoreInterval(el, currentScore, score, interval){
    clearInterval(interval);
    interval = setInterval(function(){
        if(currentScore == score){
            clearInterval(interval);
            el.text(score);
        }else{
            console.log(currentScore);
            if(Math.floor((score-currentScore)/10000000000) > 0){
                currentScore+=10000000000;
            }else if(Math.floor((score-currentScore)/1000000000) > 0){
                currentScore+=1000000000;
            }else if(Math.floor((score-currentScore)/100000000) > 0){
                currentScore+=100000000;
            }else if(Math.floor((score-currentScore)/10000000) > 0){
                currentScore+=10000000;
            }else if(Math.floor((score-currentScore)/1000000) > 0){
                currentScore+=1000000;
            }else if(Math.floor((score-currentScore)/100000) > 0){
                currentScore+=100000;
            }else if(Math.floor((score-currentScore)/10000) > 0){
                currentScore+=10000;
            }else if(Math.floor((score-currentScore)/1000) > 0){
                currentScore+=1000;
            }else if(Math.floor((score-currentScore)/100) > 0){
                currentScore+=100;
            }else if(Math.floor((score-currentScore)/10) > 0){
                currentScore+=10;
            }else if(Math.floor((score-currentScore)/1) > 0){
                currentScore+=1;
            }
            el.text(currentScore);
        }
    }, 50);
}