/* global console */
/* eslint-env browser */
const default_duration = 10;
const default_url = 'https://en.wikipedia.org/wiki/Static_web_page';

function parseParams() {
	const params = [];

	const urlParams = location.search.substr(1).split('&');

	for(let x = 1; x < urlParams.length; x += 2){

		const u = urlParams[x].split('=');
		const d = urlParams[x + 1].split('=');

		if (u[1] !== '') {
			console.log(decodeURIComponent(u[1]));

			params.push({
				u : decodeURIComponent(u[1]),
				d : decodeURIComponent(d[1])
			});

		}

	}

	return params;
}

function getPanels() {
	const params = parseParams();
	let panels = [];
	const current_url = null;

	params.forEach(function(param) {

		panels.push([param.u, param.d]);

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
	let url;
	let duration;
	let panel;
	if (i >= panels.length) { i = 0; }
	panel = panels[i];
	url = panel[0];
	duration = panel[1] * 1000;
	console.log('changeFrame: i=' + i + ', duration=' + duration + ', url=' + url);
	document.getElementById('frame').src = url;
	setTimeout(changeFrame, duration, panels, i+1);
}

// and here we actually invoke it

const panels = getPanels();
console.log('panels=', panels);

const transforms = panels.map(function(panel){
	const url = panel[0];
	const duration = panel[1];

	const url_to_request_transform = window.location.origin + '/api/transformUrl/' + encodeURIComponent(url);

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
		const iframe = document.createElement('iframe');
		iframe.id = 'frame';
		document.body.appendChild(iframe);

		changeFrame(tfmd_panels, 0);
	});
