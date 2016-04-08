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
};

// Called by the script loader once the page has loaded
window.screensInit = function screensInit() {

	const viewer = new Viewer(host, storage);

	const DOM = {
		container: document.getElementById('container'),
		Iframe1: document.querySelector('iframe.first'),
		Iframe2: document.querySelector('iframe.second')
	};
	let carousel;

	function switchOutIframeForWebview() {

		const webViewElement1 = document.createElement('webview');
		const webViewElement2 = document.createElement('webview');

		webViewElement1.setAttribute('class', DOM.Iframe1.getAttribute('class'));
		webViewElement2.setAttribute('class', DOM.Iframe2.getAttribute('class'));

		DOM.Iframe1.parentNode.removeChild(DOM.Iframe1);
		DOM.Iframe2.parentNode.removeChild(DOM.Iframe2);
		DOM.Iframe1 = webViewElement1;
		DOM.Iframe2 = webViewElement2;

		DOM.container.appendChild(DOM.Iframe1);
		DOM.container.appendChild(DOM.Iframe2);

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

	function iframeLoaded() {
		const currentActive = document.querySelector('iframe.active');
		if (currentActive) kickOutIframe(currentActive);
		this.classList.remove('buffering');
		this.classList.add('active');
		this.removeEventListener('load', iframeLoaded);
	}

	function kickOutIframe(iframe) {
		iframe.classList.remove('active');
		iframe.classList.remove('buffering');
		iframe.classList.add('done');
		setTimeout(() => iframe.src = 'about:blank', 500);
		iframe.removeEventListener('load', iframeLoaded);

		// remove self from the list
		usedIframes.splice(usedIframes.indexOf(iframe), 1);
	}

	function prepareIframetoLoad(iframe, url) {
		usedIframes.push(iframe);
		iframe.classList.add('buffering');
		iframe.classList.remove('done');
		iframe.src = url;
		iframe.addEventListener('load', iframeLoaded);
	}

	const availableIframes = [
		DOM.Iframe1,
		DOM.Iframe2
	];
	const usedIframes = [
		DOM.Iframe1
	];
	function updateUrl(url) {
		if (!url) {
			return;
		}

		DOM.Iframe1.style.pointerEvents = 'none';
		DOM.Iframe2.style.pointerEvents = 'none';

		// another url has been added
		if (usedIframes.length < availableIframes.length) {
			const nextIframe = availableIframes.filter(iframe => usedIframes.indexOf(iframe) === -1)[0];
			prepareIframetoLoad(nextIframe, url);
			return;
		}

		// a third has been added kick up the first one so the next one can load
		if (usedIframes.length === availableIframes.length) {
			const next = usedIframes[0];
			kickOutIframe(next);
			prepareIframetoLoad(next, url);

			// load the next iframe regardless
			iframeLoaded.bind(usedIframes[0])();
			return;
		}
	}

	DOM.container.addEventListener('click', function () {
		DOM.Iframe1.style.pointerEvents = 'auto';
		DOM.Iframe2.style.pointerEvents = 'auto';
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
			updateUrl(carousel.getCurrentURL());
		} else {
			updateUrl(url);
		}
	});

	viewer.on('id-change', function () {
		updateTitle();
		updateIDs();
	});

	// A reload has been forced
	viewer.on('reload', () => {
		DOM.Iframe1.src = DOM.Iframe1.src;
		DOM.Iframe2.src = DOM.Iframe2.src;
	});

	// E.g. The viewer has started but cannot connected to the server.
	viewer.on('not-connected', () => {
		DOM.container.classList.add('state-disconnected');
	});

	viewer.on('ready', function(){
		setInterval(function () {
			updateTitle();
			updateIDs();
			DOM.container.classList.toggle('state-disconnected', !viewer.ready());
			DOM.container.classList.remove('state-active', 'state-hello', 'state-loading');

			let state;

			if (viewer.getUrl()){
				state = 'state-active';
			} else if(viewer.ready()){
				state = 'state-hello';
			} else {
				state = 'state-loading';
			}

			DOM.container.classList.add(state);

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
