'use strict';
/*global describe, it, browser*/

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);

const expect = chai.expect;

describe('Big FT website', () => {
	it('has "FT Screens" as the heading', function () {

		const title = browser
			.url('/admin')
			.waitForText('h1.o-header__title')
			.getText('h1.o-header__title');

		return expect(title).to.eventually.equal('FT Screens');
	});
});
