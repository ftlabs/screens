'use strict';
var parseQueryString = require('query-string').parse;
var isUrl = require('is-url-superb');
var	fetch = require('node-fetch');

var params = parseQueryString(window.location.search);

var heightsAndWidths = /\[(.+)\]/.exec( params.layout )[1].split(',').map(function(v){return parseNonNegativeInt(v);});
var urls = [params.H, params.L, params.R, params.F];

var transforms = urls.map(function(url){
	var promise;

	if (url === "") {
		promise = Promise.resolve("");
	} else {
		var url_to_request_transform = window.location.origin + '/api/transformUrl/' + encodeURIComponent(url);

		promise = fetch(url_to_request_transform)
			.then(function(response){
				return response.text();
			}).then(function(transformed_url){
				console.log("transforms: from url=", url, " to transformed_url=", transformed_url );
				return transformed_url;
			})
			;
	}

	return promise;
});

Promise.all(transforms)
	.then(function(transformedUrls){
	var layoutDiv = generateFullLayout(heightsAndWidths, transformedUrls);
	document.body.appendChild(layoutDiv);
	});

//------- functions

function parseNonNegativeInt( val ){
	return Math.max( parseInt(val,10) || 0, 0);
}

function generateFullLayout( heightsAndWidths, urls ) {
	var fullWidth    = 100;
	var fullHeight   = 100;

	// all heights and widths should be non -ve ints
	var headerHeight = heightsAndWidths[0];
	var leftHeight   = heightsAndWidths[1];
	var leftWidth    = heightsAndWidths[2];
	var footerHeight = heightsAndWidths[3];

	var rightWidth;

	var headerUrl = urls[0] || "";
	var leftUrl   = urls[1] || "";
	var rightUrl  = urls[2] || "";
	var footerUrl = urls[3] || "";

	// dont forget to formatUrl these ^^^

	var div = createDiv(fullHeight, fullWidth);

	var sumHeights = headerHeight + leftHeight + footerHeight;

	if(sumHeights > 100) {
		headerHeight = Math.trunc(100 * headerHeight / sumHeights);
		leftHeight   = Math.trunc(100 * leftHeight   / sumHeights);
		footerHeight = Math.trunc(100 * footerHeight / sumHeights);
	}

	if (headerHeight > 0 && headerUrl !== "") {
		var hCell = createCell(headerUrl, headerHeight, fullWidth);
		div.appendChild( hCell );
	}

	if (leftUrl !== "" && leftHeight > 0) {

		if (rightUrl === "") {
			leftWidth  = 100;
			rightWidth = 0;
		}

		var sumWidths = leftWidth + rightWidth;
		if (sumWidths > 100) {
			leftWidth  = Math.trunc(100 * leftWidth  / sumWidths);
			rightWidth = Math.trunc(100 * rightWidth / sumWidths);
		} else if (leftWidth < 100) {
			rightWidth = 100 - leftWidth;
		}

		var leftRightDiv = createDiv(leftHeight, fullWidth);
		var leftCell = createCell(leftUrl, fullHeight, leftWidth);
		leftRightDiv.appendChild(leftCell);
		if (rightUrl !== "" && rightWidth > 0) {
			var rightCell = createCell(rightUrl, fullHeight, rightWidth);
			leftRightDiv.appendChild(rightCell);
		}

		div.appendChild( leftRightDiv );
	}

	if (footerHeight > 0 && footerUrl !== "") {
		var fCell = createCell(footerUrl, footerHeight, fullWidth);
		div.appendChild( fCell );
	}

	return div;
}

function createCell(url, height, width) {
	var div = createDiv(height, width);
	var iframe = createIframe(url);
	div.appendChild(iframe);
	return div;
}

function createDiv(height, width) {
	var div = document.createElement('div');
	div.style.height = height + "%";
	div.style.width  = width + '%';
	return div;
}

function createIframe(url) {
	var iframe = document.createElement('iframe');
	iframe.frameBorder = '0';
	iframe.src = url;
	iframe.style.height = "100%";
	iframe.style.width = "100%";
	return iframe;
}