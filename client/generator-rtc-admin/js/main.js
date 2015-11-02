"use strict";
var simplewebrtc = require('simplewebrtc');
var uuid = require('node-uuid');
var roomID = uuid.v4();
var roomname = document.getElementById('roomname');

var webrtc = new simplewebrtc({
	localVideoEl: 'localVideo',
	autoRequestMedia: true
});

webrtc.on('readyToCall', function (id) {
	roomname.textContent = "http://" + window.location.host + "/generators/rtc?room=" + roomID + '&id=' + id;
	webrtc.joinRoom(roomID);
});
