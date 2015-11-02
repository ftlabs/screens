/* global console*/
'use strict';

var viewer = require('./viewer.js');
var port = location.port ? ':'+location.port : '';
var socket = require('socket.io-client')('//'+location.hostname+port+'/screens');

console.log("Initialising socket.io...");

socket.on('connect', function() {
	viewer.setConnectionState(true);
});

socket.on('disconnect', function() {
	socket.io.reconnect();
	viewer.setConnectionState(false);
});

socket.on("heartbeat",function() {
	setTimeout(function() {
		socket.emit("heartbeat");
	}, 3000);
});

socket.on('reload', function(){
	window.location.reload();
});

socket.on('requestUpdate', function() {
	viewer.setConnectionState(true);
	syncUp();
});

socket.on('update', function(data){
	console.log("Received update", data.items.length, data);
	viewer.setConnectionState(true);
	viewer.update(data);
});

function syncUp() {
	var storedData = viewer.getData();
	console.log("Sending update", storedData.items.length, storedData);
	socket.emit('update', storedData);
}

// Called by the script loader
window.screensInit = function() {
	var name = viewer.getData('name') || viewer.getData('id');
	document.title = name + ' : FT Screens';

	if (viewer.isElectron()) {
		viewer.useWebview();
	}

	viewer.onChange(syncUp);
};

// Initialise Origami components when the page has loaded
if (document.readyState === 'interactive' || document.readyState === 'complete') {
	document.dispatchEvent(new CustomEvent('o.DOMContentLoaded'));
}

document.addEventListener('DOMContentLoaded', function() {
	// Dispatch a custom event that will tell all required modules to initialise
	document.dispatchEvent(new CustomEvent('o.DOMContentLoaded'));
});
