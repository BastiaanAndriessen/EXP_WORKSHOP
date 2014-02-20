$(document).ready(init);

function init()
{
    var socket = io.connect(':1337');

    socket.on('message', function(data){
        updateMessageLog(data);
    });


}

function updateMessageLog(data){
    console.log('[clients.js] emitted message received: '+data);
    $('#received_messages').append('<p>'+data+'</p>');
    if($('#no_message').length > 0)$('#no_message').remove();
}