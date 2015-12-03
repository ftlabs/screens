/* eslint-env browser */
/* global SimpleWebRTC*/
const parseQueryString = require('query-string').parse;
const parameters = parseQueryString(window.location.search);

const roomID = parameters.room;
const broadcasterID = parameters.id;

const webrtc = new SimpleWebRTC({
	remoteVideosEl: '',
	autoRequestMedia: false
});

webrtc.joinRoom(roomID);

webrtc.on('videoAdded', function (video, peer) {
	if (peer.id === broadcasterID) {
		const remotes = document.getElementById('remoteVideos');
		const container = document.createElement('div');
		container.appendChild(video);

		// suppress contextmenu
		video.oncontextmenu = function () { return false; };
		remotes.appendChild(container);
	}
});
