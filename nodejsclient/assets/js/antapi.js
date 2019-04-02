var wsURL = "wss://10.6.1.136/WebRTCAppEE/websocket";
var application = "webrtc";
var wsConnection = null;
var localUser = null;
var localVideo = null;
var peerConnectionConfig = {'iceServers': []};
var localStream = null;
var peerConnections = [];
var players = [];


/*
* Browser get User Media
* */
navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
window.RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
window.RTCIceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.webkitRTCIceCandidate;
window.RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription;

/*
* Browser get User Media
* */


function openCameraAndMicrophone() {

    localVideo = document.getElementById('localVideo');

    var constraints =
        {
            video: true,
            audio: true,
        };

    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia(constraints).then(getUserMediaSuccess).catch(errorHandler);
        newAPI = false;
    } else if (navigator.getUserMedia) {
        navigator.getUserMedia(constraints, getUserMediaSuccess, errorHandler);
    } else {
        alert('Your browser does not support getUserMedia API');
    }
}

/*
* GET USER MEDIA CALL THIS WITH STREAM
* */
function getUserMediaSuccess(stream) {
    console.log("getUserMediaSuccess: " + stream);
    localStream = stream;
    try {
        localVideo.srcObject = stream;
    } catch (error) {
        localVideo.src = window.URL.createObjectURL(stream);
    }
    connectWebSocket(wsURL).then(function (wsConnectionFrom) {

        let jsCmd = {
            command: "publish",
            streamId: localUser,
            token: null,
            video: true,
            audio: true
        };
        listenWebSocketEvents();
        wsConnection.send(JSON.stringify(jsCmd));


    });
}
/*
* CREATING PEER CONNECTION AND CREATE OFFER
* LISTENING LOCAL ICE CANDIDATE WITH ONICECANDIDATE
* ADD LOCAL STREAM TO THE PEERCONNECTION STREAM
* CREATE OFFER
* */
function startPublishing(streamId) {
    peerConnections[streamId] = new RTCPeerConnection(peerConnectionConfig);
    peerConnections[streamId].onicecandidate = localIceCandidate;

    peerConnections[streamId].addStream(localStream);
    peerConnections[streamId].createOffer(gotLocalDescription, errorHandler);
}

function errorHandler(error) {
    console.log(error);
}


/*
*
* Connect AntMedia WebSocket
*
* */

function connectWebSocket(url) {
    return new Promise(function (resolve, reject) {
        if (wsConnection == null || wsConnection.readyState != 1) {
            console.log("NO WEBSOCKET WE GONNA GENERATE NEW ONE")
            wsConnection = new WebSocket(url);
            wsConnection.binaryType = 'arraybuffer';

            wsConnection.onopen = function () {
                console.log("WS CONNECTION OPENED");
                resolve(wsConnection);
            }
        } else {
            console.log("USING EXISTING WS");
            resolve(wsConnection);
        }
    })


}

function listenWebSocketEvents() {

    wsConnection.onclose = function (evt) {
        console.log("WS CONNECTION CLOSED onclose", evt);

    };
    wsConnection.onerror = function (evt) {
        console.log("WS CONNECTION ERROR onerror", evt);

    };

    wsConnection.onmessage = function (evt) {
        console.log("Ant Web Socket Response : " + evt.data);

        var msgJSON = JSON.parse(evt.data);

        // AFTER PUBLISH REQUEST SENT TO ANT, IT WILL SEND start COMMAND ( PUBLISH )
        if (msgJSON.command == "start") {
            startPublishing(msgJSON.streamId);
        }
        // AFTER SENDING TAKECONFIGURATION OFFER ( GET LOCAL STREAM ) SERVER ANSWER THIS WITH TAKE CONFIGURATION COMMAND + ANSWER ( PUBLISH )

        if (msgJSON.command == "takeConfiguration" && msgJSON.type == "answer") {
            peerConnections[localUser].setRemoteDescription(new RTCSessionDescription({
                sdp: msgJSON["sdp"],
                type: msgJSON["type"]
            }), function () {

            }, errorHandler);
        }

        // AFTER PLAY REQUEST SENT TO ANT, IT WILL SEND takeconfiguration command with type offer ( PUBLISH )
        if (msgJSON.command == "takeConfiguration" && msgJSON.type == "offer") {
            var remStreamName = msgJSON.streamId;
            var remSessionId = "";
            players[remStreamName].plSetRemoteDescription(new RTCSessionDescription({
                sdp: msgJSON["sdp"],
                type: msgJSON["type"]
            }), remSessionId);
        }

        // WHILE TRYING TO PUBLISH AND PLAY, THE SERVER SEND ITS ICECANDIDATE TO THE CLIENT  ( PLAY / PUBLISH )
        if (msgJSON.command == "takeCandidate") {
            iceFromServerToPeer(msgJSON.streamId, msgJSON.candidate, msgJSON.label);
        }

    }
}


