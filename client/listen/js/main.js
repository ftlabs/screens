'use strict';
var frequencySettings = require('../../common/js/frequencies.js');
var sonic = require('sonic-net');
var sCoder = new sonic.coder(frequencySettings);
var sListener = new sonic.server({
	debug: true,
	coder : sCoder,
	timeout : 750
});

function unpackTransmission(data){

	var dataLength = parseInt(data.slice(0,1)),
		transmittedId = data.slice(1, data.length).replace('-', "");

	console.log(dataLength, transmittedId);

	if(transmittedId.length === dataLength){
		return transmittedId;
	} else {
		return null;
	}

}

console.log(sListener);
sListener.start();
sListener.on('message', function(message){
	console.log("MESSAGE:", message);

	detected.innerHTML = unpackTransmission(message);

	// console.log(unpackTransmission(message));

	setTimeout(function(){
		detected.innerHTML = "";
	}, 2500);

});

