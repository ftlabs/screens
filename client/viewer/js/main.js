/* eslint-env browser */
'use strict';

const Viewer = require('ftlabs-screens-viewer');
const Carousel = require('ftlabs-screens-carousel');
const host = location.origin;

function viewerIsRunningInElectron() {
	return (navigator.userAgent.indexOf('Electron') > 0 && navigator.userAgent.indexOf('FTLabs-Screens') > 0);
}

const storage = {
	setItem : function(storageKey, data, callback){

		const info = localStorage.setItem(storageKey, JSON.stringify(data) );
		callback(info);
		
	},
	getItem : function(storageKey, callback){

		const info = localStorage.getItem(storageKey);
		
		if(info === null){
			callback(null);
		} else {
			callback( JSON.parse( info ) );				
		}
		
	} 
}

// Called by the script loader once the page has loaded
window.screensInit = function screensInit() {

	const viewer = new Viewer(host, storage);
	
	const DOM = {
		container: document.getElementById('container'),
		Iframe : document.querySelector('iframe'),
	};
	let carousel;

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

	if (viewerIsRunningInElectron()) {
		switchOutIframeForWebview();
	}

	function updateUrl(url) {
		DOM.Iframe.style.pointerEvents = 'none';
		DOM.Iframe.src = url;
	}

	DOM.container.addEventListener('click', function () {
		DOM.Iframe.style.pointerEvents = 'auto';
	});

	// The url has changed
	viewer.on('change', function(url) {

		if (carousel) {
			// stop timers
			carousel.destroy();
			carousel = null;
		}

		if (Carousel.isCarousel(url)) {
			carousel = new Carousel(url, host);
			carousel.on('change', updateUrl);
			DOM.Iframe.src = carousel.getCurrentURL();
		} else {
			updateUrl(url);
		}
	});

	viewer.on('id-change', function () {
		updateTitle();
		updateIDs();
	});

	// A reload has been forced
	viewer.on('reload', () => DOM.Iframe.src = DOM.Iframe.src);

	// E.g. The viewer has started but cannot connected to the server.
	viewer.on('not-connected', () => {
		DOM.container.classList.add('state-disconnected');
	});

	viewer.on('ready', function(e){
		setInterval(function () {
			updateTitle();
			updateIDs();
			DOM.container.classList.toggle('state-disconnected', !viewer.ready());
			DOM.container.classList.remove('state-active', 'state-hello', 'state-loading');
			DOM.container.classList.add(viewer.getUrl() ? 'state-active' : (viewer.ready() ? 'state-hello' : 'state-loading'));
		}, 1000);
	});
	
	viewer.start();	
	
};

// Initialise Origami components when the page has loaded
if (document.readyState === 'interactive' || document.readyState === 'complete') {
	document.dispatchEvent(new CustomEvent('o.DOMContentLoaded'));
}

document.addEventListener('DOMContentLoaded', function() {

	// Dispatch a custom event that will tell all required modules to initialise
	document.dispatchEvent(new CustomEvent('o.DOMContentLoaded'));
});