function gotLocalDescription(description) {

    console.log('gotLocalDescription: ' + JSON.stringify({'sdp': description}));

    peerConnections[localUser].setLocalDescription(description, function () {

        let jsCmd = {
            command: "takeConfiguration",
            streamId: localUser,
            type: description.type,
            sdp: description.sdp

        };

        wsConnection.send(JSON.stringify(jsCmd));

    }, function () {
        console.log('set description error')
    });

}

function localIceCandidate(event) {
    if (event.candidate != null) {
        console.log('localIceCandidate: ' + JSON.stringify({'ice': event.candidate}));
        let jsCmd = {
            command: "takeCandidate",
            streamId: localUser,
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate
        };
        wsConnection.send(JSON.stringify(jsCmd));
    }
}

function iceFromServerToPeer(peer, candidate, label) {
    console.log("ICE FROM SERVER BEFORE STREAM START", candidate);


    var iceCandidate = new RTCIceCandidate({
        sdpMLineIndex: label,
        candidate: candidate
    });
    if (peer == localUser) {
        peerConnections[peer].addIceCandidate(iceCandidate);
    } else {
        players[peer].addIceCandidate(iceCandidate);
    }


}


/*
* START PLAYING
*
* */


function startPlay(streamName) {

    players[streamName] = new Player(streamName);

    connectWebSocket(wsURL).then(function (connectWebSocketResponse) {

        listenWebSocketEvents();

        players[streamName].sendPlayOffer(streamName);

    });


}

function closeStream(videoTag) {
    if (players[videoTag]) {
        players[videoTag].stop();
        delete players[videoTag];
    }
}

function Player(streamName) {

    var remoteVideo = document.getElementById(streamName);
    var peerConnectionReady = false;
    var iceCandidatesList = [];


    var remPeerConnection = new RTCPeerConnection(peerConnectionConfig);
    remPeerConnection.onicecandidate = localToRemoteIceCandidate;
    remPeerConnection.onaddstream = gotRemoteStream;

    this.sendPlayOffer = sendPlayGetOffer;
    this.plSetRemoteDescription = plSetRemoteDescription;
    this.addIceCandidate = addIceCandidate;
    this.stop = stopStream;


    function stopStream() {
        remPeerConnection.close();
    }
    /*
    * Check if peerConnection ready
    * */
    function addIceCandidate(candidate) {
        if (peerConnectionReady) {
            remPeerConnection.addIceCandidate(candidate);
        } else {
            iceCandidatesList.push(candidate);
        }

    }


    function plSetRemoteDescription(sdp, sessionId) {
        remPeerConnection.setRemoteDescription(sdp).then(function () {
            peerConnectionReady = true;

            for (var i = 0; i < iceCandidatesList.length; i++) {
                addIceCandidate(iceCandidatesList[i]);
            }
            iceCandidatesList = [];
            return remPeerConnection.createAnswer();
        })
            .then(function (answerResult) {
                return remPeerConnection.setLocalDescription(answerResult)
                    .then(function () {
                        var jsCmd = {
                            command: "takeConfiguration",
                            streamId: streamName,
                            type: answerResult.type,
                            sdp: answerResult.sdp
                        };

                        wsConnection.send(JSON.stringify(jsCmd));

                    });
            })

    }

    function localToRemoteIceCandidate(event) {
        if (event.candidate != null) {
            let jsCmd = {
                command: "takeCandidate",
                streamId: streamName,
                label: event.candidate.sdpMLineIndex,
                id: event.candidate.sdpMid,
                candidate: event.candidate.candidate
            };
            wsConnection.send(JSON.stringify(jsCmd));
        }
    }
    function gotRemoteStream(event) {

        console.log('gotRemoteStream', event.stream);

        try {
            remoteVideo.srcObject = event.stream;
        } catch (error) {
            remoteVideo.src = window.URL.createObjectURL(event.stream);
        }

    }

    function sendPlayGetOffer(streamName) {

        var jsCmd =
            {
                command: "play",
                streamId: streamName,
                token: null,
            }


        wsConnection.send(JSON.stringify(jsCmd));

    }


}
