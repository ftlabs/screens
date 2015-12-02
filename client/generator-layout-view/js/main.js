/* eslint-env browser */
/* global console */
'use strict';
const parseQueryString = require('query-string').parse;

const params = parseQueryString(window.location.search);

const heightsAndWidths = /\[(.+)\]/.exec( params.layout )[1].split(',').map(function(v){return parseNonNegativeInt(v);});
const urls = [params.H, params.L, params.R, params.F];

const transforms = urls.map(function(url){
	let promise;

	if (url === '') {
		promise = Promise.resolve('');
	} else {
		const url_to_request_transform = window.location.origin + '/api/transformUrl/' + encodeURIComponent(url);

		promise = fetch(url_to_request_transform)
			.then(function(response){
				return response.text();
			}).then(function(transformed_url){
				console.log('transforms: from url=', url, ' to transformed_url=', transformed_url );
				return transformed_url;
			})
			;
	}

	return promise;
});

Promise.all(transforms)
	.then(function(transformedUrls){
	const layoutDiv = generateFullLayout(heightsAndWidths, transformedUrls);
	document.body.appendChild(layoutDiv);
	});

//------- functions

function parseNonNegativeInt( val ){
	return Math.max( parseInt(val,10) || 0, 0);
}

function generateFullLayout( heightsAndWidths, urls ) {
	const fullWidth = 100;
	const fullHeight = 100;

	// all heights and widths should be non -ve ints
	let headerHeight = heightsAndWidths[0];
	let leftHeight = heightsAndWidths[1];
	let leftWidth = heightsAndWidths[2];
	let footerHeight = heightsAndWidths[3];

	let rightWidth;

	const headerUrl = urls[0] || '';
	const leftUrl = urls[1] || '';
	const rightUrl = urls[2] || '';
	const footerUrl = urls[3] || '';

	// dont forget to formatUrl these ^^^

	const div = createDiv(fullHeight, fullWidth);

	const sumHeights = headerHeight + leftHeight + footerHeight;

	if(sumHeights > 100) {
		headerHeight = Math.trunc(100 * headerHeight / sumHeights);
		leftHeight = Math.trunc(100 * leftHeight / sumHeights);
		footerHeight = Math.trunc(100 * footerHeight / sumHeights);
	}

	if (headerHeight > 0 && headerUrl !== '') {
		const hCell = createCell(headerUrl, headerHeight, fullWidth);
		div.appendChild( hCell );
	}

	if (leftUrl !== '' && leftHeight > 0) {

		if (rightUrl === '') {
			leftWidth = 100;
			rightWidth = 0;
		}

		const sumWidths = leftWidth + rightWidth;
		if (sumWidths > 100) {
			leftWidth = Math.trunc(100 * leftWidth / sumWidths);
			rightWidth = Math.trunc(100 * rightWidth / sumWidths);
		} else if (leftWidth < 100) {
			rightWidth = 100 - leftWidth;
		}

		const leftRightDiv = createDiv(leftHeight, fullWidth);
		const leftCell = createCell(leftUrl, fullHeight, leftWidth);
		leftRightDiv.appendChild(leftCell);
		if (rightUrl !== '' && rightWidth > 0) {
			const rightCell = createCell(rightUrl, fullHeight, rightWidth);
			leftRightDiv.appendChild(rightCell);
		}

		div.appendChild( leftRightDiv );
	}

	if (footerHeight > 0 && footerUrl !== '') {
		const fCell = createCell(footerUrl, footerHeight, fullWidth);
		div.appendChild( fCell );
	}

	return div;
}

function createCell(url, height, width) {
	const div = createDiv(height, width);
	const iframe = createIframe(url);
	div.appendChild(iframe);
	return div;
}

function createDiv(height, width) {
	const div = document.createElement('div');
	div.style.height = height + '%';
	div.style.width = width + '%';
	return div;
}

function createIframe(url) {
	const iframe = document.createElement('iframe');
	iframe.frameBorder = '0';
	iframe.src = url;
	iframe.style.height = '100%';
	iframe.style.width = '100%';
	return iframe;
}
