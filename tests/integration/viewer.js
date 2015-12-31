'use strict';
/*global describe, it, browser*/

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const logs = require('./lib/logs')(browser);
const tabs = require('./lib/tabs')(browser);
chai.use(chaiAsPromised);

const expect = chai.expect;

const emptyScreenWebsite = 'http://localhost:3010/generators/empty-screen?id=12345';

function setDateTimeValue (selector, value) {
	return browser.elements(selector).then(function(res) {
		const self = browser;
		const elementIdValueCommands = res.value.map(function(elem) {
			return self.elementIdValue(elem.ELEMENT, String(value));
		});

		return this.unify(elementIdValueCommands, {
			extractValue: true
		});
	});
}

function resetDateTimeValue (selector) {
	return browser.elements(selector).then(function(res) {
		const self = browser;
		const elementIdValueCommands = res.value.map(function(elem) {
			return self.elementIdValue(elem.ELEMENT, '');
		});

		return this.unify(elementIdValueCommands, {
			extractValue: true
		});
	});
}

// go to the admin page set a url
function addItem(url, duration, scheduledTime) {

	// 0 or undefined are not valid durations
	duration = duration || 60;

	return tabs.admin()
		.waitForExist('#chkscreen-12345')
		.waitForExist('label[for=chkscreen-12345]')
		.isSelected('#chkscreen-12345')
		.then(tick => {
			if (!tick) return browser.click('label[for=chkscreen-12345]');
		})
		.click(`#selurlduration option[value="${duration}"]`)
		.then(function () {
			if (scheduledTime) return setDateTimeValue('#time', scheduledTime);
			return resetDateTimeValue('#time');
		})
		.setValue('#txturl', url)
		.then(() => console.log(`
Setting Url: ${url}
Duration: ${duration}
Scheduled: ${scheduledTime}`))
		.click('#btnsetcontent');
}

// go to the admin page pop off the top of the queue
function removeItem(url) {
	const xSelector = `.queue li[data-url="${url}"] .action-remove`;

	return tabs.admin()
		.waitForExist(xSelector)
		.click(xSelector);
}

function printLogOnError(e) {

	// show browser console.logs
	return logs()
	.then(function (logs) {
		console.error(e.message);
		console.log('BROWSER LOGS: \n' + logs);
		throw e;
	});
}

function waitForIFrameUrl(urlIn, timeout) {

	let oldUrl;
	timeout = timeout || 10000;

	console.log('Waiting for iframe to become url: ' + urlIn + ', ' + timeout + ' timeout');

	return tabs.
		viewer()
		.waitUntil(function() {

			// wait for the iframe's url to change
			return browser.getAttribute('iframe','src')
			.then(url => {
				oldUrl = url;
				return url.indexOf(urlIn) === 0;
			});
		}, timeout) // default timeout is 

		.then(undefined, e => {
			const newMessage = `Errored waiting for url to load in iframe: ${urlIn} url was ${oldUrl}`;
			console.log(e.message);
			console.log(newMessage);
			throw Error(newMessage);
		});
	; 
}

