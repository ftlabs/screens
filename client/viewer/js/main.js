/* eslint-env browser */
'use strict';

const port = location.port ? ':'+location.port : '';
const host = '//'+location.hostname+port;

function viewerIsRunningInElectron() {
	return (navigator.userAgent.indexOf('Electron') > 0 && navigator.userAgent.indexOf('FTLabs-Screens') > 0);
}

// Called by the script loader once the page has loaded
window.screensInit = function() {

	const Viewer = require('ftlabs-screens-viewer');
	const viewer = new Viewer(host);
	const DOM = {
		container: document.getElementById('container'),
		Iframe : document.querySelector('iframe'),
	};

	function switchOutIframeForWebview() {

		const webViewElement = document.createElement('webview');

		webViewElement.setAttribute('class', DOM.Iframe.getAttribute('class'));

		DOM.Iframe.parentNode.removeChild(DOM.Iframe);
		DOM.Iframe = webViewElement;

		DOM.container.appendChild(DOM.Iframe);

	}

	function updateTitle() {
		const name = viewer.getData('name') || viewer.getData('id');
		document.title = name + ' : FT Screens';
	}

	function updateIDs() {
		[].slice.call(document.querySelectorAll('.screen-id')).forEach(function(el) {
			el.innerHTML = viewer.getData('id');
		});
	}

	updateTitle();

	if (viewerIsRunningInElectron()) {
		switchOutIframeForWebview();
	}

	setInterval(function () {
		updateTitle();
		updateIDs();
		DOM.container.classList.toggle('state-disconnected', !viewer.ready());
		DOM.container.classList.remove('state-active', 'state-hello', 'state-loading');
		DOM.container.classList.add(viewer.getUrl() ? 'state-active' : (viewer.ready() ? 'state-hello' : 'state-loading'));

	}, 1000);

	// The url has changed
	viewer.on('change', url => DOM.Iframe.src = url);

	// A reload has been forced
	viewer.on('reload', () => DOM.Iframe.src = DOM.Iframe.src);

	// E.g. The viewer has started but cannot connected to the server.
	viewer.on('not-connected', () => {
		DOM.container.classList.add('state-disconnected');
	});
};

// Initialise Origami components when the page has loaded
if (document.readyState === 'interactive' || document.readyState === 'complete') {
	document.dispatchEvent(new CustomEvent('o.DOMContentLoaded'));
}

document.addEventListener('DOMContentLoaded', function() {
	// Dispatch a custom event that will tell all required modules to initialise
	document.dispatchEvent(new CustomEvent('o.DOMContentLoaded'));
});
