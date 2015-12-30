'use strict';
/*global describe, it, browser, xit, document*/

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

describe('Viewer responds to API requests', () => {

	it('gets an ID', function () {

		const id = tabs.viewer()
			.waitForText('#hello .screen-id')
			.waitForVisible('#hello .screen-id')
			.getText('#hello .screen-id');

		return expect(id).to.eventually.equal('12345')
		.then(undefined, function (e) {

			// show browser console.logs
			return logs().then(function () {
				throw e;
			});
		});
	});


	/**
	* Load Url
	*
	* Add a url to a screen it should now show the new url,
	* this should be set to not expire.
	*/

	it('can have a url assigned', function () {
		const initialUrl = 'http://example.com/';

		const url = tabs.admin()
			.waitForExist('label[for=chkscreen-12345]')
			.isSelected('#chkscreen-12345')
			.then(tick => {
				if (!tick) return browser.click('label[for=chkscreen-12345]');
			})
			.setValue('#txturl', initialUrl)
			.click('#selurlduration option[value="-1"]')
			.click('#btnsetcontent')
			.then(tabs.viewer)
			.waitUntil(function() {

				// wait for the iframe's url to change
				return browser.getAttribute('iframe','src')
				.then(url => url.indexOf(initialUrl) === 0);
			}, 9000) // default timeout is 500ms
			.getAttribute('iframe', 'src');

		return expect(url).to.eventually.equal(initialUrl)
		.then(undefined, function (e) {

			// show browser console.logs
			return logs().then(function () {
				throw e;
			});
		});

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

		return tabs.admin()
		.waitForExist('label[for=chkscreen-12345]')
		.isSelected('#chkscreen-12345').then(tick => {
			if (!tick) return browser.click('label[for=chkscreen-12345]');
		})
		.setValue('#txturl', testWebsite)
		.click('#selurlduration option[value="60"]')
		.click('#btnsetcontent')
		.then(tabs.viewer)
		.waitUntil(function () {

			startTime = Date.now();

			// Wait for the iframe's src url to change
			return browser.getAttribute('iframe','src')
			.then(url => url === testWebsite);

		}, 9000) // default timeout is 500ms
		.waitUntil(function () {

			// Wait for the iframe's src url to change
			return browser.getAttribute('iframe','src')
			.then(url => url !== testWebsite);

		}, 69000) // default timeout is 500ms
		.then(function () {
			if (Date.now() - startTime < 50000) {
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

		url.then((url) => {
			console.log(scheduledTime, url, testWebsite)
		})

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
			.then(url => url !== 'http://httpstat.us/200');

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
		}, 20000)
		.then(undefined, function (e) {

			// show browser console.logs
			return logs().then(function () {
				throw e;
			});
		});
	});
});
