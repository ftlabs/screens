'use strict';
/*global describe, it, browser, xit, document*/

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const logs = require('./lib/logs')(browser);
const tabs = require('./lib/tabs')(browser);

chai.use(chaiAsPromised);

const expect = chai.expect;

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
		this.timeout(20000);
		const myUrl = 'http://example.com/';

		const url = tabs.admin()
			.setValue('#txturl', myUrl)
			.click('#selurlduration option[value="-1"]')
			.waitForExist('label[for=chkscreen-12345]')
			.click('label[for=chkscreen-12345]')
			.click('#btnsetcontent')
			.then(tabs.viewer)
			.waitUntil(function() {
				return browser.getAttribute('iframe','src').then(url => url.indexOf(myUrl) === 0);
			}, 19000)
			.getAttribute('iframe', 'src');

		return expect(url).to.eventually.equal(myUrl)
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
		const testWebsite = 'http://httpstat.us/200';

		const url = tabs.admin()
		.setValue('#txturl', testWebsite)
		.click('#selurlduration option[value="60"]')
		.waitForExist('label[for=chkscreen-12345]')
		.click('label[for=chkscreen-12345]')
		.click('#btnsetcontent')
		.then(tabs.viewer)
		.waitUntil(function () {
			return browser.getAttribute('iframe','src');
		})
		.getAttribute('iframe', 'src');

		expect(url).to.eventually.equal(testWebsite)
		.then(undefined, function (e) {

			// show browser console.logs
			return logs().then(function () {
				throw e;
			});
		});

		const noUrl = url.waitUntil(function () {
			return new Promise(function (resolve) {
				setTimeout(function () {
					resolve(true);
				}, 61000);
			})
		}, 62000)
		.waitUntil(function() {
			return browser.getAttribute('iframe','src');
		}, 19000)
		.getAttribute('iframe', 'src');

		return expect(noUrl).to.eventually.not.equal(testWebsite)
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

	it('removes a url after a specified amount of time', function () {
		const testWebsite = 'http://httpstat.us/200';
		const now = new Date()
		const hours = now.getHours();
		const minutes = now.getMinutes();
		const scheduledTime = hours + ':' + (minutes + 2);

		this.timeout(190000);

		const url = tabs.admin()
		.setValue('#txturl', testWebsite)
		.waitForExist('label[for=chkscreen-12345]')
		.click('label[for=chkscreen-12345]')
		.then(function () {
			return setDateTimeValue('#time', scheduledTime);
		})
		.execute(function() {
			document.getElementById('selurlduration').value = -1;
		})
		.click('#btnsetcontent')
		.then(tabs.viewer)
		.waitUntil(function () {
			return browser.getAttribute('iframe','src');
		})
		.waitUntil(function() {
			return browser.getAttribute('iframe','src');
		}, 180000)
		.getAttribute('iframe', 'src');

		return expect(url).to.eventually.not.equal(testWebsite)
		.then(undefined, function (e) {

			// show browser console.logs
			return logs().then(function () {
				throw e;
			});
		});
	});

	/**
	* Load Url to the screen then remove it via admin panel
	*
	*/

	it('removes a url via the admin panel', function () {
		const testWebsite = 'http://example.com/?1';

		this.timeout(60000);

		const content = tabs.admin()
		.setValue('#txturl', testWebsite)
		.waitForExist('label[for=chkscreen-12345]')
		.click('label[for=chkscreen-12345]')
		.click('#btnsetcontent')
		.then(tabs.viewer)
		.waitUntil(function() {
			return browser.getAttribute('iframe','src').then(function (url) {
				return url === testWebsite;
			});
		})
		.then(tabs.admin)
		.waitForExist('.action-remove')
		.execute(function() {
			return document.querySelector('.action-remove').click();
		})
		.then(tabs.viewer)
		.waitUntil(function() {
			return browser.getAttribute('iframe','src');
		})
		.getAttribute('iframe', 'src');

		return expect(content).to.eventually.not.equal(testWebsite)
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

	xit('can clear the stack of content via admin panel', function () {

	});
});
