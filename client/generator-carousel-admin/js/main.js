/* eslint-env browser */
const default_url = 'https://en.wikipedia.org/wiki/Financial_Times';
const default_duration = 10;

let keyUpTimeout;
let tableBody;
let templateInputBox;

function removeRow(e) {
	let row;
	if(e.target.className === 'remove') {
		row = e.currentTarget;
		row.removeEventListener('click', removeRow);
		tableBody.removeChild(row);
	}
	checkAndAddMoreForms();
}

function appendNewInputToForm(n){
	let newRow;
	for (let i = 0,l = n||1; i<l; i++) {
		newRow = templateInputBox.cloneNode(true);
		tableBody.appendChild(newRow);
		newRow.addEventListener('click', removeRow);
	}
	return newRow;
}

function allInputsHaveContent(inputs){
	keyUpTimeout = null;

	let numberOfInputsWithContent = 0;

	for(let f = 0; f < inputs.length; f += 1){

		if(inputs[f].value !== ''){
			numberOfInputsWithContent += 1;
		}

	}

	if(numberOfInputsWithContent === inputs.length){
		return true;
	} else {
		return false;
	}

}

function parseParams( paramsString ) {
	const params = [];
	let tmp = [];
	paramsString.split('&')
		.forEach(function(item) {
			tmp = item.split('=');
			params.push( [tmp[0], decodeURIComponent(tmp[1])] );
		});
	return params;
}

function getTitleAndFrames( params ) {
	const urls = [];
	const durations_of_urls = {};
	let title = 'no title specified';

	params.forEach(function(param) {
		if (param[0] === 'u') {
			urls.push(param[1]);
		} else if (param[0] === 'd') {
			durations_of_urls[ urls.slice(-1) ] = param[1];
		} else if (param[0] === 'title') {
			title = param[1];
		}
	});

	let frames = urls.map(function(url) {
		let duration = parseInt(durations_of_urls[url]);
		duration = isNaN(duration)? default_duration : duration;
		return [url, duration];
	});
	// .filter(function(pair) {return (pair[0] !== ');});

	if (frames.length === 0) {
		frames = [ [default_url, default_duration] ];
	}

	return {
		title:  title,
		frames: frames
	};
}

function getNextEmptySlot() {
	const inputFields = Array.prototype.slice.call(tableBody.querySelectorAll('.url-and-duration'));
	let i;
	let l;
	let field;

	for (i=0, l=inputFields.length; i<l; i++) {
		field = inputFields[i];
		if (field.querySelector('input[type=\'url\']').value === '') return field;
	}
	return appendNewInputToForm();
}

function populateFields( titleAndFrames ) {
	const title = titleAndFrames['title'];
	const frames = titleAndFrames['frames'];
	const numGivenFrames = frames.length;
	let url;
	let duration;
	let inputField;

	document.querySelector('.title-form-item').value = title;

	for (let j = 0; j < numGivenFrames; j++) {
		url = frames[j][0];
		duration = frames[j][1];
		inputField = getNextEmptySlot().querySelectorAll('input');

		if(url !== ''){
			inputField[0].value = url;
			inputField[1].value = duration;
		}
	}
}

function unpackCarousel(url) {
	let params;
	let titleAndFrames;

	// example carousel url: http://localhost:3010/generators/carousel?title=Wikipedia%20and%20Labs&u=http%3A%2F%2Fen.wikipedia.org%2Fwiki%2FThomas_Robert_Malthus&d=3&u=http%3A%2F%2Fftlabs-six-degrees.herokuapp.com%2Fgraph.html&d=20&u=http%3A%2F%2Flabs.ft.com&d=3&u=&d=&u=&d=&u=&d=&u=&d=&u=&d=&u=&d=&u=&d=
	if (url.match(/\/generators\/carousel\?/)) {
		params = parseParams( url.split('?')[1] );
		titleAndFrames = getTitleAndFrames( params );
		populateFields( titleAndFrames );
	}
}

function findCopyFrom() {
	let copyFrom = '';
	location.search.substr(1).split('&')
		.forEach(function(item) {
			const paramPair = item.split('=');
			if (paramPair[0] === 'copyfrom') {
				copyFrom = decodeURIComponent(paramPair[1]);
			}
		});
	return copyFrom;
}

function generateLinkForViewer(carouselForm){
	let link = window.location.origin + window.location.pathname + '?';
	const inputFieldsNodeList = carouselForm.querySelectorAll('input');
	const inputFieldsArray = Array.prototype.slice.call(inputFieldsNodeList, 0);

	link += inputFieldsArray.map(function(f){
		return [f.name, encodeURIComponent(f.value)].join('=');
	}).join('&');

	return link;
}

function checkAndAddMoreForms() {

	if(allInputsHaveContent(tableBody.querySelectorAll('input[type=url]') ) ){

		appendNewInputToForm();

	}
}

document.addEventListener('DOMContentLoaded', function ready() {

	// Prevent listeners being added multiple times with multiple DOM Content Loads
	if (document.ready) return;
	document.ready = true;

	tableBody = document.getElementsByTagName('tbody')[0];
	templateInputBox = tableBody.getElementsByClassName('url-and-duration')[0];
	tableBody.removeChild(templateInputBox);
	appendNewInputToForm(3);


	// check for an example carousel being pasted in
	// first unpack the copyFrom param (if it exists), then wait for a paste event
	const copyFrom = findCopyFrom();
	if (copyFrom !== '') {
		unpackCarousel( copyFrom );
	}

	// When it is pasted in populate the rows
	document.getElementById('templateCarousel')
		.addEventListener('input', function(e) {
			e.preventDefault();
			e.stopPropagation();
			unpackCarousel(e.target.value);
		});

	// check for the submit of a carousel being generated
	const carouselForm = document.getElementById('carouselForm');
	// carouselForm[0].focus();

	carouselForm.addEventListener('submit', function(e){
		e.preventDefault();
		const outputLink = generateLinkForViewer(carouselForm);
		const linkOutput = document.getElementById('linkOutput');

		linkOutput.textContent = outputLink;
		linkOutput.setAttribute('href', outputLink);
		linkOutput.setAttribute('target', '_blank');

	}, false);

	carouselForm.addEventListener('keyup', function(){

		clearTimeout(keyUpTimeout);
		keyUpTimeout = setTimeout(checkAndAddMoreForms, 200);

	}, false);

});
