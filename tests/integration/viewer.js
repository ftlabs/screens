'use strict';
/*global describe, it, browser*/

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const logs = require('./lib/logs')(browser);
const tabs = require('./lib/tabs')(browser);

chai.use(chaiAsPromised);

const expect = chai.expect;

describe('Viewer responds to API requests', () => {

	it('gets an ID', function () {

		const id = tabs.viewer()
			.waitForExist('#hello .screen-id')
			.waitForText('#hello .screen-id')
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
	* Add a url to a screen it should now show the new url
	*/
	it('can have a url assigned', function () {
		this.timeout(20000);
		const title = tabs.admin()
			.waitForText('h1.o-header__title')
			.getText('h1.o-header__title');
		
		return expect(title).to.eventually.equal('FT Screens')
		.then(undefined, function (e) {

			// show browser console.logs
			return logs().then(function () {
				throw e;
			});
		});;

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
