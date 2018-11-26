$(document).ready(() => {
    $("#listUser").hide();
});

var room;

var usuario;
var sala;

var menbersOnline;

function colocarNomes() {
    const title = '<li class="list-group-item" style="background-color: #555; color: #fff">Usuário Conectados</li>';
    var childrens = title;

    for (var i = 0, max = menbersOnline.length; i < max; i++) {
        childrens += '<li class="list-group-item">' + menbersOnline[i].name + '</li>';
    }
    $('.list-group').html(childrens);
}

// when Bistri API client is ready, function
// "onBistriConferenceReady" is invoked
onBistriConferenceReady = function () {
    q("#prox").addEventListener("click", conectar);
}

$('#join').click(function (event) {
    usuario = $('#name').val();
    sala = $('#room_field').val();

    if (usuario != '') {
        $('#user').html('NOME: ' + usuario);
    } else {
        $('#user').html('NOME: SEGREDO!');
    }

    if (sala != null) {
        $('#nomeSala').html('SALA: ' + sala);
    } else {
        $('#nomeSala').html('SALA: ???');
    }
});

conectar = function () {
    var nome = document.getElementById("name").value;
    // test if the browser is WebRTC compatible
    if (!BistriConference.isCompatible()) {
        // if the browser is not compatible, display an alert
        alert("your browser is not WebRTC compatible !");
        // then stop the script execution
        return;
    }

    // initialize API client with application keys
    // if you don't have your own, you can get them at:
    // https://api.developers.bistri.com/login
    BistriConference.init({
        appId: "7a5eebc7",
        appKey: "4465c0d6fb1f64b3d870e90e93080b57",
        userName: nome
    });

    /* Set events handler */

    // when local user is connected to the server
    BistriConference.signaling.addHandler("onConnected", function () {
        // show pane with id "pane_1"
        showPanel("pane_1");
    });

    // when an error occured on the server side
    BistriConference.signaling.addHandler("onError", function (error) {
        // display an alert message
        alert(error.text + " (" + error.code + ")");
    });

    // when the user has joined a room
    BistriConference.signaling.addHandler("onJoinedRoom", function (data) {
        // set the current room name
        room = data.room;
        // ask the user to access to his webcam
        BistriConference.startStream("webcamSD", function (localStream) {
            // when webcam access has been granted
            // show pane with id "pane_2"
            showPanel("pane_2");
            // insert the local webcam stream into div#video_container node
            BistriConference.attachStream(localStream, q("#video_container"));
            // then, for every single members present in the room ...
            console.log(BistriConference)
            for (var i = 0, max = data.members.length; i < max; i++) {
                // ... request a call
                BistriConference.call(data.members[i].id, data.room);
                // $("#"+data.members[i].id).after( data.members[i].name );
                // console.log(data.members[i].name)
            }

            menbersOnline = data.members;
        });
        $("#listUser").show();

    });

    // when an error occurred while trying to join a room
    BistriConference.signaling.addHandler("onJoinRoomError", function (error) {
        // display an alert message
        alert(error.text + " (" + error.code + ")");

    });

    // when the local user has quitted the room
    BistriConference.signaling.addHandler("onQuittedRoom", function (room) {
        // show pane with id "pane_1"
        showPanel("pane_1");
        // stop the local stream
        BistriConference.stopStream();
        $("#listUser").hide();

    });

    // when a new remote stream is received
    BistriConference.streams.addHandler("onStreamAdded", function (remoteStream) {
        // insert the new remote stream into div#video_container node
        BistriConference.attachStream(remoteStream, q("#video_container"));
        colocarNomes();

    });

    // when a local or a remote stream has been stopped
    BistriConference.streams.addHandler("onStreamClosed", function (stream) {
        // remove the stream from the page
        BistriConference.detachStream(stream);
        
        colocarNomes();
        

    });

    // bind function "joinConference" to button "Join Conference Room"
    q("#join").addEventListener("click", joinConference);

    // bind function "quitConference" to button "Quit Conference Room"
    q("#quit").addEventListener("click", quitConference);

    // open a new session on the server
    BistriConference.connect();
    colocarNomes();

}

// when button "Join Conference Room" has been clicked
function joinConference() {
    var roomToJoin = q("#room_field").value;

    // if "Conference Name" field is not empty ...
    if (roomToJoin) {
        // ... join the room
        BistriConference.joinRoom(roomToJoin);
    }
    else {
        // otherwise, display an alert
        alert("você deve digitar um nome para sala!")
    }
}

// when button "Quit Conference Room" has been clicked
function quitConference() {
    $("#listUser").hide();

    // quit the current conference room
    BistriConference.quitRoom(room);

}

function showPanel(id) {
    var panes = document.querySelectorAll(".pane");
    // for all nodes matching the query ".pane"
    for (var i = 0, max = panes.length; i < max; i++) {
        // hide all nodes except the one to show
        panes[i].style.display = panes[i].id == id ? "inline-block" : "none";
    };
}

function q(query) {
    // return the DOM node matching the query
    return document.querySelector(query);
}

