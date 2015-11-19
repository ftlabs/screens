/* global console */
'use strict';
var	fetch = require('node-fetch');
var default_duration = 10;
var default_url = "https://en.wikipedia.org/wiki/Static_web_page";

function checkIfViewerIsRunningInElectron(){
	return (navigator.userAgent.indexOf('Electron') > 0 && navigator.userAgent.indexOf('FTLabs-Screens') > 0);
}

function parseParams() {
	var params = [];
	var tmp = [];
	location.search.substr(1).split("&")
		.forEach(function(item) {
			tmp = item.split("=");
			params.push( [tmp[0], decodeURIComponent(tmp[1])] );
		});
	return params;
}

function getPanels() {
	var params = parseParams();
	var panels = [];
	var current_url = null;
	var name, val, duration;

	// looking for d= and u=

	params.forEach(function(param) {
		name = param[0];
		val  = param[1];
		if (name === "d") {
			if (current_url !== null) {
				duration = parseInt(val,10);
				duration = isNaN(duration)? default_duration : duration;
				panels.push([current_url, duration]);
				current_url = null;
			}
		} else if(name === "u") {
			if (current_url !== null) {
				panels.push([current_url, default_duration]);
			}

			current_url = (val !== "")? val : null;
		}
	});
	
	if (current_url !== null) {
		panels.push([current_url, default_duration]);
	}

	// ensure we have at least one url to display
	if (panels.length === 0) {
		panels = [ [default_url, default_duration] ];
	}

	// don't forget to transform each url: url = transformUrl(url, window.location.host)

	return panels;
}

function changeFrame(panels, i) {
	var url, duration, panel;
	if (i >= panels.length) { i = 0; }
	panel    = panels[i];
	url      = panel[0];
	duration = panel[1] * 1000;
	console.log("changeFrame: i=" + i + ", duration=" + duration + ", url=" + url);
	document.getElementById('frame').src = url;
	setTimeout(changeFrame, duration, panels, i+1);
}

// and here we actually invoke it

var panels = getPanels();
console.log("panels=", panels);

var transforms = panels.map(function(panel){
	var url      = panel[0];
	var duration = panel[1];

	var url_to_request_transform = window.location.origin + '/api/transformUrl/' + encodeURIComponent(url);

	return fetch(url_to_request_transform)
			.then(function(response){
				return response.text();
			}).then(function(transformed_url){
				return [transformed_url, duration];
			})
			;
});

Promise.all(transforms)
	.then(function(tfmd_panels){

		var frame = document.createElement( checkIfViewerIsRunningInElectron() ? "webview" : "iframe" );
		frame.id = 'frame';
		document.body.appendChild(frame);

		changeFrame(tfmd_panels, 0);
	});
