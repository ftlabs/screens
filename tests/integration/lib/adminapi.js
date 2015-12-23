'use strict';
const fetch = require('node-fetch');

/**
 * adminapi.js
 *
 * This is for testing the client. Spec out the api requests sent from the admin interface to the server.
 * We will then spoof these do the server, we will then check that the client is controlled appropriately.
 * 
 */

module.exports = function (apiUrl) {

	/**
	 * Send an api request to the server, 
	 * 
	 * @param  {Integer||Array} screensId		Id of the screen to update
	 * @param  {String}  url			  Url to add
	 * @param  {Integer} duration		 how long it should be shown
	 * @param  {Integer} dateTimeSchedule timestamp it is scheduled for, should be scheduled to the nearest minute
	 * @return {void}					 
	 */
	function loadUrl(screensId, url, duration, dateTimeSchedule) {
		return fetch(apiUrl + '/api/addUrl', {
			method: 'POST',
			headers: {
				Cookie: "webdriver=__webdriverTesting__",
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				screens: screensId.constructor === Array ? screensId.map(id => id.toString()).join(',') : screensId.toString(),
				url,
				duration,
				dateTimeSchedule
			})
		});
	}

	return {
		loadUrl
	};
};