describe('Viewer responds to API requests', () => {

	const initialUrl = 'http://example.com/?initial-url';

	it('gets an ID', function () {

		const id = tabs.viewer()
			.waitForText('#hello .screen-id')
			.waitForVisible('#hello .screen-id')
			.getText('#hello .screen-id');

		return expect(id).to.eventually.equal('12345')
		.then(logs, printLogOnError);
	});


	/**
	* Load Url
	*
	* Add a url to a screen it should now show the new url,
	* this should be set to not expire. it'll be present through out all
	* the test except at the end of the final test which clears all urls.
	*/

	it('can have a url assigned', function () {

		return addItem(initialUrl, -1)
			.then(() => waitForIFrameUrl(initialUrl))
			.then(logs, printLogOnError);
	});

	/**
	* Can have url removed
	*/

	it('removes a url via the admin panel', function () {
		const testWebsite = 'http://example.com/?1';

		this.timeout(60000);

		return addItem(testWebsite)
			.then(() => waitForIFrameUrl(testWebsite))
			.then(() => removeItem(testWebsite))
			.then(() => waitForIFrameUrl(initialUrl))
			.then(logs, printLogOnError); });

	/**
	 * Can add a url which has an empty response
	 */

	it('Can add a url which has an empty response', function () {

		const emptyResponseUrl = 'http://localhost:3011/emptyresponse';
		return addItem(emptyResponseUrl)
			.then(tabs.viewer)
			.then(() => waitForIFrameUrl(emptyResponseUrl))
			.then(() => removeItem(emptyResponseUrl))
			.then(() => waitForIFrameUrl(initialUrl))
			.then(logs, printLogOnError);
	});


	/**
	 * Can correctly idenitify an image
	 */

	it('Can add an image url assigned and correctly changes it', function () {
		const imageGeneratorUrl = 'http://localhost:3010/generators/image/?https%3A%2F%2Fimage.webservices.ft.com%2Fv1%2Fimages%2Fraw%2Fhttps%253A%252F%252Fupload.wikimedia.org%252Fwikipedia%252Fcommons%252Fthumb%252F3%252F30%252FSmall_bird_perching_on_a_branch.jpg%252F512px-Small_bird_perching_on_a_branch.jpg%3Fsource%3Dscreens&title=512px-Small_bird_perching_on_a_branch.jpg';
		const imageResponseUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Small_bird_perching_on_a_branch.jpg/512px-Small_bird_perching_on_a_branch.jpg';
		return addItem(imageResponseUrl)
			.then(() => waitForIFrameUrl(imageGeneratorUrl))
			.then(() => removeItem(imageGeneratorUrl))
			.then(() => waitForIFrameUrl(initialUrl))
			.then(logs, printLogOnError);
	});


	/**
	* Load another Url to the screen that expires after 60s
	*
	* Add a url to a screen it should now be the new url
	*
	* After 60s it should be removed
	*/

	it('removes a url after a specified amount of time', function () {
		this.timeout(120000);

		let startTime;
		const testWebsite = 'http://example.com/?1';

		return addItem(testWebsite)
			.then(tabs.viewer)
			.then(() => waitForIFrameUrl(testWebsite))
			.then(() => (startTime = Date.now()))
			.then(() => waitForIFrameUrl(initialUrl, 69000))
			.then(function () {
				if (Date.now() - startTime < 59000) {
					throw Error('The website expired too quickly! ' + (Date.now() - startTime));
				}
			})
			.then(logs, printLogOnError);
	});

	/**
	* Load another Url to the screen this scheduled for the minute after next
	*
	* Add a url to a screen it should not change until the minute ticks over
	*/

	it('loads a url on a specified time', function () {
		const testWebsite = 'http://example.com/?2';
		const now = new Date();
		const hours = now.getHours();
		const minutes = now.getMinutes();
		const scheduledTime = hours + ':' + (minutes + 2);

		this.timeout(190000);

		const url = addItem(testWebsite, -1, scheduledTime)
		.then(() => waitForIFrameUrl(testWebsite, 185000))
		.getAttribute('iframe', 'src');

		return expect(url).to.eventually.equal(testWebsite)
		.then(() => removeItem(testWebsite))
		.then(logs, printLogOnError)
		.then(() => waitForIFrameUrl(initialUrl, 185000));
	});

	/**
	* Clear all Urls
	*
	* It should hide the iframe or display the empty-screen generator
	*/

	it('can clear the stack of content via admin panel', function () {
		const testWebsite = 'http://example.com/?4';

		this.timeout(60000);

		const content = tabs.admin()
		.setValue('#txturl', testWebsite)
		.waitForExist('label[for=chkscreen-12345]', 10000)
		.isSelected('#chkscreen-12345').then(tick => {
			if (!tick) {
				return browser.click('label[for=chkscreen-12345]');
			}
		})
		.click('#btnsetcontent')
		.then(tabs.viewer)
		.waitUntil(function() {
			return browser.getAttribute('iframe','src').then(function (url) {
				return url === testWebsite;
			});
		}, 20000)
		.then(tabs.admin)
		.isSelected('#chkscreen-12345').then(tick => {
			if (!tick) {
				return browser.click('label[for=chkscreen-12345]');
			}
		})
		.selectByVisibleText('#selection', 'Clear')
		.click('#btnclear')
		.then(tabs.viewer)
		.waitUntil(function() {
			return browser.getAttribute('iframe','src')
			.then(function (url) {
				return url === emptyScreenWebsite;
			});
		}, 10000)
		.getAttribute('iframe', 'src');

		return expect(content).to.eventually.not.equal(testWebsite)
		.then(logs, printLogOnError);
	});
});
