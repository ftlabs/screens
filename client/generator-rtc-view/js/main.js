"use strict";

var simplewebrtc = require('simplewebrtc');
var parseQueryString = require('query-string').parse;
var parameters = parseQueryString(window.location.search);

var roomID = parameters.room;
var broadcasterID = parameters.id;

var webrtc = new simplewebrtc({
	remoteVideosEl: '',
	autoRequestMedia: false
});

webrtc.joinRoom(roomID);

webrtc.on('videoAdded', function (video, peer) {
	if (peer.id === broadcasterID) {
		var remotes = document.getElementById('remoteVideos');
		var container = document.createElement('div');
		container.appendChild(video);

		// suppress contextmenu
		video.oncontextmenu = function () { return false; };
		remotes.appendChild(container);
	}
});
