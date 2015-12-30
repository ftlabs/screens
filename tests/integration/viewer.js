'use strict';
/*global describe, it, browser, before*/

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const logs = require('./lib/logs')(browser);
const tabs = require('./lib/tabs')(browser);
const express = require('express');

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


// go to the admin page set a url
function addItem(url, duration) {

	// 0 or undefined are not valid durations
	duration = duration || 60;

	return tabs.admin()
		.waitForExist('label[for=chkscreen-12345]')
		.isSelected('#chkscreen-12345')
		.then(tick => {
			if (!tick) return browser.click('label[for=chkscreen-12345]');
		})
		.click(`#selurlduration option[value="${duration}"]`)
		.setValue('#txturl', url)
		.click('#btnsetcontent');
}

// go to the admin page pop off the top of the queue
function popItem() {
	const xSelector = '.queue li:first-child .action-remove';

	return tabs.admin()
		.waitForExist(xSelector)
		.click(xSelector);
}

function printLogOnError(e) {

	// show browser console.logs
	return logs()
	.then(function () {
		throw e;
	});
}

describe('Viewer responds to API requests', () => {

	before('Start a http server with some test pages in it', function() {
		const testWebsiteServer = express();
		testWebsiteServer.get('/emptyresponse', (req,res) => res.status(200).end());
		testWebsiteServer.listen(3011);
	});

	const initialUrl = 'http://example.com/';

	it('gets an ID', function () {

		const id = tabs.viewer()
			.waitForText('#hello .screen-id')
			.waitForVisible('#hello .screen-id')
			.getText('#hello .screen-id');

		return expect(id).to.eventually.equal('12345')
		.then(undefined, printLogOnError);
	});


	/**
	* Load Url
	*
	* Add a url to a screen it should now show the new url,
	* this should be set to not expire.
	*/

	it('can have a url assigned', function () {

		return addItem(initialUrl, -1)
			.then(tabs.viewer)
			.waitUntil(function() {

				// wait for the iframe's url to change
				return browser.getAttribute('iframe','src')
				.then(url => url.indexOf(initialUrl) === 0);
			}, 9000) // default timeout is 500ms
			.then(undefined, printLogOnError);
	});


	/**
	 * Can add a url which has an empty response
	 */

	it('Can add a url which has an empty response', function () {

		const emptyResponseUrl = 'http://localhost:3011/emptyresponse';
		return addItem(emptyResponseUrl)
			.then(tabs.viewer)
			.waitUntil(function() {

				// wait for the iframe's url to change
				return browser.getAttribute('iframe','src')
				.then(url => url.indexOf(emptyResponseUrl) === 0);
			}, 30000) // default timeout is 500ms
			.then(popItem)
			.then(undefined, printLogOnError);
	});


	/**
	 * Can correctly idenitify an image
	 */

	it('Can add an image url assigned and correctly changes it', function () {
		const imageGeneratorUrl = 'http://localhost:3010/generators/image/?https%3A%2F%2Fimage.webservices.ft.com%2Fv1%2Fimages%2Fraw%2F';
		const imageResponseUrl = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Small_bird_perching_on_a_branch.jpg/512px-Small_bird_perching_on_a_branch.jpg';
		return addItem(imageResponseUrl)
			.then(tabs.viewer)
			.waitUntil(function() {

				// wait for the iframe's url to change
				return browser.getAttribute('iframe','src')
				.then(url => url.indexOf(imageGeneratorUrl) === 0);
			}, 30000) // default timeout is 500ms
			.then(popItem)
			.then(undefined, printLogOnError);
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
		const testWebsite = 'http://httpstat.us/200';

		return addItem(testWebsite)
		.then(tabs.viewer)
		.waitUntil(function () {

			startTime = Date.now();

			// Wait for the iframe's src url to change
			return browser.getAttribute('iframe','src')
			.then(url => url.indexOf(testWebsite) === 0);

		}, 9000) // default timeout is 500ms
		.waitUntil(function () {

			// Wait for the iframe's src url to change
			return browser.getAttribute('iframe','src')
			.then(url => url.indexOf(initialUrl) === 0);

		}, 69000) // default timeout is 500ms
		.then(function () {
			if (Date.now() - startTime < 59000) {
				throw Error('The website expired too quickly!');
			}
		})
		.then(undefined, function (e) {

			// show browser console.logs
			return logs().then(function () {
				throw e;
			});
		});
	});

	/**
	* Load another Url to the screen this scheduled for the minute after next
	*
	* Add a url to a screen it should not change until the minute ticks over
	*/

	it('loads a url on a specified time', function () {
		const testWebsite = 'http://httpstat.us/200';
		const now = new Date();
		const hours = now.getHours();
		const minutes = now.getMinutes();
		const scheduledTime = hours + ':' + (minutes + 2);

		this.timeout(190000);

		const url = tabs.admin()
		.setValue('#txturl', testWebsite)
		.waitForExist('label[for=chkscreen-12345]')
		.isSelected('#chkscreen-12345').then(tick => {
			if (!tick) return browser.click('label[for=chkscreen-12345]');
		})
		.then(function () {
			return setDateTimeValue('#time', scheduledTime);
		})
		.selectByVisibleText('#selurlduration', 'until cancelled')
		.click('#btnsetcontent')
		.then(tabs.viewer)
		.waitUntil(function () {
			return browser.getAttribute('iframe','src').then(url => {
				return url === testWebsite;
			});
		}, 180000)
		.getAttribute('iframe', 'src');

		return expect(url).to.eventually.equal(testWebsite)
		.then(undefined, function (e) {

			// show browser console.logs
			return logs().then(function () {
				throw e;
			});
		});
	});

	/**
	* Remove the previusly added url
	*/

	it('removes a url via the admin panel', function () {
		const xSelector = '.queue li:first-child .action-remove';

		this.timeout(60000);

		return tabs.admin()
		.waitForExist(xSelector)
		.click(xSelector)
		.then(tabs.viewer)
		.waitUntil(function() {

			// Wait for the iframe's src url to change
			return browser.getAttribute('iframe','src')
			.then(url => url.indexOf(initialUrl) === 0);

		}, 5000)
		.then(undefined, function (e) {

			// show browser console.logs
			return logs().then(function () {
				throw e;
			});
		});
	});

	/**
	* Clear all Urls
	*
	* It should hide the iframe or display the empty-screen generator
	*/

	it('can clear the stack of content via admin panel', function () {
		const testWebsite = 'http://example.com/?2';

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
		}, 10000)
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
		.then(undefined, function (e) {

			// show browser console.logs
			return logs().then(function () {
				throw e;
			});
		});
	});
});
