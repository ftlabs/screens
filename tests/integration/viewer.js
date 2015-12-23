'use strict';
/*global describe, it, browser*/

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const logs = require('./lib/logs.js')(browser);
const api = require('./lib/adminapi.js')('http://localhost:3010');

chai.use(chaiAsPromised);

const expect = chai.expect;

describe('Viewer responds to API requests', () => {
	it('gets an ID', function () {

		const id = browser
			.url('/')
			.waitForText('#hello .screen-id')
			.getText('#hello .screen-id');

		return expect(id).to.eventually.equal('12345').then(undefined, function (e) {

			// show browser console.logs
			logs();
			throw e;
		});
	});


	/**
	* Load Url
	*
	* Add a url to a screen it should now show the new url
	*/
	it('can have a url assigned', function () {
		return api.loadUrl(12345, 'http://ft.com')
			.then(() => browser.waitUntil(function() {
				return this.getAttribute('iframe','src').then(function(url) {
					return url === 'https://ada.is'
				});
			}))
			.then(undefined, function (e) {

				// show browser console.logs
				logs();
				throw e;
			});
	});

	/**
	* Load another Url to the screen
	*
	* Add a url to a screen it should now be the new url
	*/

	/**
	* Load another Url to the screen this should expire after 30s
	*
	* Add a url to a screen it should now be the new url, after 30s it should expire back to the previous url
	*/

	/**
	* Load another Url to the screen this scheduled for the turn of the next minute
	* 
	* Add a url to a screen it should not change until the minute ticks over
	*/

	/**
	* Load another Url to the screen wait a bit then remove it
	*
	* It should change then go back to the previous url
	*/

	/**
	* Clear all Urls
	* 
	* It should hide the iframe or display the empty-screen generator
	 */
});
