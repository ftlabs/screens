'use strict';

const auth = require('basic-auth');

function testSuite(req) {
	if (process.env.NODE_ENV === 'production') return false;
	if (req.cookies.webdriver === '__webdriverTesting__') {
		req.cookies.s3o_username = 'selenium.test-user';
		return true;
	}
	return false;
}

module.exports = function(req, res, next) {
	if (testSuite(req)) next();
	var credentials = auth(req);
	if (!credentials || credentials.name !== process.env.AUTH_HTTP_BASIC_NAME || credentials.pass !== process.env.AUTH_HTTP_BASIC_PASS) {
		res.statusCode = 401;
		res.setHeader('WWW-Authenticate', 'Basic realm="Screen Admin"')
		res.end('Access denied');
	} else {
		next();
	}
};
