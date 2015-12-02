"use strict";
var authS3O = require('s3o-middleware');

module.exports = function(req, res, next) {
	if (req.originalUrl.indexOf('/generators/') === 0 && Object.keys(req.query).length !== 0) {
		next();
	} else if (req.query.redirect === 'true') {
		next();
	} else {

		// since it maybe used in a middleware restore original url to the request object.
		const oldUrl = req.url;
		req.url = req.originalUrl;
		authS3O(req, res, function () {

			// restore the old url for routing purposes
			req.url = oldUrl;
			next();
		});
	}
};
