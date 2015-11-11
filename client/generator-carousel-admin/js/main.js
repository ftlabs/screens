'use strict';
var transformUrl     = require('../../common/js/urls');
var default_url      = 'https://en.wikipedia.org/wiki/Financial_Times';
var default_duration = 10;
var default_url = "https://en.wikipedia.org/wiki/Static_web_page";

var keyUpTimeout = null,
	table = undefined;

function appendNewInputToForm(where){

	var existingInput = table.getElementsByClassName('url-and-duration')[1],
		clone = existingInput.cloneNode(true),
		inputs = clone.getElementsByTagName('input');

	for(var g = 0; g < inputs.length; g += 1){
		inputs[g].value = "";
	}

	table.appendChild(clone);

}

function allInputsHaveContent(inputs){
	keyUpTimeout = null;

	var numberOfInputsWithContent = 0;

	for(var f = 0; f < inputs.length; f += 1){

		if(inputs[f].value !== ""){
			numberOfInputsWithContent += 1
		}

	}

	if(numberOfInputsWithContent === inputs.length){
		return true;
	} else {
		return false;
	}

}

function parseParams( paramsString ) {
	var params = [];
	var tmp = [];
	paramsString.split("&")
		.forEach(function(item) {
			tmp = item.split("=");
			params.push( [tmp[0], decodeURIComponent(tmp[1])] );
		});
	return params;
}

function getTitleAndFrames( params ) {
	var urls = [];
	var durations_of_urls = {};
	var title = "no title specified";

	params.forEach(function(param) {
		if (param[0] === "u") {
			urls.push(param[1]);
		} else if (param[0] === "d") {
			durations_of_urls[ urls.slice(-1) ] = param[1];
		} else if (param[0] === "title") {
			title = param[1];
		}
	});

	var frames = urls.map(function(url) {
		var duration = parseInt(durations_of_urls[url]);
		duration = isNaN(duration)? default_duration : duration;
		return [url, duration];
	})
	.filter(function(pair) {return (pair[0] !== "");});

	if (frames.length === 0) {
		frames = [ [default_url, default_duration] ];
	}

	return {
		title:  title,
		frames: frames
	};
}

function populateFields( titleAndFrames ) {
	var title             = titleAndFrames['title'];
	var frames            = titleAndFrames['frames'];
	var inputFields       = document.getElementById('carouselForm').querySelectorAll('input');
	var numGivenFrames    = frames.length;
	var numInputFrames    = Math.round( inputFields.length / 2 );
	var numCopiableFrames = Math.min( numGivenFrames, numInputFrames );
	var url, duration;

	// inputFields = [title, url, duration, url, duration, ...]

	// clear the fields before we inject new content into them
	if (numCopiableFrames !== 0) {
		for (var i = 0; i < inputFields.length; i++) {
			inputFields[i].value = "";
		}
	}

	// don't forget the first input is the title

	inputFields[0].value = title;

	for (var j = 0; j < numGivenFrames; j++) {
		url      = frames[j][0];
		duration = frames[j][1];


		if(inputFields[1 + (2 * j)] === undefined){
			appendNewInputToForm(table);
			inputFields = document.getElementById('carouselForm').querySelectorAll('input');
		}

		inputFields[1 + (2 * j)    ].value = url;
		inputFields[1 + (2 * j) + 1].value = duration;
	}
}

function unpackCarousel(url) {
	var params, titleAndFrames;

	// example carousel url: http://localhost:3010/generators/carousel?title=Wikipedia%20and%20Labs&u=http%3A%2F%2Fen.wikipedia.org%2Fwiki%2FThomas_Robert_Malthus&d=3&u=http%3A%2F%2Fftlabs-six-degrees.herokuapp.com%2Fgraph.html&d=20&u=http%3A%2F%2Flabs.ft.com&d=3&u=&d=&u=&d=&u=&d=&u=&d=&u=&d=&u=&d=&u=&d=
	if (url.match(/\/generators\/carousel\?/)) {
		params         = parseParams( url.split("?")[1] );
		titleAndFrames = getTitleAndFrames( params );
		populateFields( titleAndFrames );
	}
}

function findCopyFrom() {
	var copyFrom = "";
	location.search.substr(1).split("&")
		.forEach(function(item) {
			var paramPair = item.split("=");
			if (paramPair[0] === 'copyfrom') {
				copyFrom = decodeURIComponent(paramPair[1]);
			}
		});
	return copyFrom;
}

function generateLinkForViewer(carouselForm){
	var link                = window.location.origin + window.location.pathname + "?";
	var inputFieldsNodeList = carouselForm.querySelectorAll('input');
    var inputFieldsArray    = Array.prototype.slice.call(inputFieldsNodeList, 0);

	link += inputFieldsArray.map(function(f){
		return [f.name, encodeURIComponent(f.value)].join('=');
	}).join('&');

	return link;
}

document.addEventListener("DOMContentLoaded", function() {
	// check for an example carousel being pasted in
	// first unpack the copyFrom param (if it exists), then wait for a paste event

	table = document.getElementsByTagName('table')[0];

	debugger;

	var copyFrom = findCopyFrom();
	if (copyFrom !== "") {
		unpackCarousel( copyFrom );
	}

	document.getElementById('templateCarousel')
		.addEventListener("input", function(e) {
			e.preventDefault();
			e.stopPropagation();
			unpackCarousel(e.target.value);
		});

	// check for the submit of a carousel being generated

	var carouselForm = document.getElementById('carouselForm');
	// carouselForm[0].focus();

	carouselForm.addEventListener('submit', function(e){
		e.preventDefault();
		var outputLink = generateLinkForViewer(carouselForm);
		var linkOutput = document.getElementById('linkOutput');

		linkOutput.textContent = outputLink;
		linkOutput.setAttribute('href', outputLink);
		linkOutput.setAttribute('target', '_blank');

	}, false);

});

window.addEventListener('keyup', function(){

	clearTimeout(keyUpTimeout);
	keyUpTimeout = setTimeout(function(){

		if(allInputsHaveContent(table.querySelectorAll('input[type=url]') ) ){

			appendNewInputToForm(table);

		}

	}, 200);

}, false);