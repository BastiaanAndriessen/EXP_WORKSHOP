$(document).ready(init);

var interval;
var score1 = 0;
var currentScore1 = 0;
var score2 = 0;
var currentScore2 = 0;

function init()
{
    console.log('[client.js] god client init');
    var socket = io.connect(':1337');

    socket.on('update', function(data){
        if(score1 < data['score1']){
            clearInterval(interval);
            score1 = parseFloat(data['score1']);
            console.log('[client.js] score 1: '+score1);
            setScoreInterval($('#score_satan_num'), currentScore1, score1);
        }
        score2 = data['score2'];
        //$('#score_satan_num').text(score1);
        $('#score_god_num').text(score2);
    });


}

function setScoreInterval(el, currentScore, score){
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
    }, 100);
}