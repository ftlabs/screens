'use strict';

// TODO AE07122015: Once further tests are written encorporate them into the healthcheck

const path = require('path');
const Mocha = require('mocha');

const mocha = new Mocha();
mocha.addFile(path.join(__dirname, 'test.js'));

// Return a promise that resolves to a set of healthchecks
module.exports = function() {

	// You might have several async checks that you need to perform or
	// collect the results from, this is a really simplistic example
	return new Promise(function(resolve) {
		mocha.run(function (failures) {
			if (failures === 0) {
				resolve([
					{
						name: 'URL Transform Tests Passing',
						ok: true,
						severity: 2,
						businessImpact: 'TODO',
						technicalSummary: 'TODO',
						panicGuide: 'TODO',
						checkOutput: 'TODO',
						lastUpdated: new Date().toISOString()
					}
				]);
			} else {
				resolve([
					{
						name: 'Failing to convert URLs',
						ok: false,
						severity: 2,
						businessImpact: 'TODO',
						technicalSummary: 'TODO',
						panicGuide: 'TODO',
						checkOutput: 'TODO',
						lastUpdated: new Date().toISOString()
					}
				]);
			}
		});
	});
};
