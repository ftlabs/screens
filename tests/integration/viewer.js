'use strict';
/*global describe, it, browser*/

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const logs = require('./lib/logs.js');

chai.use(chaiAsPromised);

const expect = chai.expect;

describe('Viewer responds to API requests', () => {
	it('gets an ID', function () {

		const id = browser
			.url('/')
			.waitForText('#hello .screen-id')
			.getText('#hello .screen-id');

		return expect(id).to.eventually.equal('12345').then(undefined, logs(browser));
	});
});
