'use strict';
/*global describe, it, browser, before, afterEach, beforeEach*/

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const browserLogs = require('./lib/logs')(browser);
const tabController = require('./lib/tabs').getTabController(browser);
const tabs = tabController.tabs;
const Tab = tabController.Tab;
const debounce = require('lodash.debounce');
const debouncedLog = debounce(function (a) {
	console.log(a);
}, 1500);
chai.use(chaiAsPromised);

const expect = chai.expect;

const emptyScreenWebsite = 'http://localhost:3010/generators/empty-screen?id=12345';

function waitABit() {
	return new Promise(resolve => setTimeout(resolve, 10000));
}

// go to the admin page set a url
function addItem(url, duration, scheduledTime) {

	// 0 or undefined are not valid durations
	duration = duration || 60;

	// Log to the console what is about to be done
	console.log(`Setting Url: ${url}
Duration: ${duration}`);

	return tabs['admin'].switchTo()
		.waitForExist('#chkscreen-12345')
		.click(`#selection option[value="set-content"]`)
		.click(`#selurlduration option[value="${duration}"]`)
		.setValue('#txturl', url)
		.isSelected('#chkscreen-12345')
		.then(tick => {
			console.log('Submitting request');
			if (!tick) return browser.click('label[for=chkscreen-12345]');
		})
		.click('#btnsetcontent');
}

// go to the admin page pop off the top of the queue
function removeItem(url) {
	const xSelector = `.queue li[data-url="${url}"] .action-remove`;

	return tabs['admin'].switchTo()
		.waitForExist(xSelector)
		.click(xSelector)
		.then(undefined, function (e) {
			console.warn('Remove item failed');
			console.warn(e);
		});
}

function printLogOnError(e) {

	// show browser console.logs
	return browserLogs()
	.then(function (logs) {
		console.log('BROWSER LOGS: \n' + logs);
		throw e;
	});
}

function logs() {
	browserLogs()
	.then(function () {

		// Do nothing so that they get flushed
	});
}

function waitForIFrameUrl(urlIn, timeout) {

	let oldUrl;
	timeout = timeout || 10000;

	console.log('Waiting for iframe to become url: ' + urlIn + ', ' + timeout + ' timeout');

	return tabs['viewer'].switchTo()
		.waitForExist('iframe.active')
		.getAttribute('iframe.active','src')
		.then(url => console.log(`Url was initially ${url}`))
		.waitUntil(function() {

			// wait for the iframe's url to change
			return browser
			.waitForExist('iframe.active')
			.getAttribute('iframe.active','src')
			.then(url => {
				debouncedLog('Last url: ' + url);
				oldUrl = url;
				return url.indexOf(urlIn) === 0;
			});
		}, timeout) // default timeout is
		.then(() => debouncedLog('MATCH!!'))
		.then(waitABit)
		.catch(e => {
			const newMessage = `Errored waiting for url to load in iframe: ${urlIn} url was ${oldUrl}`;
			console.log(e.message);
			console.log(newMessage);
			throw Error(newMessage);
		});
	;
}

describe('Viewer responds to API requests', () => {

	const initialUrl = 'http://ftlabs-screens.herokuapp.com/generators/markdown?md=%23Initial&theme=dark';

	before('gets an ID', function () {

		const id = tabs['viewer'].switchTo()
			.waitForText('#hello .screen-id')
			.waitForVisible('#hello .screen-id')
			.getText('#hello .screen-id')
			.then(undefined, function (e) {
				console.log(e);
			});

		return expect(id).to.eventually.equal('12345')
		.then(logs, printLogOnError);
	});

	beforeEach(function(){
		console.log(`Starting: "${this.currentTest.title}"`)
		console.log('↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓\n');
	});

	afterEach(function(){
		console.log('\n↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑↑');
		console.log(`Completed: "${this.currentTest.title}"`);
	});

	/**
	* Load Url
	*
	* Add a url to a screen it should now show the new url,
	* this should be set to not expire. it'll be present through out all
	* the test except at the end of the final test which clears all urls.
	*/

	it('can have a url assigned', function () {

		this.timeout(45000);

		return addItem(initialUrl, -1)
			.then(() => waitForIFrameUrl(initialUrl))
			.then(logs, printLogOnError);
	});

	/**
	* Can have url removed
	*/

	it('removes a url via the admin panel', function () {

		const testWebsite = 'http://ftlabs-screens.herokuapp.com/generators/markdown?md=%23One&theme=dark';

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

		this.timeout(45000);

		const emptyResponseUrl = 'http://localhost:3011/emptyresponse';
		return addItem(emptyResponseUrl)
			.then(() => tabs['viewer'].switchTo())
			.then(() => waitForIFrameUrl(emptyResponseUrl))
			.then(() => removeItem(emptyResponseUrl))
			.then(() => waitForIFrameUrl(initialUrl))
			.then(logs, printLogOnError);
	});


	/**
	 * Can correctly idenitify an image
	 */

	it('correctly processes an image url', function () {

		this.timeout(45000);

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
		const testWebsite = 'http://ftlabs-screens.herokuapp.com/generators/markdown?md=%23Three&theme=dark';

		return addItem(testWebsite)
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
	* Close the viewer tab
	* Change the localStorage to have no idUpdated and name but the same id.
	* Expect the id to be changed
	*/

	xit('will have it\'s id reassigned', function () {
		this.timeout(120000);

		return tabs['viewer'].close()
		.then(() => tabs['about'].switchTo())
		.localStorage('POST', {key: 'viewerData_v2', value: JSON.stringify(
			{
				id:12345,
				items:[],
				name:'Test Page 2',
				idUpdated: Date.now()
			}
		)})
		.then(function () {
			const newViewerTab = new Tab('viewer', {
				url: '/'
			});
			return newViewerTab.ready();
		})
		.then(waitABit) // wait a few seconds for a bit of back and forth to get the id reassigned
		.then(() => {
			const id = browser
			.getText('#hello .screen-id')
			.then(undefined, function (e) {
				console.log(e);
			});

			return expect(id).to.eventually.not.equal('12345')
		})
		.then(logs, printLogOnError);
	});
});
