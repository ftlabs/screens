/* global console*/
'use strict';

var viewer = require('./viewer.js');
var port = location.port ? ':'+location.port : '';
var socket = require('socket.io-client')('//'+location.hostname+port+'/screens');
var frequencySettings = require('../../common/js/frequencies.js');

var sonic = require("sonic-net");

var sCoder = new sonic.coder(frequencySettings);
var sEmitter = new sonic.socket({
	coder : sCoder, 
	charDuration : 0.2,
	maxGain : 2	
});

console.log(sonic, sCoder, sEmitter);

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

var transmit = (function(){

	var transmitting = false;

	function broadcastScreenId(viewerId){

		// The packagedScreenId
		// first byte is the length of the data.
		// The method used by sonic-net to transmit data does not allow for back to backg characters
		// so we pad them with a '-' which we remove when we recieve them

		// Example : id 9914
		// Would be padded as 49-914
		// If we don't get all of the characters on the recieving end, we ignore the data
		// Otherwise, we report it 

		if(transmitting){
			return false;
		}

		var packagedScreenId = "" + viewerId.length;

		console.log(packagedScreenId);

		for(var x = 0; x < viewerId.length; x += 1){

			packagedScreenId += viewerId[x];

			if(x < viewerId.length - 2){

				if(viewerId[x] === viewerId[x + 1]){
					packagedScreenId += "-";
				}

			}
			console.log(packagedScreenId);
			
		}

		transmitting = true;

		setInterval(function(){
			sEmitter.send(packagedScreenId);
		}, 5000);

	}

	return {
		id : broadcastScreenId
	}

})();


// Called by the script loader
window.screensInit = function() {
	var name = viewer.getData('name') || viewer.getData('id');
	document.title = name + ' : FT Screens';

	if (viewer.isElectron()) {
		viewer.useWebview();
	}


	transmit.id(viewer.getData('id').toString());

	console.log(transmit);

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
