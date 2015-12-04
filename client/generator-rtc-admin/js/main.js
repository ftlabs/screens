/* eslint-env browser */
/* global SimpleWebRTC */
const uuid = require('node-uuid');
const roomID = uuid.v4();
const roomname = document.getElementById('roomname');

const webrtc = new SimpleWebRTC({
	localVideoEl: 'localVideo',
	autoRequestMedia: true
});

webrtc.on('readyToCall', function (id) {
	roomname.textContent = 'http://' + window.location.host + '/generators/rtc?room=' + roomID + '&id=' + id;
	webrtc.joinRoom(roomID);
});
