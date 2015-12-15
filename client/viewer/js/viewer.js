/* eslint-env browser */
const moment = require('moment');

const DOM = {
	container: document.getElementById('container'),
	Iframe : document.querySelector('iframe'),
};
const handlers = {
	change: []
};

const LSKEY = 'viewerData_v2';

const __client = (function(moment) {

	let data;
	let currentURL;

	function update(newdata) {
		debugger;
		const olddata = data;
		data = newdata;
		// If ID of this screen has changed, update the UI
		if (newdata.id && newdata.id !== olddata.id) {
			newdata.idUpdated = Date.now();
			populateIDs();
			updateTitle();
		}

		if(!olddata.idUpdated && !newdata.idUpdated){
			newdata.idUpdated = Date.now()
		}

		if (newdata.name && newdata.name !== olddata.name) {
			updateTitle();
		}

		if (!('items' in data)) data.items = [];

		data.items = data.items.sort((a, b) => moment(a.dateTimeSchedule, 'x').isBefore(moment(b.dateTimeSchedule, 'x')));

		localStorage.setItem(LSKEY, JSON.stringify(data));

		// document.cookie = "name=electrondata";
		// document.cookie = "path=/";
		document.cookie = 'electrondata=' + JSON.stringify(data);

	}

	function getData(key) {
		return key ? data[key] : data;
	}

	function setConnectionState(val) {
		DOM.container.classList.toggle('state-disconnected', !val);
	}

	function onChange(fn) {
		handlers.change.push(fn);
	}

	function removeActiveFlag () {
		data.items = data.items.map(item => {
			item.active = false;
			return item;
		});
	}

	function poll() {
		const count = data.items.length;
		let dirty = false;
		const date = new Date();
		date.setSeconds(0);
		date.setMilliseconds(0);

		data.items = data.items.filter(function(item) {
			return (!item.expires || (new Date(item.expires)) > (new Date()));
		});

		if (data.items < count) {
			dirty = true;
		}

		let nextItemIndex;
		const nextItem = data.items.find((item, index) => {
			nextItemIndex = index;
			return moment(item.dateTimeSchedule, 'x').isBefore(date) ||
				moment(item.dateTimeSchedule, 'x').isSame(date);
		});

		const newUrl = nextItem ? nextItem.url : undefined;

		if (!(Object.is(newUrl, currentURL))) {
			removeActiveFlag();
			if (newUrl) {
				data.items[nextItemIndex].active = true;
				currentURL = newUrl;
				DOM.Iframe.setAttribute('src', currentURL);
				dirty = true;
			} else {
				currentURL = undefined;
				DOM.Iframe.setAttribute('src', 'about:blank');
			}
		}

		DOM.container.classList.remove('state-active', 'state-hello', 'state-loading');
		DOM.container.classList.add(currentURL ? 'state-active' : (data.id ? 'state-hello' : 'state-loading'));

		if (dirty) {
			handlers.change.forEach(function(fn) { fn(); });
		}
	}

	function populateIDs() {
		[].slice.call(document.querySelectorAll('.screen-id')).forEach(function(el) {
			el.innerHTML = data.id;
		});
	}

	function updateTitle() {
		const name = getData('name') || getData('id');
		document.title = name + ' : FT Screens';
	}

	function checkIfViewerIsRunningInElectron(){
		return (navigator.userAgent.indexOf('Electron') > 0 && navigator.userAgent.indexOf('FTLabs-Screens') > 0);
	}

	function switchOutIframeForWebview(){

		const webViewElement = document.createElement('webview');

		webViewElement.setAttribute('class', DOM.Iframe.getAttribute('class'));

		DOM.Iframe.parentNode.removeChild(DOM.Iframe);
		DOM.Iframe = webViewElement;

		DOM.container.appendChild(DOM.Iframe);
 
	}

	data = JSON.parse(localStorage.getItem(LSKEY) || '{"items":[]}');

	// Backwards compat
	if (data.url) delete data.url;
	if (!data.items) data.items = [];

	// Every second, check whether the URL needs to be changed
	setInterval(poll, 1000);

	populateIDs();

	return {
		update: update,
		getData: getData,
		setConnectionState: setConnectionState,
		onChange: onChange,
		isElectron : checkIfViewerIsRunningInElectron,
		useWebview : switchOutIframeForWebview,
		DOM : DOM
	};

}(moment));

module.exports = __client;
